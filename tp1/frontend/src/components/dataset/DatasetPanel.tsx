import { motion } from 'framer-motion'
import { Check, Database, FileCode2, FileSpreadsheet, Info, type LucideIcon } from 'lucide-react'
import { useId } from 'react'
import { t } from '../../i18n'
import type { useDatasets } from '../../hooks/useDatasets'
import type { DatasetId } from '../../types'
import { ErrorNotice } from '../ui/ErrorNotice'
import { SectionCard } from '../ui/SectionCard'

const OPTIONS: { id: DatasetId; icon: LucideIcon }[] = [
  { id: 'csv', icon: FileSpreadsheet },
  { id: 'xml', icon: FileCode2 },
]

interface Props {
  index: number
  value: DatasetId
  onChange: (dataset: DatasetId) => void
  datasets: ReturnType<typeof useDatasets>
}

/** Step 1: CSV or XML. Each card shows the same news line as it looks in that file, so the tag difference is visible. */
export function DatasetPanel({ index, value, onChange, datasets }: Props) {
  const group = useId()
  const d = t.dataset
  const xmlMissing = datasets.data !== null && !datasets.data.xml.available

  return (
    <SectionCard id="dataset" index={index} icon={Database} title={d.title} description={d.description}>
      <div role="radiogroup" aria-label={d.label} className="grid gap-3.5 sm:grid-cols-2">
        {OPTIONS.map(({ id, icon: Icon }) => {
          const selected = value === id
          const info = datasets.data?.[id]
          const missing = info !== undefined && !info.available
          return (
            <label
              key={id}
              className={`relative block cursor-pointer rounded-2xl border p-4 transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-blue sm:p-5 ${
                selected ? 'border-blue' : 'border-line hover:border-faint'
              }`}
            >
              <input type="radio" name={group} value={id} checked={selected} onChange={() => onChange(id)} className="sr-only" />
              {selected && (
                <motion.span
                  layoutId={`dataset-${group}`}
                  className="absolute inset-0 rounded-2xl border-2 border-blue"
                  transition={{ type: 'spring', stiffness: 500, damping: 36 }}
                  aria-hidden
                />
              )}
              <div className="relative flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-[10px] border ${selected ? 'border-blue/40 text-blue' : 'border-line text-muted'}`}>
                    <Icon size={18} strokeWidth={1.8} aria-hidden />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[15px] font-semibold tracking-tight">{d.options[id].name}</span>
                    <span className="block truncate font-mono text-[12px] text-muted">{d.options[id].file}</span>
                  </span>
                </div>
                <span
                  className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 transition-colors ${
                    selected ? 'border-blue bg-blue text-white' : 'border-line text-transparent'
                  }`}
                  aria-hidden
                >
                  <Check size={11} strokeWidth={3.5} />
                </span>
              </div>

              {/* The same line of the first Reuters article, as it is stored in each file */}
              <p className="relative mt-4 truncate rounded-lg border border-line bg-wash px-3 py-2 font-mono text-[12px] text-ink">
                {id === 'xml' ? (
                  <>
                    <span className="text-orange-strong">&lt;BODY&gt;</span>Showers continued<span className="text-orange-strong">&lt;/BODY&gt;</span>
                  </>
                ) : (
                  'Showers continued'
                )}
              </p>
              <p className="relative mt-2.5 text-[13px] text-muted">{d.options[id].hint}</p>

              <p className="relative mt-3 text-[13px] font-medium" aria-live="polite">
                {info === undefined ? (
                  <span className="text-muted">{d.checking}</span>
                ) : missing ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-orange/60 px-2.5 py-0.5 text-orange-strong">
                    <span className="h-1.5 w-1.5 rounded-full bg-orange" aria-hidden />
                    {d.missing}
                  </span>
                ) : (
                  <span className="num text-blue-strong">{d.documents(info.total)}</span>
                )}
              </p>
            </label>
          )
        })}
      </div>

      {datasets.error && (
        <div className="mt-5">
          <ErrorNotice title={d.errorTitle} message={datasets.error} onRetry={() => void datasets.reload()} />
        </div>
      )}
      {value === 'xml' && xmlMissing ? (
        <p className="mt-5 flex items-start gap-2.5 rounded-xl border border-orange/50 px-3.5 py-2.5 text-[13px] text-ink">
          <Info size={15} className="mt-0.5 shrink-0 text-orange-strong" aria-hidden />
          {d.missingBody}
        </p>
      ) : (
        <p className="mt-5 flex items-center gap-2 text-[13px] text-muted">
          <Info size={14} className="shrink-0 text-blue" aria-hidden />
          {value === 'csv' ? d.noTagsNote : d.tagsNote}
        </p>
      )}
    </SectionCard>
  )
}
