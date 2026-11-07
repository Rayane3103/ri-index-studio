import { useCallback, useEffect, useRef, useState } from 'react'
import { previewPipeline } from '../api'
import type { DatasetId, PreviewResponse, StepId } from '../types'

export type PreviewStatus = 'idle' | 'loading' | 'ready' | 'error'

/**
 * Runs the pipeline on one document so the admin can see what each step does.
 * When the steps or their order change, the same document is run again automatically.
 */
export function usePipelinePreview(dataset: DatasetId, active: StepId[], documentCount: number | null) {
  const [status, setStatus] = useState<PreviewStatus>('idle')
  const [data, setData] = useState<PreviewResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const latest = useRef(0) // only the answer of the latest request is used

  const run = useCallback(
    async (docId: number | null) => {
      if (documentCount === null) return
      const ticket = ++latest.current
      setStatus('loading')
      setError(null)
      try {
        const result = await previewPipeline({ dataset, pipeline: active, n_documents: documentCount, doc_id: docId })
        if (ticket !== latest.current) return
        setData(result)
        setStatus('ready')
      } catch (e) {
        if (ticket !== latest.current) return
        setError(e instanceof Error ? e.message : String(e))
        setStatus('error')
      }
    },
    [dataset, active, documentCount],
  )

  /** A random document among the loaded ones. */
  const random = useCallback(() => run(null), [run])
  /** A specific document, chosen by its id. */
  const inspect = useCallback((docId: number) => run(docId), [run])

  // The pipeline (or the dataset) changed: show the same document again with the new steps.
  const pipelineKey = dataset + ':' + active.join(',')
  const shownId = data?.doc_id ?? null
  useEffect(() => {
    if (shownId !== null) void run(shownId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pipelineKey])

  return { status, data, error, random, inspect }
}
