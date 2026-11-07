import { motion } from 'framer-motion'
import { FileText, Loader2, ScanSearch, Search, Shuffle } from 'lucide-react'
import { useId, useState, type FormEvent } from 'react'
import { t } from '../../i18n'
import type { usePipelinePreview } from '../../hooks/usePipelinePreview'
import { Button } from '../ui/Button'
import { EmptyState } from '../ui/EmptyState'
import { ErrorNotice } from '../ui/ErrorNotice'

const MAX_CHIPS = 150
const p = t.pipeline.preview

interface Props {
  /** How many documents are loaded (null = none yet). */
  documentCount: number | null
  preview: ReturnType<typeof usePipelinePreview>
}

const countWords = (text: string) => text.split(/\s+/).filter(Boolean).length

/** Follow one document through the pipeline: the text after every step, then the final tokens. */
export function PipelinePreview({ documentCount, preview }: Props) {
  const { status, data, error, random, inspect } = preview
  const inputId = useId()
  const [idText, setIdText] = useState('')
  const disabled = documentCount === null
  const loading = status === 'loading'

  const submit = (event: FormEvent) => {
    event.preventDefault()
    const id = Number(idText)
    if (Number.isInteger(id) && id > 0) void inspect(id)
  }

  return (
    <div className="mt-8 border-t border-line pt-7">
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
        <div className="min-w-0">
          <h3 className="text-[15px] font-semibold tracking-tight text-ink">{p.title}</h3>
          <p className="mt-0.5 max-w-md text-sm text-muted">{p.description}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <form onSubmit={submit} className="flex items-center gap-2">
            <label htmlFor={inputId} className="sr-only">
              {p.idLabel}
            </label>
            <input
              id={inputId}
              type="number"
              inputMode="numeric"
              min={1}
              value={idText}
              onChange={(e) => setIdText(e.target.value)}
              placeholder={p.idPlaceholder}
              disabled={disabled}
              className="num w-36 rounded-xl border border-line bg-paper px-3 py-2 text-sm outline-none transition-colors placeholder:text-faint hover:border-faint focus:border-blue focus:ring-4 focus:ring-blue/15 disabled:opacity-60"
            />
            <Button type="submit" variant="outline" disabled={disabled || loading || idText === ''} icon={<Search size={15} aria-hidden />}>
              {p.inspect}
            </Button>
          </form>
          <Button
            onClick={() => void random()}
            disabled={disabled || loading}
            icon={loading ? <Loader2 size={15} className="animate-spin" aria-hidden /> : <Shuffle size={15} aria-hidden />}
          >
            {p.random}
          </Button>
        </div>
      </div>
      {disabled && <p className="mt-3 text-[13px] text-muted">{p.needDocs}</p>}

      <div className="mt-6" aria-live="polite">
        {status === 'idle' && <EmptyState icon={ScanSearch} title={p.emptyTitle} body={p.emptyBody} />}
        {status === 'error' && <ErrorNotice title={p.errorTitle} message={error ?? ''} onRetry={() => void random()} />}
        {data && status !== 'error' && <Timeline data={data} busy={loading} />}
      </div>
    </div>
  )
}

function Timeline({ data, busy }: { data: NonNullable<ReturnType<typeof usePipelinePreview>['data']>; busy: boolean }) {
  // Every box of the timeline: the raw text, then one per step.
  let previousWords = countWords(data.raw_text)
  const boxes = [
    { key: 'raw', label: p.rawText, text: data.raw_text, words: previousWords, delta: 0 },
    ...data.steps.map((step, i) => {
      const words = countWords(step.text)
      const delta = previousWords - words
      previousWords = words
      return { key: `${step.step}-${i}`, label: t.steps[step.step].name, text: step.text, words, delta }
    }),
  ]
  const shownTokens = data.tokens.slice(0, MAX_CHIPS)

  return (
    <motion.div animate={{ opacity: busy ? 0.55 : 1 }} transition={{ duration: 0.2 }} aria-busy={busy}>
      <p className="mb-4 flex items-center gap-2 text-sm">
        <FileText size={15} className="shrink-0 text-blue" aria-hidden />
        <span className="text-muted">{p.document}</span>
        <span className="num font-mono text-[13px] font-semibold text-blue-strong">#{data.doc_id}</span>
        <span className="truncate font-medium text-ink">{data.title}</span>
      </p>

      <ol>
        {boxes.map((box, i) => (
          <motion.li
            key={`${data.doc_id}-${box.key}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="relative pb-5 pl-10"
          >
            <span className="absolute bottom-0 left-[13px] top-7 w-px bg-line" aria-hidden />
            <span
              className="num absolute left-0 top-0 grid h-[27px] w-[27px] place-items-center rounded-full border border-blue/50 bg-paper text-[12px] font-semibold text-blue-strong"
              aria-hidden
            >
              {i}
            </span>
            <div className="mb-1.5 flex flex-wrap items-baseline gap-x-3">
              <p className="text-sm font-semibold text-ink">{box.label}</p>
              <p className="num text-xs text-muted">
                {p.words(box.words)}
                {box.delta !== 0 && (
                  <span className="ml-2 font-medium text-orange-strong">{box.delta > 0 ? p.fewer(box.delta) : p.more(-box.delta)}</span>
                )}
              </p>
            </div>
            <div className="thin-scroll max-h-44 overflow-auto whitespace-pre-wrap break-words rounded-xl border border-line bg-wash px-3.5 py-3 font-mono text-[12.5px] leading-relaxed text-ink">
              {box.text || <span className="text-faint">—</span>}
            </div>
          </motion.li>
        ))}

        <motion.li
          key={`${data.doc_id}-tokens`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: boxes.length * 0.05, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="relative pl-10"
        >
          <span className="absolute left-0 top-0 grid h-[27px] w-[27px] place-items-center rounded-full border border-orange/70 bg-paper" aria-hidden>
            <span className="h-2 w-2 rounded-full bg-orange" />
          </span>
          <div className="mb-1.5 flex flex-wrap items-baseline gap-x-3">
            <p className="text-sm font-semibold text-ink">{p.finalTokens}</p>
            <p className="num text-xs text-muted">{p.tokens(data.tokens.length)}</p>
          </div>
          {data.steps.length === 0 && <p className="mb-2 text-[13px] text-muted">{p.noSteps}</p>}
          {data.tokens.length === 0 ? (
            <p className="text-[13px] text-muted">{p.noTokens}</p>
          ) : (
            <ul className="thin-scroll flex max-h-44 flex-wrap gap-1.5 overflow-auto">
              {shownTokens.map((token, i) => (
                <li key={i} className="rounded-full border border-orange/50 px-2.5 py-0.5 font-mono text-[12px] text-ink">
                  {token}
                </li>
              ))}
              {data.tokens.length > MAX_CHIPS && (
                <li className="num px-1 py-0.5 text-[12px] text-muted">{p.moreTokens(data.tokens.length - MAX_CHIPS)}</li>
              )}
            </ul>
          )}
        </motion.li>
      </ol>
    </motion.div>
  )
}
