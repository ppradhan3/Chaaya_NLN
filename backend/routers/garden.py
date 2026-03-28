from fastapi import APIRouter, HTTPException
from graph.queries import get_user, get_history
from datetime import datetime, timedelta

router = APIRouter()

@router.get("/{uid}")
def get_garden(uid: str):
    user = get_user(uid)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    entries = get_history(uid, days=90)
    history = [dict(e["b"]) for e in entries]

    # Calculate streak
    today     = datetime.now().date()
    streak    = 0
    check_day = today
    dates     = {e["date"] for e in history}

    for _ in range(90):
        if str(check_day) in dates:
            streak    += 1
            check_day -= timedelta(days=1)
        else:
            break

    # Shape checkins for garden
    checkins = []
    for e in history:
        checkins.append({
            "createdAt":      e["date"] + "T12:00:00Z",
            "attendedClass":  e.get("attended_class", True),
            "ateWell":        e.get("ate_meal", True),
            "maskingLevel":   e.get("performance_gap", 3),
            "isLateNight":    e.get("wake_time", 8) > 23
                              or e.get("wake_time", 8) < 5,
            "leftRoom":       e.get("left_room", True),
        })

    return {
        "recentCheckins": checkins,
        "totalPetals":    len(history),
        "currentStreak":  streak
    }
