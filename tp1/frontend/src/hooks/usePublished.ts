import { useCallback, useEffect, useState } from 'react'
import { getPublishedSettings } from '../api'
import type { PublishedSettings } from '../types'

/** The settings the admin published: what users run. */
export function usePublished() {
  const [settings, setSettings] = useState<PublishedSettings | null>(null)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setError(null)
    try {
      setSettings(await getPublishedSettings())
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  return { settings, error, reload: load, setSettings }
}
