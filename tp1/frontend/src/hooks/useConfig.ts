import { useEffect, useState } from 'react'
import { getConfig } from '../api'
import type { AppConfig } from '../types'

// Asked once per page load, then shared by every component.
let cached: Promise<AppConfig> | null = null

/** Server settings: is it running locally, and the online document cap. null while loading. */
export function useConfig(): AppConfig | null {
  const [config, setConfig] = useState<AppConfig | null>(null)
  useEffect(() => {
    cached ??= getConfig().catch((e) => {
      cached = null
      throw e
    })
    cached.then(setConfig).catch(() => setConfig({ local: false, max_documents_online: null, store: 'none' }))
  }, [])
  return config
}
