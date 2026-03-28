# Chhaya Knowledge Graph

## Why A Knowledge Graph?

A relational database stores data as rows in tables.
A knowledge graph stores data as **connected nodes** —
enabling questions like:

> "Show me all behavioral entries for this student
>  that fall during documented high-stress semester weeks
>  and triggered pattern alerts with high severity"

In Cypher (one query):
```cypher
MATCH (u:User {id: $uid})
      -[:HAS_ENTRY]->(b:BehavioralEntry)
      -[:IN_WEEK]->(w:SemesterWeek)
      -[:TRIGGERED]->(a:PatternAlert)
WHERE w.known_stress_level >= 4
  AND a.severity = 'high'
RETURN u.name, b.date, w.label,
       a.message
ORDER BY b.date DESC
```

A relational database would need 3 JOINs across 4 tables.
The graph traverses natural relationships.

## The Graph Model
```
(Student)──[HAS_ENTRY]──►(BehavioralEntry)
                               │
                    ┌──────────┴──────────┐
                    ▼                     ▼
             [IN_WEEK]            [TRIGGERED]
                    │                     │
                    ▼                     ▼
           (SemesterWeek)        (PatternAlert)
           known_stress: 1-5      severity: high/medium
```

## Key Queries

### Get student's full behavioral arc
```cypher
MATCH (u:User {id: $uid})-[:HAS_ENTRY]->(b:BehavioralEntry)
RETURN b ORDER BY b.date ASC
```

### Detect pattern in high-stress weeks
```cypher
MATCH (u:User {id: $uid})
      -[:HAS_ENTRY]->(b:BehavioralEntry)
      -[:IN_WEEK]->(w:SemesterWeek)
WHERE w.known_stress_level >= 4
RETURN b.date, b.sleep_hours,
       b.attended_class, w.label
```

### Campus-wide anonymized pulse
```cypher
MATCH (u:User)-[:HAS_ENTRY]->(b:BehavioralEntry)
WHERE b.date >= date() - duration({days: 7})
RETURN avg(b.performance_gap) AS avg_masking,
       avg(b.sleep_hours)     AS avg_sleep,
       count(DISTINCT u)      AS active_students
```

## Running The Graph
```bash
docker-compose up --build
```

Access Neo4j browser at: http://localhost:7474
Login: neo4j / chhaya123

## Demo Query (Maya's Story)
```cypher
MATCH (u:User {id: 'demo_maya'})
      -[:HAS_ENTRY]->(b:BehavioralEntry)
      -[:IN_WEEK]->(w:SemesterWeek)
RETURN u.name, b.date, b.sleep_hours,
       b.attended_class, w.label,
       w.known_stress_level
ORDER BY b.date ASC
```

This shows Maya's 6-week deterioration arc —
sleep dropping, attendance falling, stress level rising.
