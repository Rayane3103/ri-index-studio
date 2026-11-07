import { useCallback, useEffect, useState } from 'react'
import { getDatasets } from '../api'
import type { DatasetsResponse } from '../types'

/** Which datasets exist on the server (the XML files may be missing) and their sizes. */
export function useDatasets() {
  const [data, setData] = useState<DatasetsResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setError(null)
    try {
      setData(await getDatasets())
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  return { data, error, reload: load }
}
