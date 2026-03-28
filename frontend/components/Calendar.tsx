'use client'
import { useState } from 'react'

interface Entry {
  date: string
  sleep_hours: number
  attended_class: boolean
  left_room: boolean
  ate_meal: boolean
  performance_gap: number
  weather_desc: string
  week_number: number
}

interface CalendarProps {
  history: Entry[]
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

function getDayColor(entry: Entry | undefined): string {
  if (!entry) return 'bg-gray-50 text-gray-300'

  const issues = [
    !entry.attended_class,
    !entry.left_room,
    !entry.ate_meal,
    entry.sleep_hours < 5,
    entry.performance_gap >= 4
  ].filter(Boolean).length

  if (issues >= 3) return 'bg-red-400 text-white'
  if (issues === 2) return 'bg-orange-300 text-white'
  if (issues === 1) return 'bg-yellow-200 text-gray-700'
  return 'bg-green-400 text-white'
}

function getTooltip(entry: Entry | undefined, date: string): string {
  if (!entry) return 'No check-in'
  const lines = [
    `Sleep: ${entry.sleep_hours}h`,
    `Class: ${entry.attended_class ? '✅' : '❌'}`,
    `Left room: ${entry.left_room ? '✅' : '❌'}`,
    `Ate meal: ${entry.ate_meal ? '✅' : '❌'}`,
    `Gap: ${entry.performance_gap}/5`,
    `Week ${entry.week_number}`,
  ]
  return lines.join('\n')
}

export default function Calendar({ history }: CalendarProps) {
  const today = new Date()
  const [current, setCurrent] = useState({
    month: today.getMonth(),
    year:  today.getFullYear()
  })
  const [selected, setSelected] = useState<Entry | null>(null)

  // Build a map of date string → entry
  const entryMap: Record<string, Entry> = {}
  history.forEach(e => { entryMap[e.date] = e })

  // Navigate months
  function prevMonth() {
    setCurrent(c => {
      if (c.month === 0) return { month: 11, year: c.year - 1 }
      return { month: c.month - 1, year: c.year }
    })
    setSelected(null)
  }

  function nextMonth() {
    setCurrent(c => {
      if (c.month === 11) return { month: 0, year: c.year + 1 }
      return { month: c.month + 1, year: c.year }
    })
    setSelected(null)
  }

  // Build calendar grid
  const firstDay = new Date(current.year, current.month, 1).getDay()
  const daysInMonth = new Date(current.year, current.month + 1, 0).getDate()

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1)
  ]

  function dateStr(day: number): string {
    const m = String(current.month + 1).padStart(2, '0')
    const d = String(day).padStart(2, '0')
    return `${current.year}-${m}-${d}`
  }

  function isToday(day: number): boolean {
    return (
      day === today.getDate() &&
      current.month === today.getMonth() &&
      current.year === today.getFullYear()
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={prevMonth}
          className="w-8 h-8 flex items-center justify-center
                     rounded-xl hover:bg-gray-100 transition text-gray-500">
          ←
        </button>
        <h2 className="text-sm font-semibold text-gray-900">
          {MONTHS[current.month]} {current.year}
        </h2>
        <button onClick={nextMonth}
          className="w-8 h-8 flex items-center justify-center
                     rounded-xl hover:bg-gray-100 transition text-gray-500">
          →
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-2">
        {DAYS.map(d => (
          <div key={d}
            className="text-center text-xs text-gray-300 font-medium py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (!day) return <div key={`empty-${i}`} />

          const ds    = dateStr(day)
          const entry = entryMap[ds]
          const color = getDayColor(entry)
          const today = isToday(day)

          return (
            <button key={ds}
             onClick={() => {
                setSelected(entry || null)
              }}
              title={getTooltip(entry, ds)}
              className={`
                aspect-square rounded-xl text-xs font-medium
                flex items-center justify-center transition
                ${color}
                ${today ? 'ring-2 ring-gray-900 ring-offset-1' : ''}
                ${entry ? 'hover:opacity-80 cursor-pointer' : 'cursor-default'}
              `}>
              {day}
            </button>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mt-4 text-xs text-gray-400">
        {[
          { color: 'bg-green-400',  label: 'Strong day' },
          { color: 'bg-yellow-200', label: '1 signal' },
          { color: 'bg-orange-300', label: '2 signals' },
          { color: 'bg-red-400',    label: '3+ signals' },
          { color: 'bg-gray-50 border border-gray-100', label: 'No check-in' },
        ].map(l => (
          <span key={l.label} className="flex items-center gap-1.5">
            <span className={`w-3 h-3 rounded-md inline-block ${l.color}`} />
            {l.label}
          </span>
        ))}
      </div>

      {/* Selected Day Detail */}
      {selected && (
        <div className="mt-4 border-t border-gray-50 pt-4">
          <p className="text-xs font-medium text-gray-500 mb-3">
            {selected.date} · Week {selected.week_number}
          </p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Sleep',       value: `${selected.sleep_hours}h` },
              { label: 'Wake time',   value: `${selected.wake_time}:00` },
              { label: 'Class',       value: selected.attended_class ? '✅ Attended' : '❌ Missed' },
              { label: 'Left room',   value: selected.left_room ? '✅ Yes' : '❌ No' },
              { label: 'Ate meal',    value: selected.ate_meal ? '✅ Yes' : '❌ No' },
              { label: 'Real self',   value: `${selected.performance_gap}/5` },
              { label: 'Weather',     value: selected.weather_desc || '—' },
            ].map(s => (
              <div key={s.label}
                className="bg-gray-50 rounded-xl px-3 py-2">
                <div className="text-xs text-gray-400">{s.label}</div>
                <div className="text-sm font-medium text-gray-700 mt-0.5">
                  {s.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}