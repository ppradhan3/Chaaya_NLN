'use client'
import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

interface Action {
  type: string
  title: string
  description: string
  content: {
    subject?: string
    body?: string
  } | null
}

interface InsightData {
  insight: string
  week_number: number
  shifts: Array<{ type: string; severity: string; message: string }>
  disclaimer: string
}

function InsightPage() {
  const params = useSearchParams()
  const uid = params.get('user') || 'demo_maya'
  const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

  const [insight, setInsight]     = useState<InsightData | null>(null)
  const [actions, setActions]     = useState<Action[]>([])
  const [loading, setLoading]     = useState(false)
  const [expanded, setExpanded]   = useState<string | null>(null)
  const [copied, setCopied]       = useState<string | null>(null)

  async function generate() {
    setLoading(true)
    try {
      const [insightRes, actionsRes] = await Promise.all([
        fetch(`${API}/insights/${uid}`).then(r => r.json()),
        fetch(`${API}/actions/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id:         uid,
            professor_name:  'Professor',
            course_name:     'your course',
            classes_missed:  3,
            assignment_late: true
          })
        }).then(r => r.json())
      ])
      setInsight(insightRes)
      setActions(actionsRes.actions || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  function copy(text: string, id: string) {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const actionIcons: Record<string, string> = {
    professor_email: '✉️',
    walk:            '🚶',
    counseling:      '💬',
    meal:            '🍽️'
  }

  return (
    <div className="max-w-xl mx-auto px-6 py-10">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">
          Chhaya's insight
        </h1>
        <p className="text-sm text-gray-400">
          Based on your behavioral patterns — not a diagnosis.
          Never a diagnosis.
        </p>
      </div>

      {/* Generate Button */}
      {!insight && (
        <button onClick={generate} disabled={loading}
          className="w-full bg-gray-900 text-white py-4 rounded-2xl
                     font-medium hover:bg-gray-700 transition
                     disabled:opacity-40 text-base mb-6">
          {loading
            ? 'Chhaya is reading your patterns...'
            : 'Generate insight →'}
        </button>
      )}

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-2xl border border-gray-100 p-8
                        text-center text-gray-400 mb-6">
          <div className="text-4xl mb-4">🌑</div>
          <p className="text-sm">
            Chhaya has been watching. Give it a moment to find the words.
          </p>
        </div>
      )}

      {/* Insight Card */}
      {insight && !loading && (
        <>
          <div className="bg-gray-900 text-white rounded-2xl p-6 mb-4">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">🌑</span>
              <span className="text-sm font-medium text-gray-300">
                Week {insight.week_number} · Chhaya sees this
              </span>
            </div>
            <p className="text-base leading-relaxed">
              {insight.insight}
            </p>
          </div>

          {/* Disclaimer */}
          <div className="bg-gray-50 rounded-2xl border border-gray-100
                          p-4 mb-6 text-xs text-gray-400 leading-relaxed">
            {insight.disclaimer}
          </div>

          {/* Actions */}
          {actions.length > 0 && (
            <div className="mb-6">
              <h2 className="text-sm font-medium text-gray-700 mb-3">
                What Chhaya suggests right now
              </h2>
              <div className="space-y-3">
                {actions.map((action, i) => (
                  <div key={i}
                    className="bg-white rounded-2xl border border-gray-100 overflow-hidden">

                    {/* Action Header */}
                    <button
                      onClick={() => setExpanded(
                        expanded === action.type ? null : action.type
                      )}
                      className="w-full p-4 text-left flex items-center
                                 justify-between hover:bg-gray-50 transition">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">
                          {actionIcons[action.type] || '💡'}
                        </span>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {action.title}
                          </div>
                          <div className="text-xs text-gray-400 mt-0.5">
                            {action.description}
                          </div>
                        </div>
                      </div>
                      {action.content && (
                        <span className="text-gray-300 text-xs ml-4">
                          {expanded === action.type ? '▲' : '▼'}
                        </span>
                      )}
                    </button>

                    {/* Expandable Email Content */}
                    {expanded === action.type && action.content && (
                      <div className="border-t border-gray-50 p-4">
                        {action.content.subject && (
                          <div className="mb-3">
                            <span className="text-xs text-gray-400
                                             font-medium uppercase tracking-wide">
                              Subject
                            </span>
                            <p className="text-sm text-gray-700 mt-1">
                              {action.content.subject}
                            </p>
                          </div>
                        )}
                        {action.content.body && (
                          <div className="mb-3">
                            <span className="text-xs text-gray-400
                                             font-medium uppercase tracking-wide">
                              Message
                            </span>
                            <p className="text-sm text-gray-700 mt-1
                                          whitespace-pre-wrap leading-relaxed">
                              {action.content.body}
                            </p>
                          </div>
                        )}
                        <button
                          onClick={() => copy(
                            `Subject: ${action.content?.subject}\n\n${action.content?.body}`,
                            action.type
                          )}
                          className="w-full bg-gray-900 text-white py-2.5
                                     rounded-xl text-sm font-medium
                                     hover:bg-gray-700 transition mt-2">
                          {copied === action.type ? '✓ Copied!' : 'Copy to clipboard'}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Regenerate */}
          <button
            onClick={() => { setInsight(null); setActions([]) }}
            className="w-full border border-gray-200 text-gray-400
                       py-3 rounded-2xl text-sm hover:bg-gray-50 transition">
            Generate again
          </button>
        </>
      )}

    </div>
  )
}

export default function InsightPageWrapper() {
  return (
    <Suspense>
      <InsightPage />
    </Suspense>
  )
}
