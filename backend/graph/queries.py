# from .connection import get_session
# from datetime import datetime, timedelta

# # ─── Users ────────────────────────────────────────────────────

# def get_user(uid: str):
#     with get_session() as s:
#         r = s.run("""
#             MATCH (u:User {id: $uid})
#             RETURN u
#         """, uid=uid).single()
#         return dict(r["u"]) if r else None

# def create_user(uid, name, university, semester_start):
#     with get_session() as s:
#         s.run("""
#             MERGE (u:User {id: $uid})
#             SET u.name           = $name,
#                 u.university     = $university,
#                 u.semester_start = $semester_start,
#                 u.created_at     = $now
#         """, uid=uid, name=name, university=university,
#              semester_start=semester_start,
#              now=datetime.now().isoformat())

# # ─── Semester Week ────────────────────────────────────────────

# def get_semester_week(semester_start: str):
#     start = datetime.strptime(semester_start, "%Y-%m-%d")
#     today = datetime.now()
#     delta = (today - start).days
#     week  = max(1, (delta // 7) + 1)
#     return week

# # ─── Check-ins ────────────────────────────────────────────────

# def save_checkin(uid, date, attended_class, wake_time,
#                  left_room, ate_meal, performance_gap,
#                  sleep_hours, note, weather_temp,
#                  weather_desc, sunlight_hours, week_number,
#                  cognitive_friction, actual_sunlight, completion_sense):
#     with get_session() as s:
#         s.run("""
#             MATCH (u:User {id: $uid})
#             CREATE (b:BehavioralEntry {
#                 id:                 $entry_id,
#                 user_id:            $uid,
#                 date:               $date,
#                 attended_class:     $attended_class,
#                 wake_time:          $wake_time,
#                 left_room:          $left_room,
#                 ate_meal:           $ate_meal,
#                 performance_gap:    $performance_gap,
#                 sleep_hours:        $sleep_hours,
#                 note:               $note,
#                 weather_temp:       $weather_temp,
#                 weather_desc:       $weather_desc,
#                 sunlight_hours:     $sunlight_hours,
#                 week_number:        $week_number,
#                 cognitive_friction: $cognitive_friction,
#                 actual_sunlight:    $actual_sunlight,
#                 completion_sense:   $completion_sense,
#                 created_at:         $now
#             })
#             CREATE (u)-[:HAS_ENTRY]->(b)
#         """, uid=uid,
#              entry_id=f"{uid}_{date}",
#              date=date,
#              attended_class=attended_class,
#              wake_time=wake_time,
#              left_room=left_room,
#              ate_meal=ate_meal,
#              performance_gap=performance_gap,
#              sleep_hours=sleep_hours,
#              note=note,
#              weather_temp=weather_temp,
#              weather_desc=weather_desc,
#              sunlight_hours=sunlight_hours,
#              week_number=week_number,
#              cognitive_friction=cognitive_friction,
#              actual_sunlight=actual_sunlight,
#              completion_sense=completion_sense,
#              now=datetime.now().isoformat())

# def get_history(uid: str, days: int = 14):
#     with get_session() as s:
#         return s.run("""
#             MATCH (u:User {id: $uid})-[:HAS_ENTRY]->(b:BehavioralEntry)
#             RETURN b
#             ORDER BY b.date DESC
#             LIMIT $days
#         """, uid=uid, days=days).data()

# # ─── Baseline ─────────────────────────────────────────────────

# def get_baseline(uid: str):
#     with get_session() as s:
#         r = s.run("""
#             MATCH (u:User {id: $uid})-[:HAS_ENTRY]->(b:BehavioralEntry)
#             WITH b ORDER BY b.date ASC LIMIT 14
#             RETURN
#                 avg(b.sleep_hours)   AS avg_sleep,
#                 avg(CASE WHEN b.attended_class = true THEN 1.0 ELSE 0.0 END)
#                                      AS avg_attendance,
#                 avg(b.performance_gap) AS avg_gap,
#                 avg(CASE WHEN b.left_room = true THEN 1.0 ELSE 0.0 END)
#                                      AS avg_left_room,
#                 avg(CASE WHEN b.ate_meal = true THEN 1.0 ELSE 0.0 END)
#                                      AS avg_ate_meal,
#                 avg(CASE WHEN b.cognitive_friction = true THEN 1.0 ELSE 0.0 END)
#                                      AS avg_cognitive_friction,
#                 avg(CASE WHEN b.actual_sunlight = true THEN 1.0 ELSE 0.0 END)
#                                      AS avg_actual_sunlight,
#                 avg(CASE WHEN b.completion_sense = true THEN 1.0 ELSE 0.0 END)
#                                      AS avg_completion_sense
#         """, uid=uid).single()
#         return dict(r) if r else None

# def get_recent_avg(uid: str, days: int = 7):
#     with get_session() as s:
#         r = s.run("""
#             MATCH (u:User {id: $uid})-[:HAS_ENTRY]->(b:BehavioralEntry)
#             WITH b ORDER BY b.date DESC LIMIT $days
#             RETURN
#                 avg(b.sleep_hours)   AS avg_sleep,
#                 avg(CASE WHEN b.attended_class = true THEN 1.0 ELSE 0.0 END)
#                                      AS avg_attendance,
#                 avg(b.performance_gap) AS avg_gap,
#                 avg(CASE WHEN b.left_room = true THEN 1.0 ELSE 0.0 END)
#                                      AS avg_left_room,
#                 avg(CASE WHEN b.ate_meal = true THEN 1.0 ELSE 0.0 END)
#                                      AS avg_ate_meal,
#                 avg(b.wake_time)     AS avg_wake_time,
#                 avg(CASE WHEN b.cognitive_friction = true THEN 1.0 ELSE 0.0 END)
#                                      AS avg_cognitive_friction,
#                 avg(CASE WHEN b.actual_sunlight = true THEN 1.0 ELSE 0.0 END)
#                                      AS avg_actual_sunlight,
#                 avg(CASE WHEN b.completion_sense = true THEN 1.0 ELSE 0.0 END)
#                                      AS avg_completion_sense
#         """, uid=uid, days=days).single()
#         return dict(r) if r else None

# # ─── Pattern Alerts ───────────────────────────────────────────

# def save_alert(uid, alert_type, severity, message, date):
#     with get_session() as s:
#         s.run("""
#             MATCH (u:User {id: $uid})-[:HAS_ENTRY]->
#                   (b:BehavioralEntry {date: $date})
#             CREATE (a:PatternAlert {
#                 id:           $alert_id,
#                 user_id:      $uid,
#                 type:         $type,
#                 severity:     $severity,
#                 message:      $message,
#                 triggered_at: $now
#             })
#             CREATE (b)-[:TRIGGERED]->(a)
#         """, uid=uid,
#              alert_id=f"{uid}_alert_{date}",
#              date=date,
#              type=alert_type,
#              severity=severity,
#              message=message,
#              now=datetime.now().isoformat())

# def get_alerts(uid: str):
#     with get_session() as s:
#         return s.run("""
#             MATCH (u:User {id: $uid})-[:HAS_ENTRY]->(b:BehavioralEntry)
#                   -[:TRIGGERED]->(a:PatternAlert)
#             RETURN a
#             ORDER BY a.triggered_at DESC
#             LIMIT 5
#         """, uid=uid).data()

from .connection import get_session
from datetime import datetime, timedelta

# ─── Users ────────────────────────────────────────────────────

def get_user(uid: str):
    with get_session() as s:
        r = s.run("""
            MATCH (u:User {id: $uid})
            RETURN u
        """, uid=uid).single()
        return dict(r["u"]) if r else None

def create_user(uid, name, university, semester_start, semester_end, finals_start):
    with get_session() as s:
        s.run("""
            MERGE (u:User {id: $uid})
            SET u.name           = $name,
                u.university     = $university,
                u.semester_start = $semester_start,
                u.semester_end   = $semester_end,
                u.finals_start   = $finals_start,
                u.created_at     = $now
        """, uid=uid, name=name, university=university,
             semester_start=semester_start,
             semester_end=semester_end,
             finals_start=finals_start,
             now=datetime.now().isoformat())

# ─── Semester Week ────────────────────────────────────────────

def get_semester_week(semester_start: str):
    start = datetime.strptime(semester_start, "%Y-%m-%d")
    today = datetime.now()
    delta = (today - start).days
    # Dynamically calculates the current week based on the student's actual start date
    week  = max(1, (delta // 7) + 1)
    return week

# ─── Check-ins ────────────────────────────────────────────────

def save_checkin(uid, date, attended_class, wake_time,
                 left_room, ate_meal, performance_gap,
                 sleep_hours, note, weather_temp,
                 weather_desc, sunlight_hours, week_number,
                 cognitive_friction, actual_sunlight, completion_sense):
    with get_session() as s:
        s.run("""
            MATCH (u:User {id: $uid})
            CREATE (b:BehavioralEntry {
                id:                 $entry_id,
                user_id:            $uid,
                date:               $date,
                attended_class:     $attended_class,
                wake_time:          $wake_time,
                left_room:          $left_room,
                ate_meal:           $ate_meal,
                performance_gap:    $performance_gap,
                sleep_hours:        $sleep_hours,
                note:               $note,
                weather_temp:       $weather_temp,
                weather_desc:       $weather_desc,
                sunlight_hours:     $sunlight_hours,
                week_number:        $week_number,
                cognitive_friction: $cognitive_friction,
                actual_sunlight:    $actual_sunlight,
                completion_sense:   $completion_sense,
                created_at:         $now
            })
            CREATE (u)-[:HAS_ENTRY]->(b)
        """, uid=uid,
             entry_id=f"{uid}_{date}",
             date=date,
             attended_class=attended_class,
             wake_time=wake_time,
             left_room=left_room,
             ate_meal=ate_meal,
             performance_gap=performance_gap,
             sleep_hours=sleep_hours,
             note=note,
             weather_temp=weather_temp,
             weather_desc=weather_desc,
             sunlight_hours=sunlight_hours,
             week_number=week_number,
             cognitive_friction=cognitive_friction,
             actual_sunlight=actual_sunlight,
             completion_sense=completion_sense,
             now=datetime.now().isoformat())

def get_history(uid: str, days: int = 14):
    with get_session() as s:
        return s.run("""
            MATCH (u:User {id: $uid})-[:HAS_ENTRY]->(b:BehavioralEntry)
            RETURN b
            ORDER BY b.date DESC
            LIMIT $days
        """, uid=uid, days=days).data()

# ─── Baseline Logic ───────────────────────────────────────────

def get_baseline(uid: str):
    with get_session() as s:
        # REQUIRES 7 DAYS: Ensures we don't calculate patterns until 
        # enough data exists to be meaningful.
        r = s.run("""
            MATCH (u:User {id: $uid})-[:HAS_ENTRY]->(b:BehavioralEntry)
            WITH b ORDER BY b.date ASC
            WITH collect(b) as entries
            WHERE size(entries) >= 7
            WITH entries[0..14] as baseline_period
            UNWIND baseline_period as b
            RETURN
                avg(b.sleep_hours)   AS avg_sleep,
                avg(CASE WHEN b.attended_class = true THEN 1.0 ELSE 0.0 END)
                                     AS avg_attendance,
                avg(b.performance_gap) AS avg_gap,
                avg(CASE WHEN b.left_room = true THEN 1.0 ELSE 0.0 END)
                                     AS avg_left_room,
                avg(CASE WHEN b.ate_meal = true THEN 1.0 ELSE 0.0 END)
                                     AS avg_ate_meal,
                avg(CASE WHEN b.cognitive_friction = true THEN 1.0 ELSE 0.0 END)
                                     AS avg_cognitive_friction,
                avg(CASE WHEN b.actual_sunlight = true THEN 1.0 ELSE 0.0 END)
                                     AS avg_actual_sunlight,
                avg(CASE WHEN b.completion_sense = true THEN 1.0 ELSE 0.0 END)
                                     AS avg_completion_sense
        """, uid=uid).single()
        return dict(r) if r else None

def get_recent_avg(uid: str, days: int = 7):
    with get_session() as s:
        r = s.run("""
            MATCH (u:User {id: $uid})-[:HAS_ENTRY]->(b:BehavioralEntry)
            WITH b ORDER BY b.date DESC LIMIT $days
            RETURN
                avg(b.sleep_hours)   AS avg_sleep,
                avg(CASE WHEN b.attended_class = true THEN 1.0 ELSE 0.0 END)
                                     AS avg_attendance,
                avg(b.performance_gap) AS avg_gap,
                avg(CASE WHEN b.left_room = true THEN 1.0 ELSE 0.0 END)
                                     AS avg_left_room,
                avg(CASE WHEN b.ate_meal = true THEN 1.0 ELSE 0.0 END)
                                     AS avg_ate_meal,
                avg(b.wake_time)     AS avg_wake_time,
                avg(CASE WHEN b.cognitive_friction = true THEN 1.0 ELSE 0.0 END)
                                     AS avg_cognitive_friction,
                avg(CASE WHEN b.actual_sunlight = true THEN 1.0 ELSE 0.0 END)
                                     AS avg_actual_sunlight,
                avg(CASE WHEN b.completion_sense = true THEN 1.0 ELSE 0.0 END)
                                     AS avg_completion_sense
        """, uid=uid, days=days).single()
        return dict(r) if r else None

# ─── Pattern Alerts ───────────────────────────────────────────

def save_alert(uid, alert_type, severity, message, date):
    with get_session() as s:
        s.run("""
            MATCH (u:User {id: $uid})-[:HAS_ENTRY]->
                  (b:BehavioralEntry {date: $date})
            CREATE (a:PatternAlert {
                id:           $alert_id,
                user_id:      $uid,
                type:         $type,
                severity:     $severity,
                message:      $message,
                triggered_at: $now
            })
            CREATE (b)-[:TRIGGERED]->(a)
        """, uid=uid,
             alert_id=f"{uid}_alert_{date}",
             date=date,
             type=alert_type,
             severity=severity,
             message=message,
             now=datetime.now().isoformat())

def get_alerts(uid: str):
    with get_session() as s:
        return s.run("""
            MATCH (u:User {id: $uid})-[:HAS_ENTRY]->(b:BehavioralEntry)
                  -[:TRIGGERED]->(a:PatternAlert)
            RETURN a
            ORDER BY a.triggered_at DESC
            LIMIT 5
        """, uid=uid).data()