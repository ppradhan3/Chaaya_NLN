from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
import anthropic
import os
import urllib.parse

router = APIRouter()
client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY", ""))

class EmailRequest(BaseModel):
    emailType:       str
    professorName:   Optional[str] = "Professor"
    courseName:      Optional[str] = "the course"
    assignmentName:  Optional[str] = None
    studentName:     Optional[str] = "Student"
    extraContext:    Optional[str] = None

EMAIL_PROMPTS = {
    "extension":        "asking for a deadline extension",
    "absence":          "notifying about a class absence",
    "office-hours":     "requesting office hours",
    "accommodation":    "requesting academic accommodation",
    "mental-health-day": "taking a mental health day"
}

@router.post("")
def generate_email(body: EmailRequest):
    purpose = EMAIL_PROMPTS.get(body.emailType, "reaching out")
    context = body.extraContext or ""

    try:
        r = client.messages.create(
            model      = "claude-sonnet-4-20250514",
            max_tokens = 400,
            messages   = [{
                "role":    "user",
                "content": f"""Write a short, warm, professional email from a college student.

Purpose: {purpose}
Professor: {body.professorName}
Course: {body.courseName}
Student: {body.studentName}
Extra context: {context}

Rules:
- Honest but not over-explaining
- Under 120 words
- No groveling
- Warm and direct

Respond in JSON only:
{{"subject": "...", "body": "..."}}"""
            }]
        )
        import json
        text = r.content[0].text.strip()
        text = text.replace("```json","").replace("```","").strip()
        data = json.loads(text)

        # Build mailto link
        mailto = (
            f"mailto:?subject={urllib.parse.quote(data['subject'])}"
            f"&body={urllib.parse.quote(data['body'])}"
        )
        return { **data, "mailtoLink": mailto }

    except Exception:
        subject = f"Checking In — {body.courseName}"
        body_text = (
            f"Dear {body.professorName},\n\n"
            f"I am writing regarding {body.courseName}. "
            f"I wanted to reach out and let you know I may need some flexibility. "
            f"I would appreciate the chance to discuss this with you.\n\n"
            f"Thank you,\n{body.studentName}"
        )
        mailto = (
            f"mailto:?subject={urllib.parse.quote(subject)}"
            f"&body={urllib.parse.quote(body_text)}"
        )
        return {
            "subject":    subject,
            "body":       body_text,
            "mailtoLink": mailto
        }
