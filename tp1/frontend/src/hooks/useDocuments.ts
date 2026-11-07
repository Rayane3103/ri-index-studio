import { useCallback, useEffect, useState } from 'react'
import { getDocuments } from '../api'
import type { DatasetId, DocumentsResponse } from '../types'

export type LoadStatus = 'idle' | 'loading' | 'ready' | 'error'

/** Loads the document selection. `loadedCount` is the N that was actually loaded. Changing dataset clears it. */
export function useDocuments(dataset: DatasetId) {
  const [status, setStatus] = useState<LoadStatus>('idle')
  const [data, setData] = useState<DocumentsResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setStatus('idle')
    setData(null)
    setError(null)
  }, [dataset])

  const load = useCallback(
    async (limit: number) => {
      setStatus('loading')
      setError(null)
      try {
        setData(await getDocuments(dataset, limit))
        setStatus('ready')
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e))
        setStatus('error')
      }
    },
    [dataset],
  )

  return { status, data, error, load, loadedCount: status === 'ready' && data ? data.selected : null }
}
