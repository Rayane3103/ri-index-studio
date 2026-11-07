import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

interface Props {
  id: string
  title: string
  description: string
  icon: LucideIcon
  /** Position on the page, used to stagger the entrance. */
  index: number
  /** Small element on the right of the title (a badge or an action). */
  aside?: ReactNode
  children: ReactNode
}

/** White card with a thin border and soft shadow. Every page section uses it. */
export function SectionCard({ id, title, description, icon: Icon, index, aside, children }: Props) {
  return (
    <motion.section
      id={id}
      aria-labelledby={`${id}-title`}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.08 * index, ease: [0.16, 1, 0.3, 1] }}
      className="scroll-mt-24 rounded-xl2 border border-line bg-paper p-5 shadow-card sm:p-7"
    >
      <header className="mb-6 flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3.5">
          <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-[10px] border border-blue/30 text-blue">
            <Icon size={18} strokeWidth={1.8} aria-hidden />
          </span>
          <div className="min-w-0">
            <h2 id={`${id}-title`} className="text-[17px] font-semibold tracking-tight text-ink">
              {title}
            </h2>
            <p className="mt-0.5 max-w-xl text-sm text-muted">{description}</p>
          </div>
        </div>
        {aside}
      </header>
      {children}
    </motion.section>
  )
}
