from fastapi import APIRouter, HTTPException
from graph.queries import (get_user, get_baseline, 
                           get_recent_avg, get_alerts, 
                           save_alert, get_semester_week)
from datetime import date as dt

router = APIRouter()

# ─── Thresholds ───────────────────────────────────────────────
# These are the shifts we consider significant
# All grounded in published behavioral research

THRESHOLDS = {
    "sleep":              1.0,
    "attendance":         0.15,
    "left_room":          0.20,
    "ate_meal":           0.20,
    "perf_gap":           1.0,
    "cognitive_friction": 0.30,
    "actual_sunlight":    0.30,
    "completion_sense":   0.30,
}

# ─── Pattern Detection Logic ──────────────────────────────────

def detect_shifts(baseline: dict, recent: dict) -> list:
    shifts = []

    if baseline.get("avg_sleep") and recent.get("avg_sleep"):
        diff = baseline["avg_sleep"] - recent["avg_sleep"]
        if diff >= THRESHOLDS["sleep"]:
            shifts.append({
                "type":     "sleep_drop",
                "severity": "high" if diff >= 2.0 else "medium",
                "message":  f"Your sleep has dropped {round(diff, 1)} hours "
                            f"from your personal baseline. "
                            f"Research shows even one hour less sleep "
                            f"measurably affects focus and mood.",
                "diff":     round(diff, 1)
            })

    if baseline.get("avg_attendance") and recent.get("avg_attendance"):
        diff = baseline["avg_attendance"] - recent["avg_attendance"]
        if diff >= THRESHOLDS["attendance"]:
            shifts.append({
                "type":     "attendance_drop",
                "severity": "high" if diff >= 0.30 else "medium",
                "message":  f"You are attending {round(diff * 100)}% fewer "
                            f"classes than your normal pattern. "
                            f"This is one of the earliest measurable signals "
                            f"of academic stress.",
                "diff":     round(diff, 2)
            })

    if baseline.get("avg_left_room") and recent.get("avg_left_room"):
        diff = baseline["avg_left_room"] - recent["avg_left_room"]
        if diff >= THRESHOLDS["left_room"]:
            shifts.append({
                "type":     "isolation",
                "severity": "high" if diff >= 0.40 else "medium",
                "message":  f"You have been leaving your room significantly "
                            f"less than your usual pattern. "
                            f"Voluntary isolation is one of the most "
                            f"well-documented signs of declining wellbeing "
                            f"in college students.",
                "diff":     round(diff, 2)
            })

    if baseline.get("avg_ate_meal") and recent.get("avg_ate_meal"):
        diff = baseline["avg_ate_meal"] - recent["avg_ate_meal"]
        if diff >= THRESHOLDS["ate_meal"]:
            shifts.append({
                "type":     "nutrition",
                "severity": "medium",
                "message":  f"You have been skipping meals more than usual. "
                            f"Irregular eating patterns are linked to "
                            f"increased stress and low self-prioritization.",
                "diff":     round(diff, 2)
            })

    if baseline.get("avg_gap") and recent.get("avg_gap"):
        diff = recent["avg_gap"] - baseline["avg_gap"]
        if diff >= THRESHOLDS["perf_gap"]:
            shifts.append({
                "type":     "performance_gap",
                "severity": "high" if diff >= 2.0 else "medium",
                "message":  f"The gap between how you feel inside and how "
                            f"you show up has widened significantly. "
                            f"This emotional masking has a real energy cost "
                            f"that compounds over time.",
                "diff":     round(diff, 2)
            })

    if baseline.get("avg_cognitive_friction") is not None and \
       recent.get("avg_cognitive_friction") is not None:
        diff = recent["avg_cognitive_friction"] - \
               baseline["avg_cognitive_friction"]
        if diff >= THRESHOLDS["cognitive_friction"]:
            shifts.append({
                "type":     "cognitive_friction",
                "severity": "high" if diff >= 0.50 else "medium",
                "message":  "You have been finding it harder than usual "
                            "to start tasks. This is one of the earliest "
                            "neurological signals of stress — your brain's "
                            "activation energy is elevated. "
                            "Start with the smallest possible task today.",
                "diff":     round(diff, 2)
            })

    if baseline.get("avg_actual_sunlight") is not None and \
       recent.get("avg_actual_sunlight") is not None:
        diff = baseline["avg_actual_sunlight"] - \
               recent["avg_actual_sunlight"]
        if diff >= THRESHOLDS["actual_sunlight"]:
            shifts.append({
                "type":     "sunlight_drop",
                "severity": "medium",
                "message":  "You have been getting significantly less "
                            "natural daylight than your usual pattern. "
                            "Retinal light exposure directly drives "
                            "serotonin synthesis — even 10 minutes "
                            "outside makes a measurable difference.",
                "diff":     round(diff, 2)
            })

    if baseline.get("avg_completion_sense") is not None and \
       recent.get("avg_completion_sense") is not None:
        diff = baseline["avg_completion_sense"] - \
               recent["avg_completion_sense"]
        if diff >= THRESHOLDS["completion_sense"]:
            shifts.append({
                "type":     "completion_drop",
                "severity": "medium",
                "message":  "You have been finishing fewer intended tasks "
                            "than your usual pattern. This 'unfinished' "
                            "feeling compounds — each incomplete task adds "
                            "cognitive load. Pick one tiny thing today "
                            "and finish just that.",
                "diff":     round(diff, 2)
            })

    return shifts

# ─── Routes ───────────────────────────────────────────────────

@router.get("/{uid}")
def get_patterns(uid: str):
    user = get_user(uid)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    baseline = get_baseline(uid)
    recent   = get_recent_avg(uid, days=7)

    if not baseline or not recent:
        return {
            "user_id":      uid,
            "status":       "building_baseline",
            "message":      "Chhaya is still learning your patterns. "
                            "Check in for at least 7 days to see insights.",
            "shifts":       [],
            "alerts":       []
        }

    shifts      = detect_shifts(baseline, recent)
    week_number = get_semester_week(user["semester_start"])
    today       = str(dt.today())

    # Save significant shifts as alerts in Neo4j
    for shift in shifts:
        if shift["severity"] == "high":
            save_alert(
                uid        = uid,
                alert_type = shift["type"],
                severity   = shift["severity"],
                message    = shift["message"],
                date       = today
            )

    # Get semester week context
    week_context = None
    if week_number >= 6 and week_number <= 8:
        week_context = (
            f"You are in Week {week_number} — one of the most documented "
            f"stress peaks of the semester. What you are feeling is real, "
            f"predictable, and temporary."
        )
    elif week_number >= 11:
        week_context = (
            f"You are in Week {week_number} — finals are approaching. "
            f"This is one of the hardest stretches of the academic year."
        )

    return {
        "user_id":       uid,
        "status":        "alert" if shifts else "stable",
        "week_number":   week_number,
        "week_context":  week_context,
        "shifts":        shifts,
        "alerts":        [dict(a["a"]) for a in get_alerts(uid)],
        "baseline":      baseline,
        "recent":        recent
    }
