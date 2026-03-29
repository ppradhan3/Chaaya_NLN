'use client'
import { useState, useRef, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronUp } from 'lucide-react'
import { useSession } from '@/hooks/use-session'
import { useProfile } from '@/hooks/use-profile'
import { useWeatherSync } from '@/hooks/use-weather-sync'
import { Orb } from '@/components/Orb'
import { CheckinFlow } from '@/components/CheckinFlow'
import { InsightsView } from '@/components/InsightsView'
import { Onboarding } from '@/components/Onboarding'

type AppState = 'home' | 'checkin' | 'insights'

export default function AashaPage() {
  const sessionId                   = useSession()
  const { profile, isLoaded,
          saveProfile }             = useProfile()
  const { weather, isSolarMode }    = useWeatherSync()
  const [appState, setAppState]     = useState<AppState>('home')
  const [holdData, setHoldData]     = useState({ durationMs: 0, latencyMs: 0 })
  const [postCheckinNote,
         setPostCheckinNote]        = useState<string | null>(null)
  const touchStartY                 = useRef(0)

  function handleCheckinTrigger(durationMs: number, latencyMs: number) {
    setHoldData({ durationMs, latencyMs })
    setAppState('checkin')
  }

  function handleCheckinComplete(note?: string) {
    if (note) setPostCheckinNote(note)
    setAppState('insights')
  }

  function handleSwipeStart(e: React.TouchEvent) {
    touchStartY.current = e.touches[0].clientY
  }

  function handleSwipeEnd(e: React.TouchEvent) {
    const diff = touchStartY.current - e.changedTouches[0].clientY
    if (diff > 40) setAppState('insights')
  }

  if (!sessionId || !isLoaded) return null

  if (!profile) {
    return <Onboarding onComplete={saveProfile} />
  }

  const tintHue = profile.tintHue ?? 270

  return (
    <div className="relative min-h-[100dvh] w-full overflow-hidden
                    flex flex-col"
         style={{ background: '#080f0c', color: 'white' }}>

      <style>{`:root { --tint-hue: ${tintHue}; }`}</style>

      {/* Bioluminescent background */}
      <div className="absolute inset-0 pointer-events-none"
           style={{
             background: `radial-gradient(ellipse at 50% 60%,
               hsla(${tintHue},40%,15%,0.4) 0%,
               transparent 70%)`,
           }} />

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 12 }).map((_, i) => (
          <motion.div key={i}
            className="absolute w-1 h-1 rounded-full"
            style={{
              left:       `${10 + (i * 7.5) % 80}%`,
              top:        `${15 + (i * 11) % 70}%`,
              background: `hsla(${tintHue},60%,50%,0.4)`,
            }}
            animate={{
              y:       [-10, 10, -10],
              opacity: [0.2, 0.6, 0.2]
            }}
            transition={{
              duration: 3 + i * 0.4,
              repeat:   Infinity,
              ease:     'easeInOut',
              delay:    i * 0.3
            }}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">

        {/* Home — Orb */}
        {appState === 'home' && (
          <motion.div key="home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.97, filter: 'blur(8px)' }}
            transition={{ duration: 0.6 }}
            className="flex-1 flex flex-col items-center
                       justify-between w-full py-12">

            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 0.4, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-xs tracking-[0.4em] text-white/40 uppercase">
              Aasha · आशा
            </motion.div>

            <div className="flex-1 flex items-center
                            justify-center w-full">
              <Orb
                isSolarMode={isSolarMode}
                onCheckinTrigger={handleCheckinTrigger}
              />
            </div>

            <div className="flex flex-col items-center gap-2
                            pb-2 cursor-pointer select-none"
                 onClick={() => setAppState('insights')}
                 onTouchStart={handleSwipeStart}
                 onTouchEnd={handleSwipeEnd}>
              <motion.div
                animate={{
                  y:       [0, -6, 0],
                  opacity: [0.3, 0.8, 0.3]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="flex flex-col items-center gap-1.5
                           text-white/40">
                <ChevronUp size={22} />
                <span className="text-[10px] tracking-[0.25em] uppercase">
                  Insights
                </span>
              </motion.div>
            </div>

          </motion.div>
        )}

        {/* Check-in Flow */}
        {appState === 'checkin' && (
          <CheckinFlow
            key="checkin"
            sessionId={sessionId}
            lat={null}
            lon={null}
            holdDurationMs={holdData.durationMs}
            interactionLatencyMs={holdData.latencyMs}
            onComplete={handleCheckinComplete}
          />
        )}

        {/* Insights */}
        {appState === 'insights' && (
          <InsightsView
            key="insights"
            sessionId={sessionId}
            weather={weather}
            postCheckinNote={postCheckinNote}
            userName={profile.name}
            onClose={() => {
              setPostCheckinNote(null)
              setAppState('home')
            }}
          />
        )}

      </AnimatePresence>
    </div>
  )
}