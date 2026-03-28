from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from datetime import date as dt
import httpx, os
from graph.queries import (save_checkin, get_user,
                           get_semester_week, create_user)

router = APIRouter()

cclass ChhayaCheckin(BaseModel):
    sessionId:            str
    attendedClass:        bool
    ateWell:              bool
    maskingLevel:         int
    holdDurationMs:       Optional[float] = 0
    interactionLatencyMs: Optional[float] = 0
    lat:                  Optional[float] = None
    lon:                  Optional[float] = None
    leftRoom:             Optional[bool]  = None
    hadSunlightExposure:  Optional[bool]  = None
    city:                 Optional[str]   = "New York"

async def fetch_weather(city: str = "New York"):
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
            d = r.json()
            return {
                "temp":     round(d["main"]["temp"], 1),
                "desc":     d["weather"][0]["description"].title(),
                "sunlight": 8
            }
    except Exception:
        return {"temp": 55, "desc": "Clear", "sunlight": 8}

@router.post("")
async def checkin_chhaya(body: ChhayaCheckin):
    uid  = body.sessionId
    user = get_user(uid)

    # Auto-create user if first time
    if not user:
        from datetime import datetime, timedelta
        semester_start = (
            datetime.now() - timedelta(weeks=6)
        ).strftime("%Y-%m-%d")
        create_user(
            uid            = uid,
            name           = "Student",
            university     = "University",
            semester_start = semester_start
        )
        user = get_user(uid)

    today   = str(dt.today())
    weather = await fetch_weather(body.city or "New York")
    week    = get_semester_week(user["semester_start"])

    save_checkin(
        uid                = uid,
        date               = today,
        attended_class     = body.attendedClass,
        wake_time          = 8,
        left_room          = body.leftRoom
                             if body.leftRoom is not None else True,
        ate_meal           = body.ateWell,
        performance_gap    = body.maskingLevel,
        sleep_hours        = 7,
        note               = "",
        weather_temp       = weather["temp"],
        weather_desc       = weather["desc"],
        sunlight_hours     = weather["sunlight"],
        week_number        = week,
        cognitive_friction = False,
        actual_sunlight    = body.hadSunlightExposure or False,
        completion_sense   = True
    )

    return {
        "status":      "saved",
        "date":        today,
        "week_number": week,
        "sessionId":   uid
    }
