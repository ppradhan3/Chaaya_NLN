'use client'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, AlertTriangle, TrendingDown,
         Moon, Users, Utensils, Activity } from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis,
  Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts'
import { getCheckins } from '@/lib/api'

interface ChhayaPanelProps {
  sessionId: string
  userName:  string
}

function getAcademicWeek(): { week: number; label: string } {
  const now   = new Date()
  const month = now.getMonth() + 1
  let week    = 7
  if (month >= 8 && month <= 12) {
    const start = new Date(now.getFullYear(), 7, 26)
    week = Math.max(1, Math.ceil(
      (now.getTime() - start.getTime()) / (7 * 24 * 60 * 60 * 1000)
    ))
  } else if (month >= 1 && month <= 5) {
    const start = new Date(now.getFullYear(), 0, 13)
    week = Math.max(1, Math.ceil(
      (now.getTime() - start.getTime()) / (7 * 24 * 60 * 60 * 1000)
    ))
  }
  let label = ''
  if (week >= 7 && week <= 9)
    label = 'midterm season — one of the most documented stress peaks'
  else if (week >= 13)
    label = 'finals stretch — the hardest weeks of the semester'
  else if (week <= 3)
    label = 'early semester — building your rhythm'
  else
    label = 'mid-semester — deep in the flow'
  return { week, label }
}

export function ChhayaPanel({ sessionId, userName }: ChhayaPanelProps) {
  const [checkins,  setCheckins]  = useState<any[]>([])
  const [loading,   setLoading]   = useState(true)
  const [expanded,  setExpanded]  = useState<string | null>(null)

  useEffect(() => {
    getCheckins(sessionId, 42)
      .then(data => { setCheckins(data); setLoading(false) })
      .catch(()  => setLoading(false))
  }, [sessionId])

  if (loading) return (
    <div className="flex flex-col items-center justify-center
                    h-full gap-4 text-white/30">
      <Loader2 className="w-6 h-6 animate-spin" />
      <p className="text-[10px] tracking-[0.3em] uppercase">
        Chhaya is reading your patterns...
      </p>
    </div>
  )

  const { week, label } = getAcademicWeek()

  // Stats
  const total        = checkins.length
  const attended     = checkins.filter(c => c.attendedClass).length
  const attendPct    = total > 0
    ? Math.round(attended / total * 100) : 0
  const avgMask      = total > 0
    ? (checkins.reduce((s, c) => s + c.maskingLevel, 0) / total).toFixed(1)
    : '—'
  const lateNights   = checkins.filter(c => c.isLateNight).length
  const isolated     = checkins.filter(c => c.leftRoom === false).length

  // Baseline vs recent
  const recent7  = checkins.slice(0, 7)
  const older    = checkins.slice(7, 21)
  const recentSleep = recent7.length > 0
    ? recent7.reduce((s, c) => s + (c.sleep_hours || 7), 0) / recent7.length
    : 7
  const olderSleep = older.length > 0
    ? older.reduce((s, c) => s + (c.sleep_hours || 7), 0) / older.length
    : 7
  const recentAttend = recent7.length > 0
    ? recent7.filter(c => c.attendedClass).length / recent7.length : 1
  const olderAttend  = older.length > 0
    ? older.filter(c => c.attendedClass).length / older.length : 1
  const recentIso    = recent7.length > 0
    ? recent7.filter(c => c.leftRoom === false).length / recent7.length : 0
  const recentMask   = recent7.length > 0
    ? recent7.reduce((s, c) => s + c.maskingLevel, 0) / recent7.length : 0
  const olderMask    = older.length > 0
    ? older.reduce((s, c) => s + c.maskingLevel, 0) / older.length : 0

  // Signals
  const signals: any[] = []

  if (olderSleep - recentSleep >= 1) {
    signals.push({
      id:       'sleep',
      icon:     <Moon size={18} className="text-indigo-400" />,
      title:    'Sleep shift',
      severity: olderSleep - recentSleep >= 2 ? 'alert' : 'warning',
      message:  `Your sleep has dropped ${(olderSleep - recentSleep).toFixed(1)} hours from your baseline. Even one hour less sleep measurably affects focus and mood (AASM research).`
    })
  }

  if (olderAttend - recentAttend >= 0.15) {
    signals.push({
      id:       'attendance',
      icon:     <TrendingDown size={18} className="text-amber-400" />,
      title:    'Attendance drop',
      severity: recentAttend < 0.5 ? 'alert' : 'warning',
      message:  `Attending ${Math.round(recentAttend * 100)}% recently vs ${Math.round(olderAttend * 100)}% before. Class attendance is the single strongest predictor of GPA (Credé et al., 2010).`
    })
  }

  if (recentIso >= 0.3) {
    signals.push({
      id:       'isolation',
      icon:     <Users size={18} className="text-teal-400" />,
      title:    'Isolation pattern',
      severity: recentIso >= 0.5 ? 'alert' : 'warning',
      message:  `You have been staying in more than your usual pattern. Perceived isolation increases cortisol by 20% and accelerates cognitive decline (Cacioppo & Hawkley, 2009).`
    })
  }

  if (recentMask - olderMask >= 0.5 || recentMask > 3.2) {
    signals.push({
      id:       'masking',
      icon:     <Activity size={18} className="text-violet-400" />,
      title:    'Authenticity gap',
      severity: recentMask > 4 ? 'alert' : 'warning',
      message:  `The gap between who you are inside and who you show the world has widened. Sustained masking depletes the same cognitive resources used for learning (Hochschild, 1983).`
    })
  }

  if (signals.length === 0 && total > 0) {
    signals.push({
      id:       'steady',
      icon:     <Activity size={18} className="text-emerald-400" />,
      title:    'Steady patterns',
      severity: 'notice',
      message:  'Your behavioral patterns are stable. No significant shifts detected. Keep checking in — Chhaya watches so you do not have to.'
    })
  }

  // Chart data
  const chartData = [...checkins].reverse().slice(-21).map(c => ({
    date:    (c.createdAt || c.date || '').slice(5, 10),
    sleep:   c.sleep_hours   || 7,
    masking: c.maskingLevel  || 3,
    week:    c.week_number   || 1,
  }))

  // Heatmap
  const heatmap = checkins.slice(0, 30).reverse()

  const severityBg = (s: string) =>
    s === 'alert'   ? 'rgba(239,68,68,0.05)'   :
    s === 'warning' ? 'rgba(245,158,11,0.05)'  :
                      'rgba(52,211,153,0.05)'

  const severityBorder = (s: string) =>
    s === 'alert'   ? '1px solid rgba(239,68,68,0.15)'   :
    s === 'warning' ? '1px solid rgba(245,158,11,0.12)'  :
                      '1px solid rgba(52,211,153,0.12)'

  const severityDot = (s: string) =>
    s === 'alert'   ? 'bg-red-400'    :
    s === 'warning' ? 'bg-amber-400'  :
                      'bg-emerald-400'

  return (
    <div className="flex flex-col px-5 pt-3 pb-16
                    overflow-y-auto space-y-5 h-full">

      {/* Header */}
      <div className="space-y-1">
        <p className="text-[10px] tracking-[0.3em] uppercase text-white/20">
          Chhaya · Your patterns
        </p>
        <p className="text-xs text-white/35">
          {total} day{total !== 1 ? 's' : ''} tracked
          · Week {week} of semester
        </p>
      </div>

      {/* Week context */}
      {week >= 6 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-4 py-3 rounded-xl"
          style={{
            background: 'rgba(139,92,246,0.08)',
            border:     '1px solid rgba(139,92,246,0.15)'
          }}>
          <p className="text-xs text-white/50 leading-relaxed">
            You are in{' '}
            <span className="text-violet-300/80">
              Week {week}
            </span>{' '}
            — {label}. What you are feeling is real,
            predictable, and temporary.
          </p>
        </motion.div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Attendance',  value: `${attendPct}%`  },
          { label: 'Avg gap',     value: `${avgMask}/5`   },
          { label: 'Late nights', value: `${lateNights}`  },
        ].map(s => (
          <div key={s.label}
            className="rounded-xl px-3 py-3 text-center"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border:     '1px solid rgba(255,255,255,0.08)'
            }}>
            <p className="text-lg font-light text-white/70">
              {s.value}
            </p>
            <p className="text-[9px] tracking-widest uppercase
                          text-white/25 mt-1">
              {s.label}
            </p>
          </div>
        ))}
      </div>

      {/* Chart */}
      {chartData.length > 2 && (
        <div className="rounded-xl p-4 space-y-2"
             style={{
               background: 'rgba(255,255,255,0.03)',
               border:     '1px solid rgba(255,255,255,0.08)'
             }}>
          <p className="text-[9px] tracking-[0.3em] uppercase
                        text-white/25">
            Sleep · masking — last {chartData.length} days
          </p>
          <ResponsiveContainer width="100%" height={120}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3"
                             stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date"
                tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.2)' }}
                interval={6} />
              <YAxis
                tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.2)' }}
                domain={[0, 12]} />
              <Tooltip
                contentStyle={{
                  background:   '#0d1a14',
                  border:       '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 8,
                  fontSize:     11,
                  color:        'rgba(255,255,255,0.7)'
                }} />
              <Line type="monotone" dataKey="sleep"
                stroke="rgba(139,92,246,0.8)"
                strokeWidth={2} dot={false}
                name="Sleep hrs" />
              <Line type="monotone" dataKey="masking"
                stroke="rgba(239,68,68,0.6)"
                strokeWidth={2} dot={false}
                name="Masking /5" />
            </LineChart>
          </ResponsiveContainer>
          <div className="flex gap-4 text-[9px] text-white/25">
            {[
              ['rgba(139,92,246,0.8)', 'Sleep hrs'],
              ['rgba(239,68,68,0.6)',  'Masking /5'],
            ].map(([c, l]) => (
              <span key={l as string}
                    className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 inline-block rounded-full"
                      style={{ background: c as string }} />
                {l}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Signal heatmap */}
      {heatmap.length > 0 && (
        <div className="space-y-3">
          <p className="text-[10px] tracking-[0.3em] uppercase
                        text-white/20">
            Signal heatmap — last {heatmap.length} check-ins
          </p>
          <div className="flex gap-1.5 flex-wrap">
            {heatmap.map((c, i) => {
              const issues = [
                !c.attendedClass,
                c.leftRoom === false,
                !c.ateWell,
                (c.sleep_hours || 7) < 5,
                c.maskingLevel >= 4
              ].filter(Boolean).length

              const color =
                issues === 0 ? 'rgba(52,211,153,0.4)'  :
                issues === 1 ? 'rgba(251,191,36,0.3)'  :
                issues === 2 ? 'rgba(249,115,22,0.35)' :
                               'rgba(239,68,68,0.3)'

              return (
                <motion.div key={i}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.02 }}
                  className="w-5 h-5 rounded-sm"
                  style={{ background: color }}
                  title={(c.createdAt || '').slice(0, 10)}
                />
              )
            })}
          </div>
          <div className="flex gap-3 text-[9px] text-white/25">
            {[
              ['rgba(52,211,153,0.4)',  'Strong'],
              ['rgba(251,191,36,0.3)',  '1 signal'],
              ['rgba(249,115,22,0.35)', '2'],
              ['rgba(239,68,68,0.3)',   '3+'],
            ].map(([c, l]) => (
              <span key={l} className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm inline-block"
                      style={{ background: c }} />
                {l}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Signals */}
      {signals.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] tracking-[0.3em] uppercase
                        text-white/20 flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full
                             bg-violet-500/50 animate-pulse" />
            Chhaya has noticed
          </p>
          {signals.map(signal => (
            <motion.button key={signal.id}
              onClick={() => setExpanded(
                expanded === signal.id ? null : signal.id
              )}
              className="w-full text-left rounded-xl px-4 py-3
                         transition-all duration-300"
              style={{
                background: severityBg(signal.severity),
                border:     severityBorder(signal.severity)
              }}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-center gap-3">
                {signal.icon}
                <span className="text-sm text-white/60
                                 font-medium flex-1">
                  {signal.title}
                </span>
                {signal.severity !== 'notice' && (
                  <AlertTriangle size={14}
                    className={
                      signal.severity === 'alert'
                        ? 'text-red-400/60'
                        : 'text-amber-400/40'
                    } />
                )}
              </div>
              <AnimatePresence>
                {expanded === signal.id && (
                  <motion.p
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="text-xs text-white/40 leading-relaxed
                               mt-3 overflow-hidden">
                    {signal.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.button>
          ))}
        </div>
      )}

      {/* Empty state */}
      {total === 0 && (
        <div className="flex flex-col items-center justify-center
                        flex-1 gap-4 text-white/20">
          <p className="text-sm">No check-ins yet.</p>
          <p className="text-xs text-center max-w-[200px]
                        leading-relaxed">
            Hold the orb on the home screen to record your first day.
          </p>
        </div>
      )}

            {/* Navigable Calendar */}
      {checkins.length > 0 && (
        <DarkCalendar checkins={checkins} />
      )}

      {/* Disclaimer */}
      <p className="text-[9px] text-white/15 text-center
                    leading-relaxed pt-4">
        Chhaya is a behavioral tracking tool, not a medical application.
        If you are struggling, text HOME to 741741.
      </p>

    </div>
  )
}

function DarkCalendar({ checkins }: { checkins: any[] }) {
  const today = new Date()
  const [current, setCurrent] = useState({
    month: today.getMonth(),
    year:  today.getFullYear()
  })
  const [selected, setSelected] = useState<any | null>(null)

  const MONTHS = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December'
  ]
  const DAYS = ['S','M','T','W','T','F','S']

  // Build date → checkin map
  const entryMap: Record<string, any> = {}
  checkins.forEach(c => {
    const date = (c.createdAt || c.date || '').slice(0, 10)
    if (date) entryMap[date] = c
  })

  function prevMonth() {
    setCurrent(c => c.month === 0
      ? { month: 11, year: c.year - 1 }
      : { month: c.month - 1, year: c.year })
    setSelected(null)
  }

  function nextMonth() {
    setCurrent(c => c.month === 11
      ? { month: 0, year: c.year + 1 }
      : { month: c.month + 1, year: c.year })
    setSelected(null)
  }

  const firstDay    = new Date(current.year, current.month, 1).getDay()
  const daysInMonth = new Date(current.year, current.month + 1, 0).getDate()

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1)
  ]

  function dateStr(day: number) {
    const m = String(current.month + 1).padStart(2, '0')
    const d = String(day).padStart(2, '0')
    return `${current.year}-${m}-${d}`
  }

  function getDotColor(entry: any) {
    if (!entry) return 'rgba(255,255,255,0.06)'
    const issues = [
      !entry.attendedClass,
      entry.leftRoom === false,
      !entry.ateWell,
      (entry.sleep_hours || 7) < 5,
      entry.maskingLevel >= 4
    ].filter(Boolean).length
    if (issues >= 3) return 'rgba(239,68,68,0.5)'
    if (issues === 2) return 'rgba(249,115,22,0.45)'
    if (issues === 1) return 'rgba(251,191,36,0.4)'
    return 'rgba(52,211,153,0.45)'
  }

  function isToday(day: number) {
    return (
      day === today.getDate() &&
      current.month === today.getMonth() &&
      current.year === today.getFullYear()
    )
  }

  // Count check-ins this month
  const monthKey = `${current.year}-${String(current.month + 1).padStart(2,'0')}`
  const monthCount = Object.keys(entryMap)
    .filter(d => d.startsWith(monthKey)).length

  return (
    <div className="rounded-xl p-4 space-y-4"
         style={{
           background: 'rgba(255,255,255,0.03)',
           border:     '1px solid rgba(255,255,255,0.08)'
         }}>

      {/* Header */}
      <div className="flex items-center justify-between">
        <button onClick={prevMonth}
          className="w-7 h-7 flex items-center justify-center
                     rounded-lg transition-colors text-white/40
                     hover:text-white/70 text-lg"
          style={{ background: 'rgba(255,255,255,0.05)' }}>
          ←
        </button>
        <div className="text-center">
          <p className="text-xs font-medium text-white/60">
            {MONTHS[current.month]} {current.year}
          </p>
          <p className="text-[9px] text-white/25 mt-0.5">
            {monthCount} check-in{monthCount !== 1 ? 's' : ''} this month
          </p>
        </div>
        <button onClick={nextMonth}
          className="w-7 h-7 flex items-center justify-center
                     rounded-lg transition-colors text-white/40
                     hover:text-white/70 text-lg"
          style={{ background: 'rgba(255,255,255,0.05)' }}>
          →
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7">
        {DAYS.map((d, i) => (
          <div key={i}
            className="text-center text-[9px] text-white/20 py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (!day) return <div key={`e-${i}`} />
          const ds    = dateStr(day)
          const entry = entryMap[ds]
          const color = getDotColor(entry)
          const todayQ = isToday(day)
          const isSelected = selected?.date === ds

          return (
            <button key={ds}
              onClick={() => entry && setSelected(
                isSelected ? null : { ...entry, date: ds }
              )}
              className="aspect-square rounded-lg text-[10px]
                         font-medium flex items-center justify-center
                         transition-all"
              style={{
                background: color,
                color:      entry
                  ? 'rgba(255,255,255,0.8)'
                  : 'rgba(255,255,255,0.15)',
                outline:    todayQ
                  ? '1px solid rgba(255,255,255,0.4)'
                  : 'none',
                transform:  isSelected ? 'scale(1.1)' : 'scale(1)',
                cursor:     entry ? 'pointer' : 'default',
              }}>
              {day}
            </button>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-[9px] text-white/25">
        {[
          ['rgba(52,211,153,0.45)',  'Strong'],
          ['rgba(251,191,36,0.4)',   '1 signal'],
          ['rgba(249,115,22,0.45)',  '2 signals'],
          ['rgba(239,68,68,0.5)',    '3+ signals'],
          ['rgba(255,255,255,0.06)', 'No data'],
        ].map(([c, l]) => (
          <span key={l} className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm inline-block"
                  style={{ background: c }} />
            {l}
          </span>
        ))}
      </div>

      {/* Selected day detail */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{   opacity: 0, height: 0 }}
            className="overflow-hidden">
            <div className="border-t pt-4 mt-2 space-y-3"
                 style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
              <div className="flex justify-between items-center">
                <p className="text-xs text-white/50 font-medium">
                  {selected.date}
                </p>
                <p className="text-[10px] text-white/25">
                  Week {selected.week_number || '—'}
                  {selected.weatherDesc
                    ? ` · ${selected.weatherDesc}` : ''}
                  {selected.weatherTemp
                    ? ` · ${selected.weatherTemp}°F` : ''}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  {
                    label: '😴 Sleep',
                    value: `${selected.sleep_hours || selected.sleepHours || 7}h`,
                    good:  (selected.sleep_hours || 7) >= 7
                  },
                  {
                    label: '📚 Class',
                    value: selected.attendedClass ? 'Attended' : 'Missed',
                    good:  selected.attendedClass
                  },
                  {
                    label: '🚪 Left room',
                    value: selected.leftRoom !== false ? 'Yes' : 'No',
                    good:  selected.leftRoom !== false
                  },
                  {
                    label: '🍽️ Ate meal',
                    value: selected.ateWell !== false ? 'Yes' : 'No',
                    good:  selected.ateWell !== false
                  },
                  {
                    label: '🎭 Masking',
                    value: `${selected.maskingLevel || 3}/5`,
                    good:  (selected.maskingLevel || 3) <= 2
                  },
                  {
                    label: '🌤️ Weather',
                    value: selected.weather_desc
                        || selected.weatherDesc || '—',
                    good:  true
                  },
                ].map(s => (
                  <div key={s.label}
                    className="rounded-xl px-3 py-2"
                    style={{
                      background: s.good
                        ? 'rgba(52,211,153,0.08)'
                        : 'rgba(239,68,68,0.08)',
                      border: s.good
                        ? '1px solid rgba(52,211,153,0.15)'
                        : '1px solid rgba(239,68,68,0.15)'
                    }}>
                    <p className="text-[9px] text-white/30">
                      {s.label}
                    </p>
                    <p className="text-xs font-medium mt-0.5"
                       style={{
                         color: s.good
                           ? 'rgba(52,211,153,0.8)'
                           : 'rgba(239,68,68,0.7)'
                       }}>
                      {s.value}
                    </p>
                  </div>
                ))}
              </div>
              <button onClick={() => setSelected(null)}
                className="w-full text-[10px] text-white/20
                           hover:text-white/40 transition-colors py-1">
                Close ×
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}
