const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

// ─── Core fetch helper ─────────────────────────────────────

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(body)
  })
  if (!res.ok) throw new Error(`POST ${path} failed: ${res.status}`)
  return res.json()
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${API}${path}`)
  if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`)
  return res.json()
}

// ─── Check-in ─────────────────────────────────────────────

export interface CheckinPayload {
  sessionId:            string
  attendedClass:        boolean
  ateWell:              boolean
  maskingLevel:         number
  holdDurationMs:       number
  interactionLatencyMs: number
  lat:                  number | null
  lon:                  number | null
  leftRoom:             boolean | null
  hadSunlightExposure:  boolean | null
}

export async function createCheckin(data: CheckinPayload) {
  return post('/checkin/aasha', data)
}

export async function getCheckins(sessionId: string, limit = 100) {
  const res = await get<{ history: any[] }>(
    `/checkin/${sessionId}/history?days=${limit}`
  )
  return res.history.map(e => ({
    ...e,
    attendedClass: e.attended_class,
    ateWell:       e.ate_meal,
    maskingLevel:  e.performance_gap,
    isLateNight:   e.wake_time > 23 || e.wake_time < 5,
    createdAt:     e.date + 'T12:00:00Z',
    leftRoom:      e.left_room,
  }))
}

// ─── Insights ─────────────────────────────────────────────

export async function generateInsight(sessionId: string, payload: any) {
  const res = await get<any>(`/insights/${sessionId}`)
  return {
    note:                res.insight,
    patterns:            res.shifts?.map((s: any) => s.message) || [],
    sanctuarySuggestion: 'Find somewhere quiet with natural light — even 10 minutes resets your nervous system.'
  }
}

export async function generateBioValidation(
  sessionId: string, checkin: any, weatherData: any
) {
  return post<any>('/bio-validation', { sessionId, checkin, weatherData })
}

// ─── Garden ───────────────────────────────────────────────

export async function getGarden(sessionId: string) {
  return get<any>(`/garden/${sessionId}`)
}

// ─── Community Pulse ──────────────────────────────────────

export async function getCommunityPulse() {
  return get<any>('/pulse')
}

// ─── Focus Funnel ─────────────────────────────────────────

export async function focusFunnel(payload: {
  sessionId:          string
  tasks:              string[]
  weatherDescription?: string
  uvIndex?:           number
  sunlightHours?:     number
}) {
  return post<any>('/focus', payload)
}

// ─── Email ────────────────────────────────────────────────

export async function generateEmail(payload: {
  emailType:       string
  professorName?:  string
  courseName?:     string
  assignmentName?: string
  studentName?:    string
  extraContext?:   string
}) {
  return post<any>('/email', payload)
}
