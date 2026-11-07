import { CheckCircle2, Loader2, Send } from 'lucide-react'
import { useEffect, useId, useRef } from 'react'
import { t } from '../../i18n'
import type { useAction } from '../../hooks/useAction'
import { MIN_DOCUMENTS, useCappedCount } from '../../hooks/useCappedCount'
import { useNumberDraft } from '../../hooks/useNumberDraft'
import type { usePublished } from '../../hooks/usePublished'
import { formatWhen } from '../../lib/format'
import type { DatasetId, PublishedSettings, PublishRequest, StepId } from '../../types'
import { Button } from '../ui/Button'
import { CapMessage } from '../ui/CapMessage'
import { ErrorNotice } from '../ui/ErrorNotice'
import { SectionCard } from '../ui/SectionCard'
import { Skeleton } from '../ui/Skeleton'
import { SettingsSummary } from './SettingsSummary'

interface Props {
  index: number
  dataset: DatasetId
  pipeline: StepId[]
  /** Documents in the chosen dataset. */
  total: number
  cap: number | null
  /** Why publishing is not possible right now, or null. */
  blocked: string | null
  published: ReturnType<typeof usePublished>
  publish: ReturnType<typeof useAction<[PublishRequest], PublishedSettings>>
}

const sameSteps = (a: StepId[], b: StepId[]) => a.length === b.length && a.every((step, i) => step === b[i])

/** Last step: send the current dataset + pipeline (+ a document limit) to the users. */
export function PublishPanel({ index, dataset, pipeline, total, cap, blocked, published, publish }: Props) {
  const p = t.publish
  const inputId = useId()
  const counter = useCappedCount(500, total, cap)
  const maxField = useNumberDraft(counter.count, counter.setCount, counter.limit)
  const current = published.settings

  // Start from the limit that is published now (once, when it arrives).
  const filled = useRef(false)
  const { setCount } = counter
  useEffect(() => {
    if (current && !filled.current) {
      filled.current = true
      setCount(current.max_documents_for_users)
    }
  }, [current, setCount])

  const upToDate =
    current !== null &&
    current.published_at !== null &&
    current.dataset === dataset &&
    sameSteps(current.pipeline, pipeline) &&
    current.max_documents_for_users === counter.count
  const reason = blocked ?? (pipeline.length === 0 ? p.needSteps : null)
  const working = publish.status === 'working'

  const submit = async () => {
    const result = await publish.run({ dataset, pipeline, max_documents_for_users: counter.count })
    if (result) published.setSettings(result)
  }

  return (
    <SectionCard id="publish" index={index} icon={Send} title={p.title} description={p.description}>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        {/* What will be published */}
        <div className="min-w-0 rounded-2xl border border-blue/40 p-4 sm:p-5">
          <p className="mb-4 text-sm font-semibold">{p.willPublish}</p>
          <SettingsSummary dataset={dataset} pipeline={pipeline} />
          <label htmlFor={inputId} className="mt-5 block text-sm font-medium">
            {p.maxLabel}
          </label>
          <input
            id={inputId}
            type="number"
            inputMode="numeric"
            min={MIN_DOCUMENTS}
            max={counter.limit}
            {...maxField}
            aria-invalid={counter.hitCap}
            className={`num mt-2 w-32 rounded-xl border bg-paper px-3 py-2 text-base font-semibold outline-none transition-colors focus:ring-4 ${
              counter.hitCap ? 'border-bad focus:ring-bad/15' : 'border-line hover:border-faint focus:border-blue focus:ring-blue/15'
            }`}
          />
          <p className="mt-1.5 text-xs text-muted">{p.maxHint(cap)}</p>
          <CapMessage show={counter.hitCap && cap !== null} text={t.documents.capReached(cap ?? 0)} />
        </div>

        {/* What users get today */}
        <div className="min-w-0 rounded-2xl border border-line bg-wash p-4 sm:p-5">
          <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
            <p className="text-sm font-semibold">{p.current}</p>
            {current && (
              <p className="text-xs text-muted">{current.published_at ? p.publishedAt(formatWhen(current.published_at)) : p.neverPublished}</p>
            )}
          </div>
          {published.error ? (
            <ErrorNotice title={t.user.settingsError} message={published.error} onRetry={() => void published.reload()} />
          ) : current ? (
            <SettingsSummary dataset={current.dataset} pipeline={current.pipeline} maxDocuments={current.max_documents_for_users} />
          ) : (
            <div className="flex flex-col gap-3" aria-busy>
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-4 w-2/5" />
            </div>
          )}
        </div>
      </div>

      {publish.status === 'error' && (
        <div className="mt-5">
          <ErrorNotice title={p.errorTitle} message={publish.error ?? ''} onRetry={() => void submit()} />
        </div>
      )}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Button
          onClick={() => void submit()}
          disabled={working || reason !== null || upToDate}
          icon={working ? <Loader2 size={16} className="animate-spin" aria-hidden /> : upToDate ? <CheckCircle2 size={16} aria-hidden /> : <Send size={16} aria-hidden />}
          className="!px-5"
        >
          {working ? p.publishing : upToDate ? p.published : p.publish}
        </Button>
        <p className={`text-sm ${reason ? 'text-orange-strong' : upToDate ? 'text-good' : 'text-muted'}`} aria-live="polite">
          {reason ?? (upToDate ? p.upToDate : current ? p.changed : '')}
        </p>
      </div>
    </SectionCard>
  )
}
