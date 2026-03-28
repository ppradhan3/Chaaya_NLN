import os, json, time, random
from neo4j import GraphDatabase
from datetime import datetime, timedelta

URI  = os.getenv("NEO4J_URI",      "bolt://localhost:7687")
USER = os.getenv("NEO4J_USER",     "neo4j")
PASS = os.getenv("NEO4J_PASSWORD", "chhaya123")

def wait_for_neo4j(driver, retries=20):
    for i in range(retries):
        try:
            driver.verify_connectivity()
            print("✓ Neo4j connected")
            return True
        except Exception:
            print(f"  Waiting for Neo4j ({i+1}/{retries})...")
            time.sleep(6)
    return False

def seed_academic_calendar(session):
    with open("academic_calendar.json") as f:
        weeks = json.load(f)
    for w in weeks:
        session.run("""
            MERGE (sw:SemesterWeek {week: $week})
            SET sw.label              = $label,
                sw.known_stress_level = $stress,
                sw.description        = $desc
        """, week=w["week"], label=w["label"],
             stress=w["known_stress_level"], desc=w["description"])
    print(f"✓ {len(weeks)} semester weeks seeded")

def seed_maya(session):
    semester_start = (datetime.now() - timedelta(weeks=6)).strftime("%Y-%m-%d")

    session.run("""
        MERGE (u:User {id: 'demo_maya'})
        SET u.name           = 'Maya',
            u.university     = 'State University',
            u.semester_start = $start,
            u.created_at     = $now
    """, start=semester_start, now=datetime.now().isoformat())

    print("✓ Maya created")

    # Maya's story — 6 weeks of behavioral drift
    # Each week has a profile that slowly deteriorates
    weeks = [
        # week 1-2: healthy baseline
        {
            "days": 14,
            "sleep": (7.5, 0.3),
            "wake":  (7.5, 0.3),   # 7:30am in decimal hours
            "attended": 0.98,
            "left_room": 0.95,
            "ate_meal":  0.95,
            "perf_gap":  (1.5, 0.3),
            "weather_temp": (72, 3),
            "weather_desc": "Sunny",
            "sunlight": (10, 0.3)
        },
        # week 3-4: subtle drift
        {
            "days": 14,
            "sleep": (6.5, 0.4),
            "wake":  (9.0, 0.4),   # 9:00am
            "attended": 0.90,
            "left_room": 0.85,
            "ate_meal":  0.85,
            "perf_gap":  (2.5, 0.4),
            "weather_temp": (58, 3),
            "weather_desc": "Cloudy",
            "sunlight": (8, 0.3)
        },
        # week 5-6: pattern alert territory
        {
            "days": 14,
            "sleep": (4.5, 0.5),
            "wake":  (11.5, 0.5),  # 11:30am
            "attended": 0.60,
            "left_room": 0.50,
            "ate_meal":  0.55,
            "perf_gap":  (4.2, 0.4),
            "weather_temp": (44, 3),
            "weather_desc": "Gray and cold",
            "sunlight": (6, 0.3)
        }
    ]

    base_date = datetime.now() - timedelta(weeks=6)
    day_count = 0

    for week_profile in weeks:
        for _ in range(week_profile["days"]):
            date = (base_date + timedelta(days=day_count)).strftime("%Y-%m-%d")
            week_num = (day_count // 7) + 1

            sleep = round(max(3.0, random.gauss(*week_profile["sleep"])), 1)
            wake  = round(random.gauss(*week_profile["wake"]), 1)
            attended  = random.random() < week_profile["attended"]
            left_room = random.random() < week_profile["left_room"]
            ate_meal  = random.random() < week_profile["ate_meal"]
            perf_gap  = round(max(1, min(5, random.gauss(*week_profile["perf_gap"]))), 1)
            temp      = round(random.gauss(*week_profile["weather_temp"]), 1)
            sunlight  = round(max(4, random.gauss(*week_profile["sunlight"])), 1)

            session.run("""
                MATCH (u:User {id: 'demo_maya'})
                MERGE (b:BehavioralEntry {id: $entry_id})
                SET b.user_id         = 'demo_maya',
                    b.date            = $date,
                    b.attended_class  = $attended,
                    b.wake_time       = $wake,
                    b.left_room       = $left_room,
                    b.ate_meal        = $ate_meal,
                    b.performance_gap = $perf_gap,
                    b.sleep_hours     = $sleep,
                    b.note            = '',
                    b.weather_temp    = $temp,
                    b.weather_desc    = $weather_desc,
                    b.sunlight_hours  = $sunlight,
                    b.week_number     = $week_num
                MERGE (u)-[:HAS_ENTRY]->(b)
                WITH b
                MATCH (sw:SemesterWeek {week: $week_num})
                MERGE (b)-[:IN_WEEK]->(sw)
            """, entry_id=f"demo_maya_{date}",
                 date=date,
                 attended=attended,
                 wake=wake,
                 left_room=left_room,
                 ate_meal=ate_meal,
                 perf_gap=perf_gap,
                 sleep=sleep,
                 temp=temp,
                 weather_desc=week_profile["weather_desc"],
                 sunlight=sunlight,
                 week_num=week_num)

            day_count += 1

    print(f"✓ Maya seeded with {day_count} days of behavioral history")

    # Seed pattern alert for Week 5-6 period
    session.run("""
        MATCH (b:BehavioralEntry {user_id: 'demo_maya'})
        WHERE b.week_number >= 5
        WITH b ORDER BY b.date DESC LIMIT 1
        CREATE (a:PatternAlert {
            id:           'demo_maya_alert_1',
            user_id:      'demo_maya',
            type:         'compound_drift',
            severity:     'high',
            message:      'Sleep has dropped 3 hours from your baseline. Wake time has shifted 4 hours later. You have missed classes 3 times this week. You have not left your room most days.',
            triggered_at: $now
        })
        CREATE (b)-[:TRIGGERED]->(a)
    """, now=datetime.now().isoformat())

    print("✓ Pattern alert seeded for Maya")

# ─── Run ──────────────────────────────────────────────────────

driver = GraphDatabase.driver(URI, auth=(USER, PASS))

if not wait_for_neo4j(driver):
    raise SystemExit("Could not connect to Neo4j")

with driver.session() as session:
    seed_academic_calendar(session)
    seed_maya(session)

driver.close()

print("\n✓ Chhaya database ready")
print("  Demo user: demo_maya")
print("  6 weeks of behavioral history seeded")
print("  Academic calendar loaded")
print("  Pattern alert active")

