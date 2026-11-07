import type { Account } from '../types'

// The login token is kept in the browser so a refresh does not log you out.
// Storage can be blocked (private mode), so every access is wrapped in try/catch.
const KEY = 'index-studio.session'

export interface Session {
  token: string
  user: Account
}

export function readSession(): Session | null {
  try {
    const raw = window.localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as Session) : null
  } catch {
    return null
  }
}

export function writeSession(session: Session | null) {
  try {
    if (session) window.localStorage.setItem(KEY, JSON.stringify(session))
    else window.localStorage.removeItem(KEY)
  } catch {
    // the session then only lives until the page is closed
  }
}

/** The page where each role lands after logging in. */
export const homeOf = (user: Account) => (user.role === 'admin' ? '/admin' : '/app')
