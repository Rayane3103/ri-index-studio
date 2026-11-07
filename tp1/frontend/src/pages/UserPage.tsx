import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, Download, Layers, Loader2, Play, RotateCcw, SlidersHorizontal } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import { downloadUserIndexes, runUserIndexing } from '../api'
import { useAuth } from '../auth/AuthContext'
import { ModelCard } from '../components/indexing/ModelCard'
import { ProgressBar } from '../components/indexing/ProgressBar'
import { AccountMenu } from '../components/layout/AccountMenu'
import { MetricsSkeleton, MetricsView } from '../components/metrics/MetricsView'
import { SettingsSummary } from '../components/publish/SettingsSummary'
import { DownloadControls } from '../components/storage/DownloadControls'
import { Button } from '../components/ui/Button'
import { CapMessage } from '../components/ui/CapMessage'
import { ErrorNotice } from '../components/ui/ErrorNotice'
import { RangeSlider, sliderMaxFor } from '../components/ui/RangeSlider'
import { Skeleton } from '../components/ui/Skeleton'
import { useAction } from '../hooks/useAction'
import { MIN_DOCUMENTS, useCappedCount } from '../hooks/useCappedCount'
import { useConfig } from '../hooks/useConfig'
import { useIndexing } from '../hooks/useIndexing'
import { useNumberDraft } from '../hooks/useNumberDraft'
import { usePublished } from '../hooks/usePublished'
import { t } from '../i18n'
import type { SaveFormat } from '../types'
import { MODEL_IDS, STRUCTURE_IDS } from '../types'

const u = t.user

/** The user only picks a number of documents and runs. Dataset and pipeline come from the admin. */
export function UserPage() {
  const { user } = useAuth()
  const config = useConfig()
  const published = usePublished()
  const indexing = useIndexing()
  const [format, setFormat] = useState<SaveFormat>('json')
  const [ranWith, setRanWith] = useState<number | null>(null)
  const download = useAction((f: SaveFormat) => downloadUserIndexes({ n_documents: ranWith!, format: f }))
  const inputId = useId()
  const resultsRef = useRef<HTMLDivElement>(null)

  const settings = published.settings
  const onlineCap = config?.max_documents_online ?? null
  const adminMax = settings?.max_documents_for_users ?? 500
  // The real limit is the smaller of the admin limit and the online server limit.
  const limit = onlineCap === null ? adminMax : Math.min(adminMax, onlineCap)
  const sliderMax = sliderMaxFor(limit, Number.MAX_SAFE_INTEGER)
  const counter = useCappedCount(Math.min(500, limit), sliderMax, limit)
  const capIsServer = onlineCap !== null && onlineCap <= adminMax
  const countField = useNumberDraft(counter.count, counter.setCount, limit)

  const { status, metrics } = indexing
  const running = status.state === 'running'
  const built = status.state === 'done' && metrics !== null
  const builtCount = MODEL_IDS.reduce((sum, m) => sum + STRUCTURE_IDS.filter((s) => status.models[m][s].percent >= 100).length, 0)

  const run = () => {
    setRanWith(counter.count)
    download.reset()
    void indexing.start((onEvent) => runUserIndexing({ n_documents: counter.count }, onEvent))
  }

  // Bring the results into view when they arrive.
  useEffect(() => {
    if (built) resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [built])

  return (
    <div className="min-h-screen bg-paper">
      <header className="sticky top-0 z-30 border-b border-line bg-paper/90 backdrop-blur">
        <div className="mx-auto flex max-w-[1040px] items-center gap-3 px-4 py-2.5 sm:px-8">
          <span className="grid h-8 w-8 place-items-center rounded-[9px] border-2 border-blue text-blue">
            <Layers size={16} strokeWidth={2} aria-hidden />
          </span>
          <div className="flex-1 leading-tight">
            <p className="text-[15px] font-semibold tracking-tight">{t.app.name}</p>
            <p className="text-xs text-muted">{t.app.userTagline}</p>
          </div>
          <div className="w-auto sm:w-56">
            <AccountMenu />
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-[1040px] flex-col gap-7 px-4 pb-24 pt-10 sm:px-8 sm:pt-14">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}>
          <p className="text-[15px] font-medium text-blue-strong">{u.greeting(user?.name ?? '')}</p>
          <h1 className="mt-1 text-balance text-[32px] font-semibold leading-tight tracking-tight sm:text-[40px]">{u.title}</h1>
          <p className="mt-2 max-w-xl text-pretty text-[15px] text-muted">{u.subtitle}</p>
        </motion.div>

        {/* The one control: how many documents, then Run */}
        <section className="grid overflow-hidden rounded-xl2 border border-line shadow-card lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)]" aria-label={u.countLabel}>
          <div className="min-w-0 p-5 sm:p-8">
            <label htmlFor={inputId} className="text-sm font-medium text-muted">
              {u.countLabel}
            </label>
            <div className="mt-2 flex items-baseline gap-3">
              {/* The invisible copy of the number gives the input exactly the width of its text */}
              <span className="relative inline-block min-w-0 text-[56px] font-semibold leading-none tracking-tight sm:text-[72px]">
                <span className="num invisible block whitespace-pre border-b-2 border-transparent px-0.5" aria-hidden>
                  {countField.value || '0'}
                </span>
                <input
                  id={inputId}
                  type="number"
                  inputMode="numeric"
                  min={MIN_DOCUMENTS}
                  max={limit}
                  {...countField}
                  disabled={running}
                  aria-invalid={counter.hitCap}
                  aria-describedby={`${inputId}-hint`}
                  className={`num absolute inset-0 w-full min-w-0 appearance-none rounded-none border-0 border-b-2 bg-transparent p-0 px-0.5 font-[inherit] outline-none transition-colors focus-visible:outline-none [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none ${
                    counter.hitCap ? 'border-bad text-bad' : 'border-transparent hover:border-line focus:border-blue'
                  }`}
                />
              </span>
              <span className="text-lg text-muted">{u.words}</span>
            </div>
            <div className="mt-7">
              <RangeSlider
                label={u.countLabel}
                min={MIN_DOCUMENTS}
                max={sliderMax}
                value={counter.count}
                limit={limit}
                invalid={counter.hitCap}
                disabled={running}
                onChange={counter.setCount}
                showScale
              />
            </div>
            <p id={`${inputId}-hint`} className="mt-3 text-[13px] text-muted">
              {u.countHint(limit)}
            </p>
            <CapMessage show={counter.hitCap} text={capIsServer ? t.documents.capReached(onlineCap ?? 0) : u.adminLimit(adminMax)} />

            <Button
              variant="key"
              onClick={run}
              disabled={running || settings === null}
              className="mt-7 w-full !py-3.5 !text-base sm:w-auto sm:!px-8"
              icon={running ? <Loader2 size={18} className="animate-spin" aria-hidden /> : built ? <RotateCcw size={18} aria-hidden /> : <Play size={18} aria-hidden />}
            >
              {running ? u.running : built || status.state === 'error' ? u.runAgain : u.run}
            </Button>
          </div>

          <aside className="min-w-0 border-t border-line bg-wash p-5 sm:p-8 lg:border-l lg:border-t-0">
            <p className="mb-4 flex items-center gap-2 text-sm font-semibold">
              <SlidersHorizontal size={15} className="text-blue" aria-hidden />
              {u.settingsTitle}
            </p>
            {published.error ? (
              <ErrorNotice title={u.settingsError} message={published.error} onRetry={() => void published.reload()} />
            ) : settings ? (
              <SettingsSummary dataset={settings.dataset} pipeline={settings.pipeline} maxDocuments={settings.max_documents_for_users} />
            ) : (
              <div className="flex flex-col gap-3" aria-busy aria-label={u.settingsLoading}>
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-4/5" />
                <Skeleton className="h-4 w-2/5" />
              </div>
            )}
          </aside>
        </section>

        {/* Progress, then results */}
        <AnimatePresence initial={false}>
          {status.state !== 'idle' && (
            <motion.section
              key="progress"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="rounded-xl2 border border-line p-5 shadow-card sm:p-7"
              aria-label={u.progressTitle}
            >
              {status.state === 'error' && (
                <div className="mb-6">
                  <ErrorNotice title={u.errorTitle} message={status.error ?? t.indexing.errorFallback} onRetry={run} />
                </div>
              )}
              <div className="mb-2.5 flex items-center justify-between gap-3 text-sm" aria-live="polite">
                <span className="font-medium">
                  {built ? (
                    <span className="inline-flex items-center gap-1.5 text-blue-strong">
                      <CheckCircle2 size={16} aria-hidden /> {t.indexing.done}
                    </span>
                  ) : status.measuring ? (
                    <span className="inline-flex items-center gap-1.5">
                      <Loader2 size={15} className="animate-spin text-blue" aria-hidden /> {t.indexing.measuring}
                    </span>
                  ) : (
                    t.indexing.overall(builtCount, MODEL_IDS.length * STRUCTURE_IDS.length)
                  )}
                </span>
                <span className="num font-semibold">{status.percent}%</span>
              </div>
              <ProgressBar percent={status.percent} label={u.progressTitle} size="thick" />
              <ul className="mt-6 grid gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
                {MODEL_IDS.map((model, i) => (
                  <ModelCard key={model} model={model} progress={status.models[model]} index={i} />
                ))}
              </ul>
            </motion.section>
          )}
        </AnimatePresence>

        {(status.measuring || built) && (
          <div ref={resultsRef} className="scroll-mt-24">
            <section className="rounded-xl2 border border-blue/40 p-5 shadow-card sm:p-7" aria-labelledby="results-title">
              <h2 id="results-title" className="text-[22px] font-semibold tracking-tight">
                {u.resultsTitle}
              </h2>
              {metrics && <p className="mt-1 text-sm text-muted">{u.resultsBody(metrics.documents_indexed)}</p>}
              <div className="mt-6">{metrics ? <MetricsView metrics={metrics} showTable={false} /> : <MetricsSkeleton />}</div>
            </section>
          </div>
        )}

        {built && (
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl2 border border-line p-5 shadow-card sm:p-7"
            aria-labelledby="download-title"
          >
            <div className="mb-6 flex items-start gap-3.5">
              <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-[10px] border border-blue/30 text-blue">
                <Download size={18} strokeWidth={1.8} aria-hidden />
              </span>
              <div>
                <h2 id="download-title" className="text-[17px] font-semibold tracking-tight">
                  {u.downloadTitle}
                </h2>
                <p className="mt-0.5 text-sm text-muted">{u.downloadBody}</p>
              </div>
            </div>
            <DownloadControls format={format} onFormatChange={setFormat} ready={built} download={download} />
          </motion.section>
        )}
      </main>
    </div>
  )
}
