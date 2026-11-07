import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { t } from '../../i18n'
import type { StepId } from '../../types'

interface Props {
  active: StepId[]
}

const chip = 'whitespace-nowrap rounded-full border px-3 py-1.5 text-[13px] font-medium'

/** Raw text → step → step → tokens. Updates live as the list is edited. */
export function PipelineFlow({ active }: Props) {
  return (
    <div>
      <p className="mb-3 text-sm font-medium">{t.pipeline.flowTitle}</p>
      <ol className="flex flex-wrap items-center gap-y-2" aria-label={t.pipeline.flowTitle}>
        <li className="flex items-center">
          <span className={`${chip} border-line text-muted`}>{t.pipeline.rawText}</span>
          <Arrow />
        </li>
        <AnimatePresence initial={false} mode="popLayout">
          {active.map((id) => (
            <motion.li
              key={id}
              layout
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ type: 'spring', stiffness: 500, damping: 34 }}
              className="flex items-center"
            >
              <span className={`${chip} border-blue/60 text-blue-strong`}>{t.steps[id].name}</span>
              <Arrow />
            </motion.li>
          ))}
        </AnimatePresence>
        <motion.li layout className="flex items-center">
          <span className={`${chip} flex items-center gap-1.5 border-orange/70 text-ink`}>
            <span className="h-1.5 w-1.5 rounded-full bg-orange" aria-hidden />
            {t.pipeline.tokens}
          </span>
        </motion.li>
      </ol>
      {active.length === 0 && <p className="mt-3 text-[13px] text-muted">{t.pipeline.flowEmpty}</p>}
    </div>
  )
}

function Arrow() {
  return <ArrowRight size={15} className="mx-1.5 shrink-0 text-faint" aria-hidden />
}
