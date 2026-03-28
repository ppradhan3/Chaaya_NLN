import { useState, useEffect } from 'react'

export function useSession(): string {
  const [sessionId, setSessionId] = useState<string>('')

  useEffect(() => {
    let id = localStorage.getItem('chhaya_session_id')
    if (!id) {
      id = 'user_' + Math.random().toString(36).slice(2, 10)
      localStorage.setItem('chhaya_session_id', id)
    }
    setSessionId(id)
  }, [])

  return sessionId
}
