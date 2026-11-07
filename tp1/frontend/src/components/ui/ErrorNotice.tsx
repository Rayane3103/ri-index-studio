import { AlertTriangle, RotateCcw } from 'lucide-react'
import { motion } from 'framer-motion'
import { t } from '../../i18n'
import { Button } from './Button'

interface Props {
  title: string
  message: string
  onRetry?: () => void
}

/** Error box: orange outline (warning accent), says what happened, offers a retry. */
export function ErrorNotice({ title, message, onRetry }: Props) {
  return (
    <motion.div
      role="alert"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-3 rounded-2xl border border-orange/60 bg-paper p-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex min-w-0 items-start gap-3">
        <AlertTriangle size={18} className="mt-0.5 shrink-0 text-orange-strong" aria-hidden />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-ink">{title}</p>
          <p className="break-words text-sm text-muted">{message}</p>
        </div>
      </div>
      {onRetry && (
        <Button variant="outline" icon={<RotateCcw size={15} aria-hidden />} onClick={onRetry} className="shrink-0">
          {t.common.retry}
        </Button>
      )}
    </motion.div>
  )
}
