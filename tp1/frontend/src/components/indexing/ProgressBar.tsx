import { motion } from 'framer-motion'

interface Props {
  percent: number
  label: string
  /** Thin bars (3px) are used inside cards, thick (6px) for the overall bar. */
  size?: 'thin' | 'thick'
}

/** Animated bar. Orange while it is filling, blue once it reaches 100%. */
export function ProgressBar({ percent, label, size = 'thin' }: Props) {
  const complete = percent >= 100
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(percent)}
      className={`w-full overflow-hidden rounded-full bg-line/70 ${size === 'thick' ? 'h-1.5' : 'h-[3px]'}`}
    >
      <motion.div
        className={`h-full rounded-full ${complete ? 'bg-blue' : 'bg-orange'}`}
        initial={false}
        animate={{ width: `${percent}%` }}
        transition={{ type: 'spring', stiffness: 120, damping: 24 }}
      />
    </div>
  )
}
