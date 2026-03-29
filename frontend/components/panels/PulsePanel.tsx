'use client'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Radio, Users, Loader2, Info } from 'lucide-react'
import { getCommunityPulse } from '@/lib/api'

export function PulsePanel() {
  const [pulse, setPulse] = useState<{ 
    darkStretchPercentage: number, 
    activeUsers: number,
    campusVibe: string 
  } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getCommunityPulse()
      .then(res => {
        setPulse(res)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-full gap-4 text-white/20">
      <Loader2 className="w-6 h-6 animate-spin" />
      <p className="text-[10px] tracking-[0.3em] uppercase">Listening to the campus pulse...</p>
    </div>
  )

  return (
    <div className="flex flex-col px-6 pt-4 pb-20 space-y-8 h-full overflow-y-auto">
      
      {/* Live Indicator */}
      <div className="flex items-center gap-3">
        <div className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
        </div>
        <p className="text-[10px] tracking-[0.3em] uppercase text-white/40">
          Live Campus Pulse
        </p>
      </div>

      {/* Hero Metric: The Dark Stretch */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center p-10 rounded-3xl text-center space-y-4"
        style={{ 
          background: 'radial-gradient(circle at center, rgba(139,92,246,0.1) 0%, transparent 70%)',
          border: '1px solid rgba(255,255,255,0.05)'
        }}
      >
        <span className="text-6xl font-light text-white/90">
          {pulse?.darkStretchPercentage || 0}%
        </span>
        <div className="space-y-1">
          <p className="text-xs tracking-widest uppercase text-violet-300/70">
            In the "Dark Stretch"
          </p>
          <p className="text-[10px] text-white/20 max-w-[180px] leading-relaxed">
            Percentage of peers currently showing significant behavioral shifts.
          </p>
        </div>
      </motion.div>

      {/* Community Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
          <Users size={16} className="text-white/30" />
          <p className="text-xl font-light">{pulse?.activeUsers || 0}</p>
          <p className="text-[9px] tracking-widest uppercase text-white/20">Active Shadows</p>
        </div>
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
          <Radio size={16} className="text-white/30" />
          <p className="text-sm font-light text-white/70 truncate">{pulse?.campusVibe || 'Quiet'}</p>
          <p className="text-[9px] tracking-widest uppercase text-white/20">Campus Vibe</p>
        </div>
      </div>

      {/* Research Note */}
      <div className="flex gap-4 p-5 rounded-2xl bg-white/5 border border-white/5 items-start">
        <Info size={16} className="text-white/20 mt-1 shrink-0" />
        <p className="text-[11px] text-white/30 leading-relaxed">
          The "Dark Stretch" is a research-documented period where academic pressure and environmental factors lead to 
          synchronized withdrawal. Seeing this number reminds you that your struggle is a shared, systemic rhythm, 
          not a personal failure.
        </p>
      </div>

    </div>
  )
}