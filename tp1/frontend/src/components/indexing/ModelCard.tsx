import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { t } from '../../i18n'
import type { ModelId, StructureId, StructureProgress } from '../../types'
import { STRUCTURE_IDS } from '../../types'
import { ProgressBar } from './ProgressBar'

interface Props {
  model: ModelId
  progress: Record<StructureId, StructureProgress>
  index: number
}

/** One weighting model (BoW, F, TF, TF-IDF) with the progress of its three structures. */
export function ModelCard({ model, progress, index }: Props) {
  const info = t.models[model]
  const total = STRUCTURE_IDS.reduce((sum, s) => sum + progress[s].percent, 0) / STRUCTURE_IDS.length
  const complete = total >= 100

  return (
    <motion.li
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.06 * index, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className={`min-w-0 list-none rounded-2xl border bg-paper p-4 transition-colors duration-500 ${
        complete ? 'border-blue/50' : 'border-line'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[15px] font-semibold tracking-tight">{info.name}</p>
          <p className="truncate text-xs text-muted">{info.long}</p>
        </div>
        {complete ? (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 18 }}
            className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-blue text-blue"
          >
            <Check size={13} strokeWidth={3} aria-label={t.indexing.complete} />
          </motion.span>
        ) : (
          <span className="num text-sm font-medium text-muted">{Math.round(total)}%</span>
        )}
      </div>

      <ul className="mt-4 flex flex-col gap-3">
        {STRUCTURE_IDS.map((s) => (
          <li key={s} className="list-none">
            <div className="mb-1.5 flex items-center justify-between text-[13px]">
              <span className="text-muted">{t.structures[s].name}</span>
              <span className={`num ${progress[s].percent >= 100 ? 'text-blue-strong' : 'text-muted'}`}>
                {progress[s].percent}%
              </span>
            </div>
            <ProgressBar percent={progress[s].percent} label={`${info.name}, ${t.structures[s].name}`} />
          </li>
        ))}
      </ul>
    </motion.li>
  )
}
