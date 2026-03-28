
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from graph.queries import get_user, get_recent_avg, get_baseline
from routers.patterns import detect_shifts

router = APIRouter()

class ActionRequest(BaseModel):
    user_id:          str
    professor_name:   Optional[str] = "Professor"
    course_name:      Optional[str] = "the course"
    classes_missed:   Optional[int] = 2
    assignment_late:  Optional[bool] = False

# ─── Email Templates ──────────────────────────────────────────
# Warm, honest, professional
# Student only has to change the parts in [brackets]

def draft_professor_email(name: str, professor: str,
                           course: str, missed: int,
                           late: bool) -> dict:
    subject = f"Checking In — {course}"

    late_line = ""
    if late:
        late_line = (
            f"\n\nI also wanted to flag that I have a submission "
            f"for {course} that I am behind on. I would appreciate "
            f"any guidance on how to address this."
        )

    body = f"""Dear {professor},

I hope you are doing well. I am writing to let you know that \
I have been going through a difficult stretch this semester and \
have missed {missed} class{'es' if missed > 1 else ''} in {course}. \
I want to be transparent rather than disappear without explanation.

I am committed to catching up and would appreciate knowing \
if there is anything I should prioritize to stay on track. \
I am also happy to come to office hours if that would be helpful.{late_line}

Thank you for your time and understanding.

Best,
{name}"""

    return {"subject": subject, "body": body}


def draft_counseling_message() -> dict:
    return {
        "subject": "I would like to talk to someone",
        "body": (
            "Hi,\n\n"
            "I am a student and I have been having a hard time lately. "
            "I would like to speak with someone. "
            "Could you let me know how to book an appointment "
            "or what my options are?\n\n"
            "Thank you."
        )
    }


def get_walk_suggestion(weather_temp: float) -> str:
    if weather_temp < 35:
        return (
            "It is cold outside — but even 10 minutes of fresh air "
            "has a measurable effect on mood. Coat on, headphones in, "
            "around the block. That is enough."
        )
    elif weather_temp < 55:
        return (
            "A 20-minute walk outside right now — not to exercise, "
            "just to exist somewhere that is not your room. "
            "Your nervous system needs the change of environment."
        )
    else:
        return (
            "Step outside for 20–30 minutes. No phone, no podcast "
            "if you can manage it. Just walk. "
            "Sunlight and movement are two of the most "
            "evidence-backed mood regulators we have."
        )


# ─── Routes ───────────────────────────────────────────────────

@router.post("/")
def get_actions(body: ActionRequest):
    user = get_user(body.user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    baseline = get_baseline(body.user_id)
    recent   = get_recent_avg(body.user_id, days=7)

    shifts = []
    if baseline and recent:
        shifts = detect_shifts(baseline, recent)

    shift_types = [s["type"] for s in shifts]
    actions     = []

    # Always offer the professor email if attendance dropped
    if "attendance_drop" in shift_types or body.classes_missed > 0:
        email = draft_professor_email(
            name      = user.get("name", "Student"),
            professor = body.professor_name,
            course    = body.course_name,
            missed    = body.classes_missed,
            late      = body.assignment_late
        )
        actions.append({
            "type":        "professor_email",
            "title":       "Email your professor",
            "description": (
                "You do not have to explain everything. "
                "This email is honest, brief, and professional. "
                "One tap to copy it."
            ),
            "content":     email
        })

    # Offer a walk if isolation detected
    if "isolation" in shift_types or "sleep_drop" in shift_types:
        temp = recent.get("avg_weather_temp", 55) if recent else 55
        actions.append({
            "type":        "walk",
            "title":       "Step outside",
            "description": get_walk_suggestion(temp),
            "content":     None
        })

    # Always offer counseling as a gentle option
    actions.append({
        "type":        "counseling",
        "title":       "Talk to someone",
        "description": (
            "Your campus counseling center is free and confidential. "
            "This message gets you in the door without having "
            "to explain yourself from scratch."
        ),
        "content":     draft_counseling_message()
    })

    # Meal reminder if nutrition flagged
    if "nutrition" in shift_types:
        actions.append({
            "type":        "meal",
            "title":       "Eat one real meal",
            "description": (
                "Not a snack. A proper meal. "
                "Your brain cannot regulate mood, focus, or stress "
                "without adequate fuel. This is the most "
                "underrated thing you can do right now."
            ),
            "content":     None
        })

    return {
        "user_id":  body.user_id,
        "shifts":   shift_types,
        "actions":  actions,
        "reminder": (
            "Chhaya is a behavioral tracking tool, not a medical application. "
            "These suggestions are not medical advice. "
            "If you are in crisis please text HOME to 741741."
        )
    }
