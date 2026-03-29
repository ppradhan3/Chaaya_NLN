# from fastapi import APIRouter, HTTPException
# from pydantic import BaseModel
# from typing import Optional
# from datetime import date as dt
# import os
# from graph.queries import save_checkin, get_user, get_semester_week

# router = APIRouter()

# class ChhayaCheckin(BaseModel):
#     sessionId:            str
#     attendedClass:        bool
#     ateWell:              bool
#     maskingLevel:         int
#     # REMOVED: hardcoded defaults for bio-signals
#     wakeTime:             float  # 7.5 = 7:30am
#     sleepHours:           float
#     leftRoom:             bool
#     hadSunlightExposure:  bool
#     city:                 Optional[str] = "New York"
#     note:                 Optional[str] = ""

# @router.post("")
# async def checkin_chhaya(body: ChhayaCheckin):
#     uid  = body.sessionId
#     user = get_user(uid)

#     # FIX: No more auto-creating users with hardcoded 6-week offsets.
#     # Users should be created via /users/ during onboarding.
#     if not user:
#         raise HTTPException(status_code=404, detail="User not found. Please onboard first.")

#     today   = str(dt.today())
#     # Use the helper function already in your file to get weather
#     from .checkin import fetch_weather 
#     weather = await fetch_weather(body.city or "New York")
    
#     # Dynamically calculate the week based on the user's actual start date
#     week = get_semester_week(user["semester_start"])

#     save_checkin(
#         uid                = uid,
#         date               = today,
#         attended_class     = body.attendedClass,
#         wake_time          = body.wakeTime,      # Now Dynamic
#         left_room          = body.leftRoom,      # Now Dynamic
#         ate_meal           = body.ateWell,
#         performance_gap    = body.maskingLevel,
#         sleep_hours        = body.sleepHours,    # Now Dynamic
#         note               = body.note,
#         weather_temp       = weather["temp"],
#         weather_desc       = weather["desc"],
#         sunlight_hours     = weather["sunlight"],
#         week_number        = week,
#         cognitive_friction = False, 
#         actual_sunlight    = body.hadSunlightExposure,
#         completion_sense   = True
#     )

#     return {
#         "status": "saved",
#         "week_number": week,
#         "signals_tracked": ["sleep", "wake", "attendance", "isolation", "nutrition"]
#     }