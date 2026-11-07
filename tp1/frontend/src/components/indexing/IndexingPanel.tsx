import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, Database, Loader2, Sparkles } from 'lucide-react'
import { t } from '../../i18n'
import type { useIndexing } from '../../hooks/useIndexing'
import { MODEL_IDS, STRUCTURE_IDS } from '../../types'
import { Button } from '../ui/Button'
import { ErrorNotice } from '../ui/ErrorNotice'
import { SectionCard } from '../ui/SectionCard'
import { ModelCard } from './ModelCard'
import { ProgressBar } from './ProgressBar'

interface Props {
  index: number
  indexing: ReturnType<typeof useIndexing>
  /** Number of documents selected, or null when none are loaded yet. */
  documentCount: number | null
  stepCount: number
  /** A reason why indexing cannot start (e.g. the XML files are missing), or null. */
  blocked: string | null
  onGenerate: () => void
}

export function IndexingPanel({ index, indexing, documentCount, stepCount, blocked, onGenerate }: Props) {
  const { status } = indexing
  const running = status.state === 'running'
  const done = status.state === 'done'
  const failed = status.state === 'error'
  const builtCount = MODEL_IDS.reduce(
    (sum, m) => sum + STRUCTURE_IDS.filter((s) => status.models[m][s].percent >= 100).length,
    0,
  )
  const total = MODEL_IDS.length * STRUCTURE_IDS.length
  const canStart = documentCount !== null && !running && blocked === null
  const hint = blocked ?? (documentCount === null ? t.indexing.needDocs : t.indexing.ready(documentCount, stepCount))

  return (
    <SectionCard
      id="indexing"
      index={index}
      icon={Database}
      title={t.indexing.title}
      description={t.indexing.description}
    >
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <Button
          variant="key"
          onClick={onGenerate}
          disabled={!canStart}
          className="!px-6 !py-3 !text-[15px]"
          icon={running ? <Loader2 size={17} className="animate-spin" aria-hidden /> : <Sparkles size={17} aria-hidden />}
        >
          {running ? t.indexing.running : done || failed ? t.indexing.regenerate : t.indexing.generate}
        </Button>
        <p className={`text-sm ${blocked ? 'text-orange-strong' : 'text-muted'}`} aria-live="polite">
          {hint}
        </p>
      </div>

      <AnimatePresence initial={false}>
        {failed && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="mt-5">
              <ErrorNotice title={t.indexing.errorTitle} message={status.error ?? t.indexing.errorFallback} onRetry={onGenerate} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-7">
        <div className="mb-2.5 flex items-center justify-between gap-3 text-sm">
          <span className="font-medium" aria-live="polite">
            {done ? (
              <span className="inline-flex items-center gap-1.5 text-blue-strong">
                <CheckCircle2 size={16} aria-hidden /> {t.indexing.done}
              </span>
            ) : status.measuring ? (
              <span className="inline-flex items-center gap-1.5">
                <Loader2 size={15} className="animate-spin text-blue" aria-hidden /> {t.indexing.measuring}
              </span>
            ) : (
              t.indexing.overall(builtCount, total)
            )}
          </span>
          <span className="num font-semibold text-ink">{status.percent}%</span>
        </div>
        <ProgressBar percent={status.percent} label={t.indexing.title} size="thick" />
        {done && <p className="mt-2 text-[13px] text-muted">{t.indexing.doneBody}</p>}
        {status.state === 'idle' && <p className="mt-2 text-[13px] text-muted">{t.indexing.idleBody}</p>}
      </div>

      <ul className="mt-6 grid gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
        {MODEL_IDS.map((model, i) => (
          <ModelCard key={model} model={model} progress={status.models[model]} index={i} />
        ))}
      </ul>
    </SectionCard>
  )
}
