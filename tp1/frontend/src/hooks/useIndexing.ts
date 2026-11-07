import { useCallback, useRef, useState } from 'react'
import type { IndexingEvent, IndexingStatus, Metrics } from '../types'
import { MODEL_IDS, STRUCTURE_IDS } from '../types'

export function emptyStatus(): IndexingStatus {
  const models = {} as IndexingStatus['models']
  MODEL_IDS.forEach((m) => {
    models[m] = {} as IndexingStatus['models'][typeof m]
    STRUCTURE_IDS.forEach((s) => (models[m][s] = { percent: 0 }))
  })
  return { state: 'idle', percent: 0, models, measuring: false }
}

const message = (e: unknown) => (e instanceof Error ? e.message : String(e))

/** A function that starts a build and calls onEvent for every line the server streams back. */
export type Runner = (onEvent: (event: IndexingEvent) => void) => Promise<void>

/** Runs one build and turns the streamed events into progress + metrics. Used by the admin and the user page. */
export function useIndexing() {
  const [status, setStatus] = useState<IndexingStatus>(emptyStatus)
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const latest = useRef(0) // only the latest build updates the screen

  const start = useCallback(async (run: Runner) => {
    const ticket = ++latest.current
    let finished = false
    setMetrics(null)
    setStatus({ ...emptyStatus(), state: 'running' })

    const onEvent = (event: IndexingEvent) => {
      if (ticket !== latest.current) return
      if (event.type === 'progress') {
        setStatus((s) => ({
          ...s,
          percent: event.percent,
          models: { ...s.models, [event.model]: { ...s.models[event.model], [event.structure]: { percent: 100 } } },
        }))
      } else if (event.type === 'measuring') {
        setStatus((s) => ({ ...s, percent: 100, measuring: true }))
      } else if (event.type === 'done') {
        finished = true
        setMetrics(event.metrics)
        setStatus((s) => ({ ...s, state: 'done', percent: 100, measuring: false }))
      } else {
        finished = true
        setStatus((s) => ({ ...s, state: 'error', measuring: false, error: event.message }))
      }
    }

    try {
      await run(onEvent)
      if (!finished && ticket === latest.current) {
        setStatus((s) => ({ ...s, state: 'error', measuring: false, error: 'The server stopped before the end. Try fewer documents.' }))
      }
    } catch (e) {
      if (ticket === latest.current) setStatus((s) => ({ ...s, state: 'error', measuring: false, error: message(e) }))
    }
  }, [])

  return { status, metrics, start }
}
