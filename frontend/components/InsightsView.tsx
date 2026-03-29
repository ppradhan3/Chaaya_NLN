'use client'
import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Flower2, Sparkles, Radio, Target, Eye } from 'lucide-react'

// 1. REAL IMPORTS
import { ChhayaPanel } from '@/components/panels/ChhayaPanel'
import { GardenPanel } from '@/components/panels/GardenPanel'
import { NotePanel } from '@/components/panels/NotePanel'
import { PulsePanel } from '@/components/panels/PulsePanel'
import { FocusPanel } from '@/components/panels/FocusPanel'
import type { WeatherData } from '@/hooks/use-weather-sync'

interface InsightsViewProps {
  sessionId:        string
  weather:          WeatherData | undefined
  postCheckinNote:  string | null
  userName:         string
  onClose:          () => void
}

const TABS = [
  { id: 'chhaya', icon: Eye,      label: 'Chhaya'  },
  { id: 'garden', icon: Flower2,  label: 'Garden'  },
  { id: 'note',   icon: Sparkles, label: 'Reflection' },
  { id: 'pulse',  icon: Radio,    label: 'Pulse'   },
  { id: 'focus',  icon: Target,   label: 'Focus'   },
] as const

type TabId = (typeof TABS)[number]['id']

export function InsightsView({
  sessionId, weather, postCheckinNote, userName, onClose
}: InsightsViewProps) {
  const [activeTab, setActiveTab] = useState<TabId>('chhaya')
  const touchStartX = useRef(0)
  const touchStartY = useRef(0)

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
  }

  function handleTouchEnd(e: React.TouchEvent) {
    const dx = touchStartX.current - e.changedTouches[0].clientX
    const dy = touchStartY.current - e.changedTouches[0].clientY

    if (Math.abs(dy) > Math.abs(dx) && dy < -60) {
      onClose()
      return
    }
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
      const idx = TABS.findIndex(t => t.id === activeTab)
      if (dx > 0 && idx < TABS.length - 1) setActiveTab(TABS[idx + 1].id)
      if (dx < 0 && idx > 0)               setActiveTab(TABS[idx - 1].id)
    }
  }

  return (
    <motion.div
      initial={{ y: '100%', opacity: 0 }}
      animate={{ y: 0,      opacity: 1 }}
      exit={{   y: '100%', opacity: 0 }}
      transition={{ type: 'spring', damping: 28, stiffness: 220 }}
      className="fixed inset-0 z-40 flex flex-col backdrop-blur-2xl"
      style={{ background: 'rgba(8,15,12,0.96)' }}>

      {/* Drag handle */}
      <div onClick={onClose}
           className="flex flex-col items-center pt-5 pb-3
                      cursor-pointer group">
        <div className="w-10 h-1 rounded-full mb-1 transition-colors"
             style={{ background: 'rgba(255,255,255,0.2)' }} />
        <ChevronDown size={14} className="text-white/20" />
      </div>

      {/* Tab bar */}
      <div className="flex items-center justify-center gap-0.5
                      px-4 pb-3 overflow-x-auto">
        {TABS.map(tab => {
          const Icon     = tab.icon
          const isActive = tab.id === activeTab
          return (
            <button key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex flex-col items-center gap-1 px-3 py-2
                         rounded-xl transition-all duration-200
                         flex-1 min-w-0"
              style={{
                background: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
                color:      isActive ? 'white' : 'rgba(255,255,255,0.3)'
              }}>
              <Icon size={16} strokeWidth={isActive ? 2 : 1.5} />
              <span className="text-[8px] tracking-widest uppercase truncate">
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>

      {/* Panel content */}
      <div className="flex-1 overflow-hidden"
           onTouchStart={handleTouchStart}
           onTouchEnd={handleTouchEnd}>
        <AnimatePresence mode="wait">
          <motion.div key={activeTab}
            className="h-full w-full overflow-y-auto"
            initial={{ opacity: 0, x: 20  }}
            animate={{ opacity: 1, x: 0   }}
            exit={{   opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}>

            {activeTab === 'chhaya' && (
              <ChhayaPanel sessionId={sessionId} userName={userName} />
            )}
            
            {activeTab === 'garden' && (
              <GardenPanel sessionId={sessionId} />
            )}
            
            {activeTab === 'note' && (
              <NotePanel 
                sessionId={sessionId} 
                weather={weather} 
                userName={userName}
                initialNote={postCheckinNote} 
              />
            )}
            
            {activeTab === 'pulse' && (
              <PulsePanel />
            )}
            
            {activeTab === 'focus' && (
              <FocusPanel sessionId={sessionId} weather={weather} />
            )}

          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  )
}