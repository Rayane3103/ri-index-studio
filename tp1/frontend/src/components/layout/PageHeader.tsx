import { motion } from 'framer-motion'
import { FlaskConical } from 'lucide-react'
import { USE_MOCKS } from '../../api'
import { t } from '../../i18n'

/** Page title. Shows a small "Demo data" badge while the fake API is active. */
export function PageHeader() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-wrap items-start justify-between gap-4"
    >
      <div className="min-w-0">
        <h1 className="text-balance text-[28px] font-semibold leading-tight tracking-tight sm:text-[32px]">
          {t.header.title}
        </h1>
        <p className="mt-2 max-w-xl text-pretty text-[15px] text-muted">{t.header.subtitle}</p>
      </div>
      {USE_MOCKS && (
        <span
          title={t.header.mockHint}
          className="inline-flex items-center gap-1.5 rounded-full border border-orange/60 px-3 py-1 text-xs font-medium text-orange-strong"
        >
          <FlaskConical size={13} aria-hidden />
          {t.header.mockBadge}
        </span>
      )}
    </motion.div>
  )
}
