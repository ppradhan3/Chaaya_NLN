# from fastapi import APIRouter, HTTPException
# from pydantic import BaseModel
# from datetime import date as dt
# from typing import Optional
# import httpx
# import os
# from graph.queries import save_checkin, get_history, get_user, get_semester_week

# router = APIRouter()

# # ─── Input Model ──────────────────────────────────────────────

# class CheckInRequest(BaseModel):
#     user_id:            str
#     date:               Optional[str]  = None
#     attended_class:     bool
#     wake_time:          float
#     left_room:          bool
#     ate_meal:           bool
#     performance_gap:    int
#     sleep_hours:        float
#     note:               Optional[str]  = ""
#     city:               Optional[str]  = "New York"
#     cognitive_friction: bool           = False
#     actual_sunlight:    bool           = False
#     completion_sense:   bool           = False

# # ─── Weather Fetcher ──────────────────────────────────────────

# async def fetch_weather(city: str):
#     key = os.getenv("OPENWEATHER_API_KEY", "")
#     if not key:
#         return {"temp": 55, "desc": "Unknown", "sunlight": 8}
#     try:
#         async with httpx.AsyncClient() as client:
#             r = await client.get(
#                 "https://api.openweathermap.org/data/2.5/weather",
#                 params={
#                     "q":     city,
#                     "appid": key,
#                     "units": "imperial"
#                 },
#                 timeout=5
#             )
#             data = r.json()
#             return {
#                 "temp":     round(data["main"]["temp"], 1),
#                 "desc":     data["weather"][0]["description"].title(),
#                 "sunlight": 8
#             }
#     except Exception:
#         return {"temp": 55, "desc": "Partly Cloudy", "sunlight": 8}

# # ─── Routes ───────────────────────────────────────────────────

# @router.post("/")
# async def submit_checkin(body: CheckInRequest):
#     user = get_user(body.user_id)
#     if not user:
#         raise HTTPException(status_code=404, detail="User not found")

#     today       = body.date or str(dt.today())
#     weather     = await fetch_weather(body.city or "New York")
#     week_number = get_semester_week(user["semester_start"])

#     save_checkin(
#         uid                = body.user_id,
#         date               = today,
#         attended_class     = body.attended_class,
#         wake_time          = body.wake_time,
#         left_room          = body.left_room,
#         ate_meal           = body.ate_meal,
#         performance_gap    = body.performance_gap,
#         sleep_hours        = body.sleep_hours,
#         note               = body.note or "",
#         weather_temp       = weather["temp"],
#         weather_desc       = weather["desc"],
#         sunlight_hours     = weather["sunlight"],
#         week_number        = week_number,
#         cognitive_friction = body.cognitive_friction,
#         actual_sunlight    = body.actual_sunlight,
#         completion_sense   = body.completion_sense
#     )

#     return {
#         "status":      "saved",
#         "date":        today,
#         "week_number": week_number,
#         "weather":     weather,
#         "message":     "Check-in saved. Chhaya is watching."
#     }

# @router.get("/{uid}/history")
# def history(uid: str, days: int = 42):
#     user = get_user(uid)
#     if not user:
#         raise HTTPException(status_code=404, detail="User not found")
#     entries = get_history(uid, days)
#     return {
#         "user_id": uid,
#         "days":    len(entries),
#         "history": [dict(e["b"]) for e in entries]
#     }

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from datetime import date as dt
from typing import Optional
import httpx
import os
from graph.queries import save_checkin, get_history, get_user, get_semester_week

router = APIRouter()

# ─── Unified Input Model ──────────────────────────────────────

class CheckInRequest(BaseModel):
    user_id:              str
    # Core Signals
    attended_class:       bool
    wake_time:            float # 7.5 = 7:30am
    sleep_hours:          float
    left_room:            bool
    ate_meal:             bool
    performance_gap:      int   # 1-5 scale
    # Advanced "Aasha" Signals (Optional)
    hold_duration_ms:     Optional[float] = 0
    interaction_latency:  Optional[float] = 0
    actual_sunlight:      bool            = False
    cognitive_friction:   bool            = False
    # Context
    city:                 Optional[str]   = None 
    note:                 Optional[str]   = ""
    date:                 Optional[str]   = None

# ─── Dynamic Weather Fetcher ──────────────────────────────────

async def fetch_weather(city: str):
    key = os.getenv("OPENWEATHER_API_KEY", "")
    if not key:
        return {"temp": 55, "desc": "Clear", "sunlight": 8}
    try:
        async with httpx.AsyncClient() as client:
            r = await client.get(
                "https://api.openweathermap.org/data/2.5/weather",
                params={"q": city, "appid": key, "units": "imperial"},
                timeout=5
            )
            data = r.json()
            return {
                "temp":     round(data["main"]["temp"], 1),
                "desc":     data["weather"][0]["description"].title(),
                "sunlight": 8 # This could be expanded with a UV API later
            }
    except Exception:
        return {"temp": 55, "desc": "Cloudy", "sunlight": 8}

# ─── The Route ────────────────────────────────────────────────

@router.post("/")
async def submit_checkin(body: CheckInRequest):
    # 1. Validate User (No more hardcoded auto-create)
    user = get_user(body.user_id)
    if not user:
        raise HTTPException(
            status_code=404, 
            detail="User not found. Please complete onboarding first."
        )

    # 2. Resolve Dynamic Context
    today = body.date or str(dt.today())
    
    # Use user's provided city, or fallback to their University location
    search_city = body.city or user.get("university", "New York")
    weather = await fetch_weather(search_city)
    
    # Calculate week based on the User's actual semester_start date
    week_number = get_semester_week(user["semester_start"])

    # 3. Save to Neo4j
    save_checkin(
        uid                = body.user_id,
        date               = today,
        attended_class     = body.attended_class,
        wake_time          = body.wake_time,      # Dynamic from user
        left_room          = body.left_room,      # Dynamic from user
        ate_meal           = body.ate_meal,
        performance_gap    = body.performance_gap,
        sleep_hours        = body.sleep_hours,    # Dynamic from user
        note               = body.note or "",
        weather_temp       = weather["temp"],
        weather_desc       = weather["desc"],
        sunlight_hours     = weather["sunlight"],
        week_number        = week_number,
        cognitive_friction = body.cognitive_friction,
        actual_sunlight    = body.actual_sunlight,
        completion_sense   = True
    )

    return {
        "status": "saved",
        "entry": {
            "date": today,
            "week": week_number,
            "weather": weather["desc"]
        }
    }