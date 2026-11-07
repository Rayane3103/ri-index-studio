import { useCallback, useRef, useState } from 'react'

export type ActionStatus = 'idle' | 'working' | 'done' | 'error'

/**
 * State for one button that calls the server: idle -> working -> done (with the result) or error.
 * Used for Download, Save on server and Publish.
 */
export function useAction<Args extends unknown[], Result>(action: (...args: Args) => Promise<Result>) {
  const [status, setStatus] = useState<ActionStatus>('idle')
  const [result, setResult] = useState<Result | null>(null)
  const [error, setError] = useState<string | null>(null)
  const latest = useRef(action)
  latest.current = action

  const run = useCallback(async (...args: Args) => {
    setStatus('working')
    setError(null)
    try {
      const value = await latest.current(...args)
      setResult(value)
      setStatus('done')
      return value
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
      setStatus('error')
      return null
    }
  }, [])

  const reset = useCallback(() => {
    setStatus('idle')
    setResult(null)
    setError(null)
  }, [])

  return { status, result, error, run, reset }
}
