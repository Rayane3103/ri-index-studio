import { motion } from 'framer-motion'

/** Circle + check mark that draw themselves, with a soft orange ring that pulses out once. */
export function SuccessCheck() {
  return (
    <div className="relative grid h-16 w-16 place-items-center" aria-hidden>
      <motion.span
        className="absolute inset-0 rounded-full border-2 border-orange"
        initial={{ scale: 0.8, opacity: 0.9 }}
        animate={{ scale: 1.7, opacity: 0 }}
        transition={{ duration: 1, ease: 'easeOut', delay: 0.35 }}
      />
      <svg viewBox="0 0 64 64" className="h-16 w-16 text-blue">
        <motion.circle
          cx="32"
          cy="32"
          r="29"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
        />
        <motion.path
          d="M20 33 L28 41 L44 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.4, ease: 'easeOut', delay: 0.5 }}
        />
      </svg>
    </div>
  )
}
