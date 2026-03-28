export default function Home() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-24 text-center">
      <div className="text-6xl mb-6">🌑</div>
      <h1 className="text-5xl font-semibold text-gray-900 mb-3 leading-tight">
        Chhaya
      </h1>
      <p className="text-2xl text-gray-400 mb-4 font-light">छाया</p>
      <p className="text-lg text-gray-500 mb-2 italic">
        "Your shadow knows before you do."
      </p>
      <p className="text-gray-400 text-base mb-12 leading-relaxed max-w-lg mx-auto">
        A behavioral awareness companion for college students.
        Chhaya watches your patterns silently — and speaks up
        when something shifts, before you feel it yourself.
      </p>
      <div className="grid grid-cols-1 gap-3 max-w-sm mx-auto mb-12">
        <a href="/onboarding"
          className="bg-gray-900 text-white px-6 py-4 rounded-2xl font-medium hover:bg-gray-700 transition text-center">
          Get started →
        </a>
        <a href="/dashboard?user=demo_maya"
          className="bg-white border border-gray-200 text-gray-700 px-6 py-4 rounded-2xl font-medium hover:bg-gray-50 transition text-center">
          View Maya's dashboard
        </a>
        <a href="/insight?user=demo_maya"
          className="bg-white border border-gray-200 text-gray-700 px-6 py-4 rounded-2xl font-medium hover:bg-gray-50 transition text-center">
          Get Chhaya's insight
        </a>
      </div>
      <div className="grid grid-cols-3 gap-6 text-center max-w-lg mx-auto">
        {[
          { icon: "🌙", label: "Sleep patterns" },
          { icon: "📚", label: "Class attendance" },
          { icon: "🚶", label: "Daily movement" },
        ].map(f => (
          <div key={f.label} className="bg-white rounded-2xl border border-gray-100 p-4">
            <div className="text-2xl mb-2">{f.icon}</div>
            <div className="text-xs text-gray-400">{f.label}</div>
          </div>
        ))}
      </div>
      <p className="mt-12 text-xs text-gray-300 max-w-md mx-auto">
        Chhaya is a behavioral tracking tool, not a medical application.
        It does not diagnose or treat any condition.
        If you are in crisis, please text HOME to 741741.
      </p>
    </div>
  )
}