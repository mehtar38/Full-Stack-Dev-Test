import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { isTechAuthed, setTechAuthed, TECH_PASSCODE } from '../lib/storage'

interface AuthContextValue {
  isAuthed: boolean
  login: (passcode: string) => boolean
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthed, setIsAuthed] = useState(isTechAuthed)

  const login = useCallback((passcode: string) => {
    const ok = passcode.trim() === TECH_PASSCODE
    if (ok) {
      setTechAuthed(true)
      setIsAuthed(true)
    }
    return ok
  }, [])

  const logout = useCallback(() => {
    setTechAuthed(false)
    setIsAuthed(false)
  }, [])

  return <AuthContext.Provider value={{ isAuthed, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
