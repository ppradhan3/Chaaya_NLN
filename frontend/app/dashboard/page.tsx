'use client'
import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Calendar from '@/components/Calendar'
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid
} from 'recharts'

interface Entry {
  date: string
  sleep_hours: number
  wake_time: number
  attended_class: boolean
  left_room: boolean
  ate_meal: boolean
  performance_gap: number
  weather_temp: number
  weather_desc: string
  week_number: number
}

interface Pattern {
  status: string
  week_number: number
  week_context: string | null
  shifts: Array<{
    type: string
    severity: string
    message: string
    diff: number
  }>
}

function Dashboard() {
  const params = useSearchParams()
  const uid = params.get('user') || 'demo_maya'
  const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

  const [history, setHistory]   = useState<Entry[]>([])
  const [pattern, setPattern]   = useState<Pattern | null>(null)
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    Promise.all([
      fetch(`${API}/checkin/${uid}/history?days=42`).then(r => r.json()),
      fetch(`${API}/patterns/${uid}`).then(r => r.json())
    ]).then(([h, p]) => {
      setHistory([...h.history].reverse())
      setPattern(p)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [uid])

  const chartData = history.map(e => ({
    date:    e.date?.slice(5),
    sleep:   e.sleep_hours,
    wake:    e.wake_time,
    gap:     e.performance_gap,
    week:    e.week_number,
    attended: e.attended_class ? 1 : 0,
  }))

  const avg = (key: keyof Entry) => {
    if (!history.length) return '—'
    const vals = history.map(e => Number(e[key])).filter(v => !isNaN(v))
    return (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1)
  }

  const attendancePct = history.length
    ? Math.round(history.filter(e => e.attended_class).length / history.length * 100)
    : 0

  const severityColor = (s: string) =>
    s === 'high' ? 'bg-red-50 border-red-100 text-red-700'
    : 'bg-yellow-50 border-yellow-100 text-yellow-700'

  const severityDot = (s: string) =>
    s === 'high' ? 'bg-red-400' : 'bg-yellow-400'

  if (loading) return (
    <div className="max-w-2xl mx-auto px-6 py-24 text-center text-gray-400">
      Chhaya is reading your patterns...
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Your patterns</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {history.length} days tracked
            {pattern?.week_number && ` · Week ${pattern.week_number} of semester`}
          </p>
        </div>
        <a href={`/checkin?user=${uid}`}
          className="bg-gray-900 text-white px-4 py-2 rounded-xl
                     text-sm font-medium hover:bg-gray-700 transition">
          + Check in
        </a>
      </div>

      {/* Week Context Banner */}
      {pattern?.week_context && (
        <div className="bg-gray-900 text-white rounded-2xl p-5 mb-6">
          <p className="text-sm leading-relaxed">{pattern.week_context}</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Avg sleep',    value: `${avg('sleep_hours')}h` },
          { label: 'Avg wake',     value: `${avg('wake_time')}:00` },
          { label: 'Attendance',   value: `${attendancePct}%` },
          { label: 'Avg gap',      value: `${avg('performance_gap')}/5` },
        ].map(s => (
          <div key={s.label}
            className="bg-white rounded-2xl border border-gray-100 p-4 text-center">
            <div className="text-xl font-semibold text-gray-900">{s.value}</div>
            <div className="text-xs text-gray-400 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Pattern Alerts */}
      {pattern?.shifts && pattern.shifts.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-medium text-gray-700 mb-3">
            🌑 Chhaya has noticed
          </h2>
          <div className="space-y-3">
            {pattern.shifts.map((shift, i) => (
              <div key={i}
                className={`rounded-2xl border p-4 ${severityColor(shift.severity)}`}>
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-2 h-2 rounded-full ${severityDot(shift.severity)}`} />
                  <span className="text-xs font-semibold uppercase tracking-wide">
                    {shift.type.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-sm leading-relaxed">{shift.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Chart */}
      {chartData.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
          <h2 className="text-sm font-medium text-gray-700 mb-4">
            Sleep · wake time · performance gap
          </h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="date"
                tick={{ fontSize: 10, fill: '#9ca3af' }}
                interval={6} />
              <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} domain={[0, 14]} />
              <Tooltip
                contentStyle={{
                  fontSize: 12, borderRadius: 12,
                  border: '1px solid #e5e7eb'
                }} />
              <Line type="monotone" dataKey="sleep"
                stroke="#111827" strokeWidth={2}
                dot={false} name="Sleep hrs" />
              <Line type="monotone" dataKey="wake"
                stroke="#9ca3af" strokeWidth={2}
                dot={false} name="Wake time" />
              <Line type="monotone" dataKey="gap"
                stroke="#ef4444" strokeWidth={2}
                dot={false} name="Performance gap" />
            </LineChart>
          </ResponsiveContainer>
          <div className="flex gap-5 mt-3 text-xs text-gray-400">
            {[
              ['#111827', 'Sleep hours'],
              ['#9ca3af', 'Wake time'],
              ['#ef4444', 'Performance gap'],
            ].map(([c, l]) => (
              <span key={l} className="flex items-center gap-1.5">
                <span className="w-4 h-0.5 inline-block rounded-full"
                  style={{ background: c }} />
                {l}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Attendance Heatmap */}
      {history.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
          <h2 className="text-sm font-medium text-gray-700 mb-4">
            Class attendance — last {history.length} days
          </h2>
          <div className="flex flex-wrap gap-1.5">
            {history.map((e, i) => (
              <div key={i}
                title={`${e.date}: ${e.attended_class ? 'Attended' : 'Missed'}`}
                className={`w-6 h-6 rounded-md ${
                  e.attended_class ? 'bg-gray-900' : 'bg-red-200'
                }`} />
            ))}
          </div>
          <div className="flex gap-4 mt-3 text-xs text-gray-400">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-gray-900 inline-block" />
              Attended
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-red-200 inline-block" />
              Missed
            </span>
          </div>
        </div>
      )}

            {/* Calendar */}
      <Calendar history={history} />

      {/* CTA */}
      <a href={`/insight?user=${uid}`}
        className="block w-full bg-gray-900 text-white py-4 rounded-2xl
                   font-medium hover:bg-gray-700 transition text-center text-base">
        Get Chhaya's insight →
      </a>

    </div>
  )
}

export default function DashboardPage() {
  return (
    <Suspense>
      <Dashboard />
    </Suspense>
  )
}
