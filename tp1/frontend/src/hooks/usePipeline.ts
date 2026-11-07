import { useCallback, useEffect, useMemo, useState } from 'react'
import { arrayMove } from '@dnd-kit/sortable'
import { t } from '../i18n'
import type { DatasetId, StepId } from '../types'

export interface PipelineItem {
  id: StepId
  enabled: boolean
}

const DEFAULT_ITEMS: PipelineItem[] = [
  { id: 'tag_cleaning', enabled: false },
  { id: 'normalize', enabled: true },
  { id: 'stopwords', enabled: true },
  { id: 'stem', enabled: true },
  { id: 'lemmatize', enabled: false },
]

/** Stemming and lemmatization both reduce words to a root: only one of them can be used. */
const RIVAL: Partial<Record<StepId, StepId>> = { stem: 'lemmatize', lemmatize: 'stem' }

/**
 * Holds the list of steps: which are ticked, and in which order.
 * Rules: with the CSV, Tag cleaning is locked off (no tags). Stemming and Lemmatization exclude each other.
 */
export function usePipeline(dataset: DatasetId) {
  const [items, setItems] = useState<PipelineItem[]>(DEFAULT_ITEMS)

  // Switching to the CSV turns Tag cleaning off. Switching back to XML leaves it off until it is ticked again.
  useEffect(() => {
    if (dataset === 'csv') {
      setItems((list) => list.map((item) => (item.id === 'tag_cleaning' ? { ...item, enabled: false } : item)))
    }
  }, [dataset])

  /** Why a step cannot be ticked right now (null = it can). */
  const lockReason = useMemo(() => {
    const reasons = {} as Record<StepId, string | null>
    const isOn = (id: StepId) => items.some((item) => item.id === id && item.enabled)
    for (const { id } of items) {
      const rival = RIVAL[id]
      if (id === 'tag_cleaning' && dataset === 'csv') reasons[id] = t.pipeline.locked.csvTags
      else if (rival && isOn(rival)) reasons[id] = t.pipeline.locked.rival(t.steps[rival].name)
      else reasons[id] = null
    }
    return reasons
  }, [items, dataset])

  const toggle = useCallback(
    (id: StepId) => {
      if (lockReason[id]) return
      setItems((list) => list.map((item) => (item.id === id ? { ...item, enabled: !item.enabled } : item)))
    },
    [lockReason],
  )

  const move = useCallback((from: number, to: number) => {
    setItems((list) => (to < 0 || to >= list.length ? list : arrayMove(list, from, to)))
  }, [])

  const reset = useCallback(() => setItems(DEFAULT_ITEMS), [])

  /** Only the ticked steps, in their current order. This is what the backend receives. */
  const active = useMemo(() => items.filter((i) => i.enabled).map((i) => i.id), [items])

  return { items, active, lockReason, toggle, move, reset }
}
