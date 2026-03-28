'use client'
import { useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

const WAKE_LABELS: Record<number, string> = {
  5: '5:00am', 6: '6:00am', 7: '7:00am', 8: '8:00am',
  9: '9:00am', 10: '10:00am', 11: '11:00am', 12: '12:00pm',
  13: '1:00pm', 14: '2:00pm'
}

const GAP_LABELS: Record<number, string> = {
  1: 'Fully myself',
  2: 'Mostly myself',
  3: 'Somewhat masked',
  4: 'Very different',
  5: 'Completely masked'
}

function YesNo({
  label, sublabel, value, onChange
}: {
  label: string
  sublabel?: string
  value: boolean | null
  onChange: (v: boolean) => void
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-4">
      <p className="text-sm font-medium text-gray-700 mb-1">{label}</p>
      {sublabel && (
        <p className="text-xs text-gray-400 mb-3">{sublabel}</p>
      )}
      <div className="flex gap-3">
        {[true, false].map(v => (
          <button key={String(v)}
            onClick={() => onChange(v)}
            className={`flex-1 py-2.5 rounded-xl text-sm
                        font-medium transition ${
              value === v
                ? 'bg-gray-900 text-white'
                : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
            }`}>
            {v ? '✅ Yes' : '❌ No'}
          </button>
        ))}
      </div>
    </div>
  )
}

function CheckInForm() {
  const params = useSearchParams()
  const router = useRouter()
  const uid    = params.get('user') || 'demo_maya'

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric'
  })

  const [attendedClass,      setAttendedClass]      = useState<boolean | null>(null)
  const [wakeTime,           setWakeTime]           = useState(8)
  const [leftRoom,           setLeftRoom]           = useState<boolean | null>(null)
  const [ateMeal,            setAteMeal]            = useState<boolean | null>(null)
  const [performanceGap,     setPerformanceGap]     = useState(3)
  const [sleepHours,         setSleepHours]         = useState(7)
  const [note,               setNote]               = useState('')
  const [cognitiveFriction,  setCognitiveFriction]  = useState<boolean | null>(null)
  const [actualSunlight,     setActualSunlight]     = useState<boolean | null>(null)
  const [completionSense,    setCompletionSense]    = useState<boolean | null>(null)
  const [busy,               setBusy]               = useState(false)
  const [done,               setDone]               = useState(false)

  async function submit() {
    if (
      attendedClass     === null ||
      leftRoom          === null ||
      ateMeal           === null ||
      cognitiveFriction === null ||
      actualSunlight    === null ||
      completionSense   === null
    ) {
      alert('Please answer all questions before submitting.')
      return
    }

    setBusy(true)
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/checkin/`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id:            uid,
          attended_class:     attendedClass,
          wake_time:          wakeTime,
          left_room:          leftRoom,
          ate_meal:           ateMeal,
          performance_gap:    performanceGap,
          sleep_hours:        sleepHours,
          note:               note,
          city:               'New York',
          cognitive_friction: cognitiveFriction,
          actual_sunlight:    actualSunlight,
          completion_sense:   completionSense
        })
      })
      setDone(true)
      setTimeout(() => router.push(`/dashboard?user=${uid}`), 2500)
    } catch (e) {
      console.error(e)
    } finally {
      setBusy(false)
    }
  }

  if (done) return (
    <div className="max-w-md mx-auto px-6 py-24 text-center">
      <div className="text-5xl mb-4">🌑</div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">
        Chhaya sees you.
      </h2>
      <p className="text-gray-400 text-sm">
        Taking you to your dashboard...
      </p>
    </div>
  )

  return (
    <div className="max-w-md mx-auto px-6 py-12">

      {/* Header */}
      <h1 className="text-2xl font-semibold text-gray-900 mb-1">
        Today's check-in
      </h1>
      <p className="text-gray-400 text-sm mb-1">
        {today}
      </p>
      <p className="text-gray-300 text-xs mb-8">
        60 seconds. Chhaya does the rest.
      </p>

      {/* Q1 — Attendance */}
      <YesNo
        label="Did you make it to your classes today?"
        sublabel="Skip if you have no classes today."
        value={attendedClass}
        onChange={setAttendedClass}
      />

      {/* Q2 — Wake Time */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-4">
        <div className="flex justify-between mb-3">
          <p className="text-sm font-medium text-gray-700">
            What time did you wake up?
          </p>
          <span className="text-sm text-gray-900 font-semibold">
            {WAKE_LABELS[wakeTime] || `${wakeTime}:00`}
          </span>
        </div>
        <input type="range" min={5} max={14} step={1}
          value={wakeTime}
          onChange={e => setWakeTime(parseInt(e.target.value))}
          className="w-full accent-gray-900" />
        <div className="flex justify-between text-xs text-gray-300 mt-1">
          <span>5am</span><span>2pm</span>
        </div>
      </div>

      {/* Q3 — Left Room */}
      <YesNo
        label="Did you leave your room or building today?"
        value={leftRoom}
        onChange={setLeftRoom}
      />

      {/* Q4 — Ate Meal */}
      <YesNo
        label="Did you eat a proper meal today?"
        sublabel="A snack doesn't count. A real meal."
        value={ateMeal}
        onChange={setAteMeal}
      />

      {/* Q5 — Performance Gap */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-4">
        <div className="flex justify-between mb-1">
          <p className="text-sm font-medium text-gray-700">
            How close were you to your real self today?
          </p>
          <span className="text-xs text-gray-500 font-medium">
            {GAP_LABELS[performanceGap]}
          </span>
        </div>
        <p className="text-xs text-gray-400 mb-3">
          The gap between how you showed up and how you actually felt.
        </p>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map(v => (
            <button key={v}
              onClick={() => setPerformanceGap(v)}
              className={`flex-1 h-10 rounded-xl text-sm
                          font-medium transition ${
                performanceGap === v
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
              }`}>
              {v}
            </button>
          ))}
        </div>
        <div className="flex justify-between text-xs text-gray-300 mt-2">
          <span>Fully myself</span>
          <span>Completely masked</span>
        </div>
      </div>

      {/* Q6 — Sleep Hours */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-4">
        <div className="flex justify-between mb-3">
          <p className="text-sm font-medium text-gray-700">
            How many hours did you sleep?
          </p>
          <span className="text-sm text-gray-900 font-semibold">
            {sleepHours}h
          </span>
        </div>
        <input type="range" min={2} max={12} step={0.5}
          value={sleepHours}
          onChange={e => setSleepHours(parseFloat(e.target.value))}
          className="w-full accent-gray-900" />
        <div className="flex justify-between text-xs text-gray-300 mt-1">
          <span>2h</span><span>12h</span>
        </div>
      </div>

      {/* Divider — New Science Questions */}
      <div className="flex items-center gap-3 my-6">
        <div className="flex-1 h-px bg-gray-100" />
        <span className="text-xs text-gray-300 font-medium">
          3 more — takes 20 seconds
        </span>
        <div className="flex-1 h-px bg-gray-100" />
      </div>

      {/* Q7 — Cognitive Friction */}
      <YesNo
        label="Did you find it hard to start tasks today?"
        sublabel="Even simple ones — like replying to a message or opening a document."
        value={cognitiveFriction}
        onChange={setCognitiveFriction}
      />

      {/* Q8 — Actual Sunlight */}
      <YesNo
        label="Did you spend time in natural daylight today?"
        sublabel="Sitting by a window doesn't count. Actually outside."
        value={actualSunlight}
        onChange={setActualSunlight}
      />

      {/* Q9 — Completion Sense */}
      <YesNo
        label="Did you finish at least one thing you intended to do today?"
        sublabel="Anything counts — a reading, an email, a workout."
        value={completionSense}
        onChange={setCompletionSense}
      />

      {/* Optional Note */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6">
        <p className="text-sm font-medium text-gray-700 mb-2">
          One sentence about today.{' '}
          <span className="text-gray-400 font-normal">(optional)</span>
        </p>
        <textarea
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="Just existing today. That's enough."
          rows={2}
          className="w-full text-sm text-gray-700 placeholder-gray-300
                     border border-gray-100 rounded-xl p-3 resize-none
                     focus:outline-none focus:border-gray-300"
        />
      </div>

      <button onClick={submit} disabled={busy}
        className="w-full bg-gray-900 text-white py-4 rounded-2xl
                   font-medium hover:bg-gray-700 transition
                   disabled:opacity-40 text-base">
        {busy ? 'Chhaya is listening...' : 'Submit check-in →'}
      </button>

      <p className="text-center text-xs text-gray-300 mt-4">
        Not a medical tool. If you are in crisis, text HOME to 741741.
      </p>

    </div>
  )
}

export default function CheckInPage() {
  return (
    <Suspense>
      <CheckInForm />
    </Suspense>
  )
}