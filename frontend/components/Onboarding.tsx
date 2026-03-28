'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { UserProfile, TINT_OPTIONS } from '@/hooks/use-profile'

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const [name,           setName]           = useState('')
  const [university,     setUniversity]     = useState('')
  const [semesterStart,  setSemesterStart]  = useState('')
  const [city,           setCity]           = useState('New York')
  const [selectedHue,    setSelectedHue]    = useState(270)
  const [step, setStep] = useState<'name' | 'details' | 'tint'>('name')

  function handleFinish() {
    onComplete({
      name:          name.trim(),
      tintHue:       selectedHue,
      university:    university.trim() || 'University',
      semesterStart: semesterStart,
      city:          city.trim() || 'New York'
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex flex-col items-center
                 justify-center px-8"
      style={{ background: '#080f0c' }}>

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 8 }).map((_, i) => (
          <motion.div key={i}
            className="absolute w-1 h-1 rounded-full"
            style={{
              left:       `${15 + (i * 11) % 70}%`,
              top:        `${20 + (i * 13) % 60}%`,
              background: `hsla(${selectedHue},70%,60%,0.3)`,
            }}
            animate={{ y: [-8, 8, -8], opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 3 + i * 0.5, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </div>

      {/* Step indicator */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2
                      flex gap-2">
        {['name', 'details', 'tint'].map((s, i) => (
          <div key={s}
            className="h-1 rounded-full transition-all duration-300"
            style={{
              width:      step === s ? 24 : 12,
              background: ['name','details','tint'].indexOf(step) >= i
                ? `hsla(${selectedHue},70%,60%,0.7)`
                : 'rgba(255,255,255,0.1)'
            }} />
        ))}
      </div>

      {/* Step 1 — Name */}
      {step === 'name' && (
        <motion.div key="name"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-8 max-w-sm w-full">

          <motion.div
            animate={{
              boxShadow: [
                `0 0 40px hsla(${selectedHue},70%,50%,0.3)`,
                `0 0 60px hsla(${selectedHue},70%,50%,0.5)`,
                `0 0 40px hsla(${selectedHue},70%,50%,0.3)`,
              ]
            }}
            transition={{ duration: 3, repeat: Infinity }}
            className="w-20 h-20 rounded-full"
            style={{
              background: `linear-gradient(135deg,
                hsla(${selectedHue},70%,50%,0.8),
                hsla(${selectedHue + 30},60%,40%,0.6))`
            }}
          />

          <div className="text-center space-y-2">
            <h1 className="text-xl font-light text-white/80 tracking-wider">
              Welcome to Chhaya
            </h1>
            <p className="text-xs text-white/30 leading-relaxed
                          max-w-[260px]">
              छाया · Your shadow knows before you do.
              Not a diagnosis — never a diagnosis.
            </p>
          </div>

          <div className="w-full space-y-4">
            <input type="text"
              placeholder="Your first name"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && name.trim()) setStep('details')
              }}
              autoFocus
              className="w-full rounded-2xl px-6 py-4 text-base
                         text-white/90 placeholder-white/25
                         focus:outline-none transition-colors
                         text-center tracking-wide"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border:     '1px solid rgba(255,255,255,0.15)',
              }}
            />
            <button
              onClick={() => name.trim() && setStep('details')}
              disabled={!name.trim()}
              className="w-full py-4 rounded-2xl text-white text-sm
                         tracking-widest uppercase active:scale-95
                         transition-all disabled:opacity-20"
              style={{
                background: `hsla(${selectedHue},60%,45%,0.5)`,
                border:     `1px solid hsla(${selectedHue},60%,50%,0.3)`,
              }}>
              Continue →
            </button>
          </div>
        </motion.div>
      )}

      {/* Step 2 — Details */}
      {step === 'details' && (
        <motion.div key="details"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-6 max-w-sm w-full">

          <div className="text-center space-y-2">
            <p className="text-lg font-light text-white/80 tracking-wider">
              Hi, {name.trim()} 👋
            </p>
            <p className="text-xs text-white/30">
              A few things so Chhaya understands your semester
            </p>
          </div>

          <div className="w-full space-y-3">

            {/* University */}
            <div>
              <p className="text-[10px] text-white/30 tracking-widest
                            uppercase mb-2 px-1">
                Your university
              </p>
              <input type="text"
                placeholder="e.g. State University"
                value={university}
                onChange={e => setUniversity(e.target.value)}
                className="w-full rounded-2xl px-5 py-3.5 text-sm
                           text-white/80 placeholder-white/20
                           focus:outline-none transition-colors"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border:     '1px solid rgba(255,255,255,0.12)',
                }}
              />
            </div>

            {/* City */}
            <div>
              <p className="text-[10px] text-white/30 tracking-widest
                            uppercase mb-2 px-1">
                Your city
                <span className="text-white/15 normal-case
                                 tracking-normal ml-1">
                  (for weather context)
                </span>
              </p>
              <input type="text"
                placeholder="e.g. Boston, New York, Chicago"
                value={city}
                onChange={e => setCity(e.target.value)}
                className="w-full rounded-2xl px-5 py-3.5 text-sm
                           text-white/80 placeholder-white/20
                           focus:outline-none transition-colors"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border:     '1px solid rgba(255,255,255,0.12)',
                }}
              />
            </div>

            {/* Semester start */}
            <div>
              <p className="text-[10px] text-white/30 tracking-widest
                            uppercase mb-2 px-1">
                When did your semester start?
                <span className="text-white/15 normal-case
                                 tracking-normal ml-1">
                  (so Chhaya knows what week you're in)
                </span>
              </p>
              <input type="date"
                value={semesterStart}
                onChange={e => setSemesterStart(e.target.value)}
                className="w-full rounded-2xl px-5 py-3.5 text-sm
                           text-white/80 focus:outline-none
                           transition-colors"
                style={{
                  background:   'rgba(255,255,255,0.05)',
                  border:       '1px solid rgba(255,255,255,0.12)',
                  colorScheme:  'dark',
                }}
              />
            </div>

          </div>

          <div className="flex gap-3 w-full">
            <button onClick={() => setStep('name')}
              className="flex-1 py-3.5 rounded-2xl text-white/40
                         text-sm tracking-widest uppercase
                         active:scale-95 transition-all"
              style={{
                border: '1px solid rgba(255,255,255,0.1)',
              }}>
              ← Back
            </button>
            <button
              onClick={() => semesterStart && setStep('tint')}
              disabled={!semesterStart}
              className="flex-1 py-3.5 rounded-2xl text-white text-sm
                         tracking-widest uppercase active:scale-95
                         transition-all disabled:opacity-20"
              style={{
                background: `hsla(${selectedHue},60%,45%,0.5)`,
                border:     `1px solid hsla(${selectedHue},60%,50%,0.3)`,
              }}>
              Continue →
            </button>
          </div>
        </motion.div>
      )}

      {/* Step 3 — Tint */}
      {step === 'tint' && (
        <motion.div key="tint"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-8 max-w-sm w-full">

          <div className="text-center space-y-2">
            <p className="text-lg font-light text-white/80 tracking-wider">
              One last thing
            </p>
            <p className="text-xs text-white/30">Choose your light</p>
          </div>

          <div className="grid grid-cols-3 gap-4 w-full">
            {TINT_OPTIONS.map(opt => (
              <button key={opt.hue}
                onClick={() => setSelectedHue(opt.hue)}
                className="flex flex-col items-center gap-3 p-4
                           rounded-2xl transition-all duration-300"
                style={{
                  border:     selectedHue === opt.hue
                    ? '1px solid rgba(255,255,255,0.3)'
                    : '1px solid rgba(255,255,255,0.08)',
                  background: selectedHue === opt.hue
                    ? 'rgba(255,255,255,0.1)'
                    : 'rgba(255,255,255,0.03)',
                  transform:  selectedHue === opt.hue
                    ? 'scale(1.05)' : 'scale(1)'
                }}>
                <motion.div className="w-10 h-10 rounded-full"
                  style={{
                    background: `linear-gradient(135deg,
                      hsla(${opt.hue},70%,55%,0.9),
                      hsla(${opt.hue + 20},60%,40%,0.7))`,
                    boxShadow: selectedHue === opt.hue
                      ? `0 0 20px hsla(${opt.hue},70%,50%,0.5)`
                      : 'none',
                  }}
                  animate={selectedHue === opt.hue
                    ? { scale: [1, 1.08, 1] } : {}}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <span className="text-[10px] tracking-widest
                                 uppercase text-white/40">
                  {opt.label}
                </span>
              </button>
            ))}
          </div>

          <div className="flex gap-3 w-full">
            <button onClick={() => setStep('details')}
              className="flex-1 py-3.5 rounded-2xl text-white/40
                         text-sm tracking-widest uppercase
                         active:scale-95 transition-all"
              style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
              ← Back
            </button>
            <button onClick={handleFinish}
              className="flex-1 py-4 rounded-2xl text-white text-sm
                         tracking-widest uppercase active:scale-95
                         transition-all"
              style={{
                background: `hsla(${selectedHue},60%,45%,0.5)`,
                border:     `1px solid hsla(${selectedHue},60%,50%,0.3)`,
              }}>
              Enter →
            </button>
          </div>

        </motion.div>
      )}

    </motion.div>
  )
}