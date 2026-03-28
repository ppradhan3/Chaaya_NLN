from fastapi import APIRouter
from graph.connection import get_session

router = APIRouter()

@router.get("")
def get_pulse():
    with get_session() as s:
        r = s.run("""
            MATCH (u:User)-[:HAS_ENTRY]->(b:BehavioralEntry)
            WHERE b.date >= date() - duration({days: 7})
            RETURN
                count(DISTINCT u)        AS total_users,
                avg(b.performance_gap)   AS avg_masking,
                avg(CASE WHEN b.sleep_hours < 6
                    THEN 1.0 ELSE 0.0 END) AS pct_low_sleep,
                avg(CASE WHEN b.attended_class = false
                    THEN 1.0 ELSE 0.0 END) AS pct_missed_class
        """).single()

        if not r or r["total_users"] == 0:
            return {
                "percentageDarkStretch": 34,
                "message":              "Many are navigating a heavy stretch right now.",
                "totalUsers":           0,
                "averageMaskingLevel":  2.8
            }

        pct_dark = round(
            ((r["pct_low_sleep"] or 0) * 0.5 +
             (r["pct_missed_class"] or 0) * 0.5) * 100
        )

        messages = {
            True:  "A significant number of students are in a dark stretch. You are not alone.",
            False: "Most students are holding steady. Hard weeks come in waves."
        }

        return {
            "percentageDarkStretch": pct_dark,
            "message":              messages[pct_dark > 40],
            "totalUsers":           r["total_users"],
            "averageMaskingLevel":  round(r["avg_masking"] or 2.8, 1)
        }
