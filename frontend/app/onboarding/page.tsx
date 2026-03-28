'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const UNIVERSITIES = [
  'State University', 'City College', 'Community College',
  'Technical University', 'Liberal Arts College', 'Other'
]

export default function OnboardingPage() {
  const router = useRouter()
  const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

  const [step, setStep]                   = useState(1)
  const [name, setName]                   = useState('')
  const [university, setUniversity]       = useState('')
  const [semesterStart, setSemesterStart] = useState('')
  const [loading, setLoading]             = useState(false)
  const [error, setError]                 = useState('')

  function generateId(name: string) {
    return name.toLowerCase().replace(/\s+/g, '_') 
           + '_' + Math.random().toString(36).slice(2, 6)
  }

  async function createUser() {
    if (!name.trim()) {
      setError('Please enter your name.')
      return
    }
    if (!university.trim()) {
      setError('Please enter your university.')
      return
    }
    if (!semesterStart) {
      setError('Please enter your semester start date.')
      return
    }

    setLoading(true)
    setError('')

    const uid = generateId(name)

    try {
      const res = await fetch(`${API}/users/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id:             uid,
          name:           name.trim(),
          university:     university.trim(),
          semester_start: semesterStart
        })
      })

      if (!res.ok) throw new Error('Failed to create user')

      // Save to localStorage so we remember who this is
      localStorage.setItem('chhaya_user_id',   uid)
      localStorage.setItem('chhaya_user_name', name.trim())

      router.push(`/checkin?user=${uid}`)

    } catch (e) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto px-6 py-16">

      {/* Step indicator */}
      <div className="flex gap-2 mb-10">
        {[1, 2, 3].map(s => (
          <div key={s}
            className={`h-1 flex-1 rounded-full transition-all ${
              s <= step ? 'bg-gray-900' : 'bg-gray-100'
            }`} />
        ))}
      </div>

      {/* Step 1 — Name */}
      {step === 1 && (
        <div>
          <div className="text-4xl mb-6">👋</div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            What's your name?
          </h1>
          <p className="text-gray-400 text-sm mb-8">
            Chhaya will use this to speak to you directly.
          </p>
          <input
            type="text"
            placeholder="Your first name"
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && name.trim() && setStep(2)}
            autoFocus
            className="w-full border border-gray-200 rounded-2xl px-4 py-4
                       text-gray-900 text-base placeholder-gray-300
                       focus:outline-none focus:border-gray-400 mb-6"
          />
          <button
            onClick={() => name.trim() && setStep(2)}
            disabled={!name.trim()}
            className="w-full bg-gray-900 text-white py-4 rounded-2xl
                       font-medium hover:bg-gray-700 transition
                       disabled:opacity-30">
            Continue →
          </button>
        </div>
      )}

      {/* Step 2 — University */}
      {step === 2 && (
        <div>
          <div className="text-4xl mb-6">🎓</div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            Where do you study, {name}?
          </h1>
          <p className="text-gray-400 text-sm mb-8">
            This helps Chhaya understand your academic context.
          </p>
          <input
            type="text"
            placeholder="Your university name"
            value={university}
            onChange={e => setUniversity(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && university.trim() && setStep(3)}
            autoFocus
            className="w-full border border-gray-200 rounded-2xl px-4 py-4
                       text-gray-900 text-base placeholder-gray-300
                       focus:outline-none focus:border-gray-400 mb-3"
          />
          <div className="flex flex-wrap gap-2 mb-6">
            {UNIVERSITIES.map(u => (
              <button key={u}
                onClick={() => setUniversity(u)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${
                  university === u
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}>
                {u}
              </button>
            ))}
          </div>
          <div className="flex gap-3">
            <button onClick={() => setStep(1)}
              className="flex-1 border border-gray-200 text-gray-400
                         py-4 rounded-2xl font-medium hover:bg-gray-50 transition">
              ← Back
            </button>
            <button
              onClick={() => university.trim() && setStep(3)}
              disabled={!university.trim()}
              className="flex-1 bg-gray-900 text-white py-4 rounded-2xl
                         font-medium hover:bg-gray-700 transition disabled:opacity-30">
              Continue →
            </button>
          </div>
        </div>
      )}

      {/* Step 3 — Semester Start */}
      {step === 3 && (
        <div>
          <div className="text-4xl mb-6">📅</div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            When did your semester start?
          </h1>
          <p className="text-gray-400 text-sm mb-8">
            This is how Chhaya knows what week you're in —
            and what's coming.
          </p>
          <input
            type="date"
            value={semesterStart}
            onChange={e => setSemesterStart(e.target.value)}
            className="w-full border border-gray-200 rounded-2xl px-4 py-4
                       text-gray-900 text-base focus:outline-none
                       focus:border-gray-400 mb-6"
          />

          {error && (
            <p className="text-red-400 text-sm mb-4">{error}</p>
          )}

          <div className="flex gap-3">
            <button onClick={() => setStep(2)}
              className="flex-1 border border-gray-200 text-gray-400
                         py-4 rounded-2xl font-medium hover:bg-gray-50 transition">
              ← Back
            </button>
            <button
              onClick={createUser}
              disabled={loading || !semesterStart}
              className="flex-1 bg-gray-900 text-white py-4 rounded-2xl
                         font-medium hover:bg-gray-700 transition disabled:opacity-30">
              {loading ? 'Setting up...' : 'Start with Chhaya →'}
            </button>
          </div>

          <p className="text-xs text-gray-300 text-center mt-6 leading-relaxed">
            Chhaya is a behavioral tracking tool, not a medical application.
            Your data stays private.
          </p>
        </div>
      )}

    </div>
  )
}