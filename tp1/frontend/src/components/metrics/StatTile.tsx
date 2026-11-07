import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import { AnimatedNumber } from '../ui/AnimatedNumber'

interface Props {
  icon: LucideIcon
  label: string
  value: number
  unit: string
  format?: (n: number) => string
  index: number
}

/** One headline number that counts up when it appears. */
export function StatTile({ icon: Icon, label, value, unit, format, index }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.07 * index, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="min-w-0 rounded-2xl border border-line p-4 sm:p-5"
    >
      <div className="flex items-center gap-2 text-sm text-muted">
        <Icon size={16} strokeWidth={1.8} className="text-blue" aria-hidden />
        {label}
      </div>
      <p className="mt-3 truncate text-[30px] font-semibold leading-none tracking-tight">
        <AnimatedNumber value={value} format={format} />
      </p>
      <p className="mt-1.5 text-[13px] text-muted">{unit}</p>
    </motion.div>
  )
}
