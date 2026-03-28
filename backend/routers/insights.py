from fastapi import APIRouter, HTTPException
from graph.queries import (get_user, get_history,
                           get_baseline, get_recent_avg,
                           get_semester_week)
from routers.patterns import detect_shifts
from ai.claude import generate_insight

router = APIRouter()

@router.get("/{uid}")
def get_insight(uid: str):
    user = get_user(uid)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    history     = get_history(uid, days=14)
    baseline    = get_baseline(uid)
    recent      = get_recent_avg(uid, days=7)
    week_number = get_semester_week(user["semester_start"])

    if not history or len(history) < 3:
        return {
            "user_id": uid,
            "status":  "not_enough_data",
            "message": (
                "Chhaya needs at least 3 days of check-ins "
                "before it can generate an insight. "
                "Keep showing up — it is watching."
            ),
            "insight": None
        }

    # Detect shifts for context
    shifts = []
    if baseline and recent:
        shifts = detect_shifts(baseline, recent)

    # Clean history for prompt
    clean_history = [dict(e["b"]) for e in history]

    # Generate insight via Claude
    insight_text = generate_insight(
        user        = user,
        history     = clean_history,
        shifts      = shifts,
        week_number = week_number
    )

    return {
        "user_id":     uid,
        "status":      "ready",
        "week_number": week_number,
        "shifts":      shifts,
        "insight":     insight_text,
        "disclaimer":  (
            "Chhaya is a behavioral tracking tool, not a medical application. "
            "It does not diagnose or treat any condition. "
            "If you are struggling, please reach out to your campus "
            "counseling center or text HOME to 741741."
        )
    }
