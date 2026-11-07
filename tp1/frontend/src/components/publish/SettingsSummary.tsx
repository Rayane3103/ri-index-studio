import { ArrowRight } from 'lucide-react'
import { t } from '../../i18n'
import type { DatasetId, StepId } from '../../types'

interface Props {
  dataset: DatasetId
  pipeline: StepId[]
  maxDocuments?: number
}

/** Read-only view of a set of settings: dataset, steps in order, limit. Used by the Publish step and the user page. */
export function SettingsSummary({ dataset, pipeline, maxDocuments }: Props) {
  const p = t.publish
  return (
    <dl className="grid gap-4 text-sm">
      <div className="grid gap-1">
        <dt className="text-[13px] text-muted">{p.dataset}</dt>
        <dd className="font-medium">{t.dataset.options[dataset].name}</dd>
      </div>
      <div className="grid gap-1">
        <dt className="text-[13px] text-muted">{p.pipeline}</dt>
        <dd>
          {pipeline.length === 0 ? (
            <span className="text-muted">{t.pipeline.flowEmpty}</span>
          ) : (
            <ol className="flex flex-wrap items-center gap-x-1 gap-y-1.5">
              {/* The arrow goes with the step after it, so a new line starts with "→ step" */}
              {pipeline.map((step, i) => (
                <li key={step} className="flex items-center gap-1">
                  {i > 0 && <ArrowRight size={13} className="shrink-0 text-faint" aria-hidden />}
                  <span className="whitespace-nowrap rounded-full border border-blue/50 px-2.5 py-0.5 text-[12.5px] font-medium text-blue-strong">
                    {t.steps[step].name}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </dd>
      </div>
      {maxDocuments !== undefined && (
        <div className="grid gap-1">
          <dt className="text-[13px] text-muted">{p.limit}</dt>
          <dd className="num font-medium">{p.limitValue(maxDocuments)}</dd>
        </div>
      )}
    </dl>
  )
}
