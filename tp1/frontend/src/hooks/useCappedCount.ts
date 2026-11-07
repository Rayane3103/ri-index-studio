import { useCallback, useEffect, useState } from 'react'

export const MIN_DOCUMENTS = 10

/**
 * A number of documents between MIN_DOCUMENTS and `max`, that can never go above `cap` (the online limit).
 * `hitCap` is true after someone tried to go above the cap: the UI shows the red message then.
 */
export function useCappedCount(initial: number, max: number, cap: number | null) {
  const limit = cap === null ? max : Math.min(max, cap)
  const [count, setRawCount] = useState(Math.min(initial, limit))
  const [hitCap, setHitCap] = useState(false)

  const setCount = useCallback(
    (raw: number) => {
      const wanted = Math.round(raw) || MIN_DOCUMENTS
      const tooMany = cap !== null && wanted > cap && cap < max
      const applied = Math.min(Math.max(wanted, MIN_DOCUMENTS), limit)
      setHitCap(tooMany)
      setRawCount(applied)
      return applied
    },
    [cap, max, limit],
  )

  // The limit can shrink later (the dataset or the cap is loaded after the first render).
  useEffect(() => {
    setRawCount((value) => Math.min(value, limit))
  }, [limit])

  return { count, setCount, hitCap, limit }
}
