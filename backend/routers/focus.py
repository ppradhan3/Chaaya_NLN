from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, List
import anthropic
import os

router = APIRouter()
client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY", ""))

class FocusRequest(BaseModel):
    sessionId:           str
    tasks:               List[str]
    weatherDescription:  Optional[str] = None
    uvIndex:             Optional[float] = None
    sunlightHours:       Optional[float] = None

@router.post("")
def get_focus_task(body: FocusRequest):
    tasks_text = "\n".join(f"- {t}" for t in body.tasks)
    weather    = body.weatherDescription or "unknown"

    try:
        r = client.messages.create(
            model      = "claude-sonnet-4-20250514",
            max_tokens = 200,
            messages   = [{
                "role":    "user",
                "content": f"""A student has these tasks:
{tasks_text}

Weather: {weather}

Pick the ONE task they should start with right now.
Respond in JSON only:
{{"task": "exact task text", "reason": "one warm sentence why"}}"""
            }]
        )
        import json
        text = r.content[0].text.strip()
        text = text.replace("```json","").replace("```","").strip()
        data = json.loads(text)
        return data
    except Exception:
        return {
            "task":   body.tasks[0] if body.tasks else "Take one breath",
            "reason": "Starting anywhere is better than starting nowhere."
        }
