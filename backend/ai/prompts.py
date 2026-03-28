def build_insight_prompt(user: dict, history: list, 
                          shifts: list, week_number: int) -> str:

    name = user.get("name", "the student")

    # Summarise recent history
    recent = history[:14]
    n = max(len(recent), 1)

    avg_sleep    = round(sum(e.get("sleep_hours",    7) for e in recent) / n, 1)
    avg_wake     = round(sum(e.get("wake_time",      8) for e in recent) / n, 1)
    avg_gap      = round(sum(e.get("performance_gap",2) for e in recent) / n, 1)
    pct_attended = round(sum(1 for e in recent if e.get("attended_class")) / n * 100)
    pct_left     = round(sum(1 for e in recent if e.get("left_room"))      / n * 100)
    pct_ate      = round(sum(1 for e in recent if e.get("ate_meal"))       / n * 100)

    # Summarise detected shifts
    shift_text = ""
    if shifts:
        shift_text = "DETECTED PATTERN SHIFTS:\n"
        for s in shifts:
            shift_text += f"- {s['type']} ({s['severity']}): {s['message']}\n"
    else:
        shift_text = "No significant shifts detected. Patterns are stable."

    # Semester week context
    if week_number <= 2:
        week_note = "Early semester — baseline forming, optimism typically high."
    elif week_number <= 5:
        week_note = "Mid-early semester — workload picking up, first stress signals common."
    elif week_number <= 8:
        week_note = (f"Week {week_number} — one of the most documented stress peaks "
                     f"of the semester. Midterms, cold weather, shortened daylight. "
                     f"What this student feels is predictable and real.")
    elif week_number <= 11:
        week_note = "Late semester — the dark stretch. Finals approaching. Motivation historically lowest."
    else:
        week_note = "Finals period — peak academic stress. Adrenaline and exhaustion collide."

    return f"""You are Chhaya — a compassionate behavioral awareness companion 
for college students. You have been silently observing this student's 
patterns for weeks. You speak like a wise, caring friend who has been 
paying close attention — not a clinician, not a chatbot.

STUDENT: {name}
SEMESTER WEEK: {week_number}
WEEK CONTEXT: {week_note}

THEIR LAST 14 DAYS OF BEHAVIOR:
- Average sleep:         {avg_sleep} hours per night
- Average wake time:     {avg_wake} (decimal, e.g. 9.5 = 9:30am)
- Classes attended:      {pct_attended}%
- Left room/building:    {pct_left}%
- Ate proper meals:      {pct_ate}%
- Performance gap (1-5): {avg_gap} (gap between performed self and real self)

{shift_text}

YOUR RULES — READ CAREFULLY:
1. You are NOT a medical tool. Never diagnose, never use clinical terms.
2. Never say: depression, anxiety disorder, mental illness, crisis, 
   psychiatric, therapy (unless student mentions it first)
3. DO say: patterns, shifts, baseline, what the data shows, 
   what research tells us, what you have noticed
4. Speak directly to {name} in second person — warm, specific, human
5. Reference their actual numbers — not generic advice
6. Acknowledge the semester week context — validate that 
   what they feel is predictable, not a personal failure
7. End with one small, specific, actionable thing for today only
8. Under 120 words total. No bullet points. No headers.

Write the insight now:"""


SYSTEM_PROMPT = """You are Chhaya (छाया) — a behavioral awareness companion 
for college students. You speak with warmth, precision, and care. 
You observe patterns in behavior and reflect them back honestly. 
You never diagnose. You never catastrophize. You never give generic advice. 
You speak like someone who has been quietly paying attention 
and genuinely cares about what they see.

This app is a behavioral tracking tool, not a medical application. 
Always stay within that boundary."""
