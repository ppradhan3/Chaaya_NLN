import os
import anthropic
from .prompts import build_insight_prompt, SYSTEM_PROMPT

client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY", ""))

def generate_insight(user: dict, history: list,
                     shifts: list, week_number: int) -> str:
    try:
        prompt = build_insight_prompt(user, history, shifts, week_number)

        response = client.messages.create(
            model      = "claude-sonnet-4-20250514",
            max_tokens = 300,
            system     = SYSTEM_PROMPT,
            messages   = [{"role": "user", "content": prompt}]
        )

        return response.content[0].text

    except Exception as e:
        print(f"Claude error: {e}")
        return fallback_insight(shifts, week_number)


def fallback_insight(shifts: list, week_number: int) -> str:
    if not shifts:
        return (
            "Your patterns are holding steady. "
            "Chhaya is watching and things look stable right now. "
            "Keep showing up for yourself — one day at a time."
        )

    top = shifts[0]

    messages = {
        "sleep_drop": (
            "Your sleep has shifted significantly from where it was. "
            "That alone affects everything — focus, mood, resilience. "
            "Tonight, try closing your laptop 30 minutes earlier than usual. "
            "Just tonight. That is enough."
        ),
        "attendance_drop": (
            "You have been missing more classes than your usual pattern. "
            "You do not have to catch everything at once. "
            "Pick one class tomorrow and just show up — "
            "even if you sit in the back and say nothing."
        ),
        "isolation": (
            "You have been staying in more than your normal. "
            "That is understandable — but the data shows it compounds. "
            "Step outside for 10 minutes today. "
            "Not to exercise. Just to exist somewhere that is not your room."
        ),
        "performance_gap": (
            "The gap between how you are showing up and how you "
            "actually feel has been widening. "
            "That masking costs real energy. "
            "Find one person today you do not have to perform for."
        ),
        "nutrition": (
            "You have been skipping meals more than usual. "
            "Your brain cannot regulate anything well without fuel. "
            "One real meal today — that is the only goal."
        )
    }

    return messages.get(top["type"], (
        "Chhaya has noticed some shifts in your patterns. "
        "You are not broken — you are a human in a hard week. "
        "Pick one small thing today and do just that."
    ))