'use client'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Loader2, Flame, Flower2 } from 'lucide-react'
import { getGarden } from '@/lib/api'

interface GardenEntry {
  date: string
  signals: number // Number of 'healthy' signals (attended, ate, left room, etc.)
}

export function GardenPanel({ sessionId }: { sessionId: string }) {
  const [data, setData] = useState<{
    recentCheckins: any[],
    totalPetals: number,
    currentStreak: number
  } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getGarden(sessionId)
      .then(res => {
        setData(res)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [sessionId])

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-full gap-4 text-white/20">
      <Loader2 className="w-6 h-6 animate-spin" />
      <p className="text-[10px] tracking-[0.3em] uppercase">Cultivating your history...</p>
    </div>
  )

  return (
    <div className="flex flex-col px-6 pt-4 pb-20 space-y-8 overflow-y-auto h-full">
      
      {/* Metrics Row */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white/5 rounded-2xl p-4 border border-white/10 space-y-1">
          <div className="flex items-center gap-2 text-orange-400/60">
            <Flame size={14} />
            <p className="text-[9px] tracking-widest uppercase">Streak</p>
          </div>
          <p className="text-2xl font-light">{data?.currentStreak || 0} days</p>
        </div>
        <div className="bg-white/5 rounded-2xl p-4 border border-white/10 space-y-1">
          <div className="flex items-center gap-2 text-violet-400/60">
            <Flower2 size={14} />
            <p className="text-[9px] tracking-widest uppercase">Total Petals</p>
          </div>
          <p className="text-2xl font-light">{data?.totalPetals || 0}</p>
        </div>
      </div>

      {/* 90-Day Garden Grid */}
      <div className="space-y-4">
        <p className="text-[10px] tracking-[0.3em] uppercase text-white/20">90-Day Garden</p>
        <div className="grid grid-cols-7 gap-1.5">
          {/* We generate 90 cells. If data exists for a cell, we color it. */}
          {Array.from({ length: 90 }).map((_, i) => {
            const entry = data?.recentCheckins[i];
            
            // Logic: More 'signals' = brighter petal
            const opacity = entry ? (entry.signals / 5) : 0.05;
            const color = entry?.signals >= 4 ? 'rgba(52,211,153' : 'rgba(139,92,246';

            return (
              <motion.div
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.005 }}
                className="aspect-square rounded-sm"
                style={{ 
                  background: entry ? `${color}, ${opacity})` : 'rgba(255,255,255,0.05)',
                  border: entry ? 'none' : '1px solid rgba(255,255,255,0.02)'
                }}
              />
            )
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-4 opacity-30">
        <div className="flex items-center gap-1.5 text-[8px] uppercase tracking-widest">
          <div className="w-2 h-2 rounded-sm bg-emerald-400/50" /> Strong
        </div>
        <div className="flex items-center gap-1.5 text-[8px] uppercase tracking-widest">
          <div className="w-2 h-2 rounded-sm bg-violet-500/40" /> Average
        </div>
        <div className="flex items-center gap-1.5 text-[8px] uppercase tracking-widest">
          <div className="w-2 h-2 rounded-sm bg-white/10" /> No Data
        </div>
      </div>
    </div>
  )
}