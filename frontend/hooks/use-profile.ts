'use client'
import { useState, useEffect } from 'react'

export interface UserProfile {
  name:          string
  tintHue:       number
  university?:   string
  semesterStart?: string
  city?:         string
}

export const TINT_OPTIONS = [
  { hue: 270, label: 'Violet'  },
  { hue: 190, label: 'Teal'    },
  { hue: 320, label: 'Rose'    },
  { hue: 210, label: 'Blue'    },
  { hue: 160, label: 'Emerald' },
  { hue: 45,  label: 'Amber'   },
]

export function useProfile() {
  const [profile,  setProfile]  = useState<UserProfile | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('chhaya_profile')
    if (saved) {
      try { setProfile(JSON.parse(saved)) } catch {}
    }
    setIsLoaded(true)
  }, [])

  function saveProfile(p: UserProfile) {
    localStorage.setItem('chhaya_profile', JSON.stringify(p))
    localStorage.setItem('chhaya_user_id',
      localStorage.getItem('chhaya_session_id') || p.name)
    localStorage.setItem('chhaya_user_name', p.name)

    // Also register with backend
    const uid = localStorage.getItem('chhaya_session_id') || p.name
    const semesterStart = p.semesterStart ||
      new Date(Date.now() - 42 * 24 * 60 * 60 * 1000)
        .toISOString().slice(0, 10)

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id:             uid,
        name:           p.name,
        university:     p.university || 'University',
        semester_start: semesterStart
      })
    }).catch(() => {})

    setProfile(p)
  }

  return { profile, isLoaded, saveProfile }
}