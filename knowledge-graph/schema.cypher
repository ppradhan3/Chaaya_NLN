// ─── Chhaya Knowledge Graph Schema ───────────────────────────
// Neo4j constraints and indexes

// Uniqueness constraints
CREATE CONSTRAINT user_id IF NOT EXISTS
  FOR (u:User) REQUIRE u.id IS UNIQUE;

CREATE CONSTRAINT entry_id IF NOT EXISTS
  FOR (b:BehavioralEntry) REQUIRE b.id IS UNIQUE;

CREATE CONSTRAINT week_num IF NOT EXISTS
  FOR (w:SemesterWeek) REQUIRE w.week IS UNIQUE;

CREATE CONSTRAINT alert_id IF NOT EXISTS
  FOR (a:PatternAlert) REQUIRE a.id IS UNIQUE;

// Indexes for fast lookup
CREATE INDEX entry_user IF NOT EXISTS
  FOR (b:BehavioralEntry) ON (b.user_id);

CREATE INDEX entry_date IF NOT EXISTS
  FOR (b:BehavioralEntry) ON (b.date);

CREATE INDEX alert_user IF NOT EXISTS
  FOR (a:PatternAlert) ON (a.user_id);

// ─── Node Labels ──────────────────────────────────────────────
// (:User)
//   id, name, university, semester_start, created_at
//
// (:BehavioralEntry)
//   id, user_id, date,
//   attended_class, wake_time, left_room,
//   ate_meal, performance_gap, sleep_hours,
//   cognitive_friction, actual_sunlight, completion_sense,
//   note, weather_temp, weather_desc,
//   sunlight_hours, week_number, created_at
//
// (:SemesterWeek)
//   week, label, known_stress_level, description
//
// (:PatternAlert)
//   id, user_id, type, severity, message, triggered_at

// ─── Relationship Types ───────────────────────────────────────
// (User)-[:HAS_ENTRY]→(BehavioralEntry)
//   Student submitted this behavioral check-in
//
// (BehavioralEntry)-[:IN_WEEK]→(SemesterWeek)
//   Check-in occurred during this semester week
//
// (BehavioralEntry)-[:TRIGGERED]→(PatternAlert)
//   This entry caused a pattern alert to fire
//
// (PatternAlert)-[:SUGGESTS]→(ActionSuggestion)
//   Alert recommends this action to the student
