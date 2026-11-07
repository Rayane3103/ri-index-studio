import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { getMe, login as apiLogin, setUnauthorizedHandler } from '../api'
import { navigate } from '../lib/router'
import type { Account } from '../types'
import { homeOf, readSession, writeSession } from './session'

type AuthStatus = 'checking' | 'signed-in' | 'signed-out'

interface AuthValue {
  status: AuthStatus
  user: Account | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthValue | null>(null)

/** Knows who is logged in. On page load it asks the server if the saved token is still valid. */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Account | null>(() => readSession()?.user ?? null)
  const [status, setStatus] = useState<AuthStatus>(() => (readSession() ? 'checking' : 'signed-out'))

  const logout = useCallback(() => {
    writeSession(null)
    setUser(null)
    setStatus('signed-out')
    navigate('/login', true)
  }, [])

  useEffect(() => {
    setUnauthorizedHandler(logout)
    if (!readSession()) return
    getMe()
      .then((me) => {
        setUser(me)
        setStatus('signed-in')
      })
      // A 401 already logged out (setUnauthorizedHandler). Any other error (server offline): keep the saved login.
      .catch(() => setStatus(readSession() ? 'signed-in' : 'signed-out'))
  }, [logout])

  const login = useCallback(async (email: string, password: string) => {
    const { token, user: account } = await apiLogin(email, password)
    writeSession({ token, user: account })
    setUser(account)
    setStatus('signed-in')
    navigate(homeOf(account), true)
  }, [])

  const value = useMemo(() => ({ status, user, login, logout }), [status, user, login, logout])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthValue {
  const value = useContext(AuthContext)
  if (!value) throw new Error('useAuth must be used inside <AuthProvider>')
  return value
}
