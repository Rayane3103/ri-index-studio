import { useSyncExternalStore } from 'react'

// A tiny router: the app has only 4 pages, so the browser history API is enough (no extra library).
export type Path = '/login' | '/forgot-password' | '/admin' | '/app'

const listeners = new Set<() => void>()
const notify = () => listeners.forEach((listener) => listener())

window.addEventListener('popstate', notify)

/** Go to another page. `replace` = do not add a history entry (used for redirects). */
export function navigate(path: Path, replace = false) {
  if (window.location.pathname === path) return
  if (replace) window.history.replaceState(null, '', path)
  else window.history.pushState(null, '', path)
  window.scrollTo(0, 0)
  notify()
}

/** The current path; the component re-renders when it changes. */
export function usePath(): string {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    () => window.location.pathname,
  )
}
