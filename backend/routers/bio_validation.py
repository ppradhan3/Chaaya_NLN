from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, Any
import anthropic
import os
import random

router = APIRouter()
client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY", ""))

class BioRequest(BaseModel):
    sessionId:   str
    checkin:     Optional[Any] = None
    weatherData: Optional[Any] = None

FACT_TYPES = ["sleep", "isolation", "nutrition", "circadian", "cognitive"]

@router.post("")
def bio_validation(body: BioRequest):
    fact_type = random.choice(FACT_TYPES)

    prompts = {
        "sleep":     "Share one surprising science fact about sleep and the college brain. Under 40 words. Warm, not clinical.",
        "isolation": "Share one science fact about human connection and the nervous system. Under 40 words. Warm, not clinical.",
        "nutrition": "Share one surprising fact about the gut-brain connection and mood. Under 40 words. Warm, not clinical.",
        "circadian": "Share one fact about circadian rhythms and student performance. Under 40 words. Warm, not clinical.",
        "cognitive":  "Share one fact about cognitive load and task-switching in students. Under 40 words. Warm, not clinical.",
    }

    try:
        r = client.messages.create(
            model      = "claude-sonnet-4-20250514",
            max_tokens = 100,
            messages   = [{
                "role":    "user",
                "content": prompts[fact_type]
            }]
        )
        card = r.content[0].text.strip()
    except Exception:
        cards = {
            "sleep":     "Your brain consolidates memories during sleep. Every hour lost is a chapter left unwritten.",
            "isolation": "A 20-second hug releases enough oxytocin to measurably lower cortisol. Connection is chemistry.",
            "nutrition": "90% of serotonin is made in your gut. What you eat shapes how you feel — literally.",
            "circadian": "Your cognitive peak is 2-4 hours after waking. Protect that window.",
            "cognitive":  "Task-switching costs 23 minutes of focus recovery. Single-tasking is a superpower.",
        }
        card = cards[fact_type]

    return {
        "card":      card,
        "xpGained": random.randint(10, 25),
        "factType":  fact_type
    }
