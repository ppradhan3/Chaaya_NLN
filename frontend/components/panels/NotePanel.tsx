'use client'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Loader2, Calendar, MapPin } from 'lucide-react'
import { generateInsight } from '@/lib/api'
import type { WeatherData } from '@/hooks/use-weather-sync'

interface NotePanelProps {
  sessionId:   string
  weather:     WeatherData | undefined
  userName:    string
  initialNote: string | null
}

export function NotePanel({ sessionId, weather, userName, initialNote }: NotePanelProps) {
  const [insight, setInsight] = useState<string | null>(initialNote)
  const [loading, setLoading] = useState(!initialNote)

  useEffect(() => {
    // If we didn't get a note immediately after check-in, fetch the latest one
    if (!initialNote) {
      generateInsight(sessionId)
        .then(res => {
          setInsight(res.note)
          setLoading(false)
        })
        .catch(() => setLoading(false))
    }
  }, [sessionId, initialNote])

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-full gap-4 text-white/20">
      <Loader2 className="w-6 h-6 animate-spin" />
      <p className="text-[10px] tracking-[0.3em] uppercase text-center">
        Chhaya is reflecting<br/>on your patterns...
      </p>
    </div>
  )

  return (
    <div className="flex flex-col px-6 pt-4 pb-20 space-y-6 h-full overflow-y-auto">
      
      {/* Header Context */}
      <div className="flex items-center justify-between opacity-40">
        <div className="flex items-center gap-2">
          <Calendar size={12} />
          <span className="text-[10px] tracking-widest uppercase">
            {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
          </span>
        </div>
        {weather && (
          <div className="flex items-center gap-2">
            <MapPin size={12} />
            <span className="text-[10px] tracking-widest uppercase">
              {weather.temperature}°F · {weather.description}
            </span>
          </div>
        )}
      </div>

      {/* The AI Insight Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative p-8 rounded-3xl overflow-hidden"
        style={{ 
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)' 
        }}
      >
        <Sparkles 
          className="absolute top-4 right-4 text-violet-400/30" 
          size={20} 
        />
        
        <p className="text-lg font-light text-white/90 leading-relaxed italic">
          "{insight || "No reflection available today. Keep checking in to build your pattern history."}"
        </p>
        
        <div className="mt-8 pt-6 border-t border-white/5">
          <p className="text-[10px] tracking-[0.2em] uppercase text-white/20">
            — Chhaya for {userName}
          </p>
        </div>
      </motion.div>

      {/* Scientific Validation Footer */}
      <div className="p-4 rounded-2xl bg-violet-500/5 border border-violet-500/10">
        <p className="text-[11px] text-violet-300/60 leading-relaxed">
          The end of the semester is a high-masking period. This insight is based 
          on your observed biometric shifts and academic calendar context.
        </p>
      </div>
    </div>
  )
}