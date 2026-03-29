'use client'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Target, Zap, Loader2, Coffee, CheckCircle2 } from 'lucide-react'
import { focusFunnel } from '@/lib/api'
import type { WeatherData } from '@/hooks/use-weather-sync'

interface FocusPanelProps {
  sessionId: string
  weather:   WeatherData | undefined
}

export function FocusPanel({ sessionId, weather }: FocusPanelProps) {
  const [suggestion, setSuggestion] = useState<{
    task: string,
    reasoning: string,
    estimatedTime: string
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [completed, setCompleted] = useState(false)

  useEffect(() => {
    // We send current weather and a mock task list (which would eventually come from a 'Tasks' node)
    focusFunnel({
      sessionId,
      tasks: ["Catch up on Lab 3", "Email Professor regarding absence", "Review Week 6 notes"],
      weatherDescription: weather?.description,
      sunlightHours: 8
    })
    .then(res => {
      setSuggestion(res)
      setLoading(false)
    })
    .catch(() => setLoading(false))
  }, [sessionId, weather])

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-full gap-4 text-white/20">
      <Loader2 className="w-6 h-6 animate-spin" />
      <p className="text-[10px] tracking-[0.3em] uppercase">Filtering the noise...</p>
    </div>
  )

  return (
    <div className="flex flex-col px-6 pt-4 pb-20 space-y-8 h-full overflow-y-auto">
      
      <div className="flex flex-col items-center text-center space-y-2">
        <div className="p-3 rounded-full bg-violet-500/10 text-violet-400">
          <Target size={24} />
        </div>
        <h2 className="text-sm font-light tracking-widest uppercase text-white/60">The One Thing</h2>
        <p className="text-[10px] text-white/20">Decision fatigue is real. Chhaya chose this for you.</p>
      </div>

      <AnimatePresence mode="wait">
        {!completed ? (
          <motion.div
            key="task"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="p-8 rounded-3xl space-y-6 text-center"
            style={{ 
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)' 
            }}
          >
            <div className="space-y-3">
              <p className="text-2xl font-light text-white/90 leading-tight">
                {suggestion?.task || "Take a 15-minute walk."}
              </p>
              <div className="flex items-center justify-center gap-2 text-[10px] tracking-widest uppercase text-violet-300/50">
                <Zap size={10} />
                <span>{suggestion?.estimatedTime || "15 mins"}</span>
              </div>
            </div>

            <p className="text-xs text-white/30 leading-relaxed px-4">
              {suggestion?.reasoning || "Based on the low sunlight and your recent isolation patterns, this will help reset your circadian rhythm."}
            </p>

            <button 
              onClick={() => setCompleted(true)}
              className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-xs tracking-[0.2em] uppercase text-white/60 hover:bg-white/10 transition-all active:scale-95"
            >
              Mark as Done
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="complete"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center p-12 space-y-4"
          >
            <CheckCircle2 size={48} className="text-emerald-400/50" />
            <p className="text-sm font-light text-white/40">Task complete. One petal at a time.</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 opacity-50">
        <Coffee size={14} />
        <p className="text-[10px] leading-relaxed">
          Research shows that limiting your focus to a single actionable task significantly reduces the cortisol spikes associated with academic burnout.
        </p>
      </div>

    </div>
  )
}