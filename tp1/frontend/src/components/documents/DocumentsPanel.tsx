import { FileText, FolderOpen, Loader2 } from 'lucide-react'
import { useId } from 'react'
import { t } from '../../i18n'
import { MIN_DOCUMENTS, type useCappedCount } from '../../hooks/useCappedCount'
import type { useDocuments } from '../../hooks/useDocuments'
import { useNumberDraft } from '../../hooks/useNumberDraft'
import { formatInt } from '../../lib/format'
import type { DatasetId } from '../../types'
import { Button } from '../ui/Button'
import { CapMessage } from '../ui/CapMessage'
import { RangeSlider, sliderMaxFor } from '../ui/RangeSlider'
import { EmptyState } from '../ui/EmptyState'
import { ErrorNotice } from '../ui/ErrorNotice'
import { SectionCard } from '../ui/SectionCard'
import { DocumentPreviewList } from './DocumentPreviewList'

const PRESETS = [100, 500, 2000, 5000]

interface Props {
  index: number
  dataset: DatasetId
  /** Total documents in the dataset (from the server). */
  total: number
  /** The online cap (null = no cap). */
  cap: number | null
  counter: ReturnType<typeof useCappedCount>
  documents: ReturnType<typeof useDocuments>
}

export function DocumentsPanel({ index, dataset, total, cap, counter, documents }: Props) {
  const inputId = useId()
  const { count, setCount, hitCap } = counter
  const countField = useNumberDraft(count, setCount, counter.limit)
  const { status, data, error, load, loadedCount } = documents
  const loading = status === 'loading'
  const stale = status === 'ready' && loadedCount !== count
  // The slider goes past the cap on purpose: trying to slide further shows the red message.
  const sliderMax = cap === null ? Math.min(total, 5000) : sliderMaxFor(cap, total)

  return (
    <SectionCard id="documents" index={index} icon={FolderOpen} title={t.documents.title} description={t.documents.description}>
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        {/* Left: choose N */}
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-sm text-muted">
            <FileText size={15} aria-hidden className="text-blue" />
            <span className="truncate font-mono text-[13px]">{t.dataset.options[dataset].file}</span>
          </div>

          <label htmlFor={inputId} className="mt-5 block text-sm font-medium">
            {t.documents.countLabel}
          </label>
          <div className="mt-2 flex items-center gap-4">
            <input
              id={inputId}
              type="number"
              inputMode="numeric"
              min={MIN_DOCUMENTS}
              max={counter.limit}
              {...countField}
              aria-invalid={hitCap}
              className={`num w-28 rounded-xl border bg-paper px-3 py-2 text-lg font-semibold outline-none transition-colors hover:border-faint focus:ring-4 ${
                hitCap ? 'border-bad focus:border-bad focus:ring-bad/15' : 'border-line focus:border-blue focus:ring-blue/15'
              }`}
            />
            <RangeSlider
              label={t.documents.countLabel}
              min={MIN_DOCUMENTS}
              max={sliderMax}
              value={count}
              limit={cap}
              invalid={hitCap}
              onChange={setCount}
            />
          </div>
          <p className="mt-2 text-xs text-muted">{t.documents.countHint(counter.limit)}</p>
          <CapMessage show={hitCap && cap !== null} text={t.documents.capReached(cap ?? 0)} />

          <div className="mt-5 flex flex-wrap items-center gap-2" role="group" aria-label={t.documents.presets}>
            {PRESETS.filter((n) => n <= total).map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setCount(n)}
                aria-pressed={count === n}
                className={`num rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-colors ${
                  count === n ? 'border-blue text-blue-strong' : 'border-line text-muted hover:border-faint hover:text-ink'
                } ${cap !== null && n > cap ? 'line-through decoration-bad/60' : ''}`}
              >
                {formatInt(n)}
              </button>
            ))}
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Button
              onClick={() => void load(count)}
              disabled={loading}
              icon={loading ? <Loader2 size={16} className="animate-spin" aria-hidden /> : <FolderOpen size={16} aria-hidden />}
            >
              {loading ? t.documents.loading : status === 'ready' ? t.documents.reload : t.documents.load}
            </Button>
            {status === 'ready' && data && (
              <p className="text-sm" aria-live="polite">
                <span className="num font-semibold text-blue-strong">{t.documents.selected(data.selected)}</span>{' '}
                <span className="text-muted">{t.documents.ofTotal(data.total_available)}</span>
              </p>
            )}
          </div>
          {stale && <p className="mt-3 text-xs text-orange-strong">{t.documents.changed}</p>}
        </div>

        {/* Right: preview */}
        <div className="min-w-0">
          {status === 'error' && <ErrorNotice title={t.documents.errorTitle} message={error ?? ''} onRetry={() => void load(count)} />}
          {status === 'idle' && <EmptyState icon={FileText} title={t.documents.emptyTitle} body={t.documents.emptyBody} />}
          {(status === 'loading' || status === 'ready') && (
            <DocumentPreviewList documents={data?.documents ?? []} loading={loading} />
          )}
        </div>
      </div>
    </SectionCard>
  )
}
