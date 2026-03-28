'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface OrbProps {
  isSolarMode:       boolean
  onCheckinTrigger:  (durationMs: number, latencyMs: number) => void
}

const BREATH_IN    = 4000
const BREATH_HOLD  = 7000
const BREATH_OUT   = 8000
const CYCLE_TOTAL  = BREATH_IN + BREATH_HOLD + BREATH_OUT

function getBreathPhase(elapsed: number) {
  const pos = elapsed % CYCLE_TOTAL
  if (pos < BREATH_IN)
    return { label: 'Breathe in',  phase: 'in'   as const }
  if (pos < BREATH_IN + BREATH_HOLD)
    return { label: 'Hold',        phase: 'hold' as const }
  return   { label: 'Breathe out', phase: 'out'  as const }
}

export function Orb({ isSolarMode, onCheckinTrigger }: OrbProps) {
  const [isHolding,    setIsHolding]    = useState(false)
  const [progress,     setProgress]     = useState(0)
  const [breathPhase,  setBreathPhase]  = useState(0)
  const [breathLabel,  setBreathLabel]  = useState(
    { label: 'Breathe in', phase: 'in' as const }
  )

  const holdStart        = useRef(0)
  const lastMove         = useRef(0)
  const moveLatencies    = useRef<number[]>([])
  const animFrame        = useRef(0)
  const breathFrame      = useRef(0)
  const holdActive       = useRef(false)

  // Idle breathing animation
  useEffect(() => {
    const start = Date.now()
    const tick = () => {
      const elapsed = (Date.now() - start) / 1000
      setBreathPhase(Math.sin(elapsed * 0.5) * 0.5 + 0.5)
      breathFrame.current = requestAnimationFrame(tick)
    }
    breathFrame.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(breathFrame.current)
  }, [])

  const startHold = useCallback((e: React.PointerEvent) => {
    e.preventDefault()
    e.stopPropagation()
    holdActive.current   = true
    holdStart.current    = Date.now()
    lastMove.current     = Date.now()
    moveLatencies.current = []
    setIsHolding(true)
    setProgress(0)

    const tick = () => {
      if (!holdActive.current) return
      const elapsed = Date.now() - holdStart.current
      const p = Math.min(elapsed / 10000, 1)
      setProgress(p)
      setBreathLabel(getBreathPhase(elapsed))
      if (p < 1) {
        animFrame.current = requestAnimationFrame(tick)
      } else {
        holdActive.current = false
        setIsHolding(false)
        const avg = moveLatencies.current.length > 0
          ? moveLatencies.current.reduce((a, b) => a + b, 0)
            / moveLatencies.current.length
          : 400
        onCheckinTrigger(elapsed, avg)
      }
    }
    animFrame.current = requestAnimationFrame(tick)
  }, [onCheckinTrigger])

  const endHold = useCallback(() => {
    holdActive.current = false
    setIsHolding(false)
    setProgress(0)
    cancelAnimationFrame(animFrame.current)
  }, [])

  const trackMove = useCallback((e: React.PointerEvent) => {
    if (!holdActive.current) return
    const now     = Date.now()
    const latency = now - lastMove.current
    if (latency > 0 && latency < 2000)
      moveLatencies.current.push(latency)
    lastMove.current = now
  }, [])

  useEffect(() => () => {
    cancelAnimationFrame(animFrame.current)
    cancelAnimationFrame(breathFrame.current)
  }, [])

  const idleScale = 1 + breathPhase * 0.06
  const CIRCUMFERENCE = 2 * Math.PI * 118

  return (
    <div className="relative flex items-center justify-center
                    w-72 h-72 select-none touch-none">

      {/* Progress ring */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none"
           viewBox="0 0 288 288"
           style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="144" cy="144" r="118"
          fill="none" stroke="white"
          strokeWidth="1" opacity="0.06" />
        <motion.circle cx="144" cy="144" r="118"
          fill="none"
          stroke={isSolarMode
            ? 'hsl(38,95%,60%)'
            : `hsl(${270},70%,60%)`}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE * (1 - progress)}
          style={{ filter: 'blur(3px)' }}
        />
        <motion.circle cx="144" cy="144" r="118"
          fill="none"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE * (1 - progress)}
          opacity={0.6}
        />
      </svg>

      {/* Glow */}
      <motion.div
        className="absolute w-56 h-56 rounded-full opacity-20"
        style={{
          background: isSolarMode
            ? 'hsl(38,95%,60%)'
            : 'hsl(270,70%,60%)',
          filter: 'blur(24px)'
        }}
        animate={{ scale: idleScale * 1.15 }}
        transition={{ type: 'spring', stiffness: 120, damping: 20 }}
      />

      {/* The Orb */}
      <motion.div
        onPointerDown={startHold}
        onPointerUp={endHold}
        onPointerLeave={endHold}
        onPointerCancel={endHold}
        onPointerMove={trackMove}
        animate={{
          scale:  idleScale,
          filter: isHolding ? 'brightness(1.4)' : 'brightness(1)'
        }}
        transition={{ type: 'spring', stiffness: 200, damping: 25 }}
        className="w-52 h-52 rounded-full cursor-pointer
                   touch-none relative overflow-hidden"
        style={{
          background: isSolarMode
            ? 'linear-gradient(135deg, hsl(38,95%,60%), hsl(25,90%,50%))'
            : 'linear-gradient(135deg, hsl(270,70%,60%), hsl(250,70%,45%))',
          boxShadow: isSolarMode
            ? '0 0 80px -10px hsl(38,95%,60%,0.8)'
            : '0 0 80px -10px rgba(139,92,246,0.8)',
          userSelect: 'none',
        }}>
        <div className="absolute inset-0 rounded-full
                        bg-gradient-to-tl from-white/20 to-transparent" />
        <div className="absolute top-4 left-6 w-8 h-8
                        rounded-full bg-white/30 blur-lg" />
      </motion.div>

      {/* Breath label */}
      <AnimatePresence mode="wait">
        {isHolding ? (
          <motion.div key={breathLabel.phase}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 0.7, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.4 }}
            className="absolute -bottom-16 text-center
                       flex flex-col items-center gap-1">
            <p className={cn(
              'text-sm tracking-[0.25em] uppercase',
              breathLabel.phase === 'in'   ? 'text-emerald-400/70' :
              breathLabel.phase === 'hold' ? 'text-violet-300/70'  :
                                             'text-teal-400/70'
            )}>
              {breathLabel.label}
            </p>
            <p className="text-[9px] text-white/25 tracking-widest">
              4-7-8
            </p>
          </motion.div>
        ) : (
          <motion.div key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.45 }}
            exit={{ opacity: 0 }}
            className="absolute -bottom-14 text-center">
            <p className="text-xs tracking-[0.3em] text-white/50 uppercase">
              Hold to check in
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress % while holding */}
      {isHolding && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          className="absolute pointer-events-none
                     text-white text-sm tracking-widest">
          {Math.round(progress * 100)}%
        </motion.div>
      )}

    </div>
  )
}