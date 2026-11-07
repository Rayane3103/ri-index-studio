import { AnimatePresence, motion } from 'framer-motion'
import { ServerCrash } from 'lucide-react'

/** The red message shown when someone tries to choose more documents than the online server can take. */
export function CapMessage({ show, text }: { show: boolean; text: string }) {
  return (
    <AnimatePresence initial={false}>
      {show && (
        <motion.p
          role="alert"
          initial={{ opacity: 0, height: 0, x: 0 }}
          animate={{ opacity: 1, height: 'auto', x: [0, -5, 5, -3, 3, 0] }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.35 }}
          className="overflow-hidden"
        >
          <span className="mt-3 flex items-start gap-2.5 rounded-xl border border-bad/40 bg-bad-soft px-3.5 py-2.5 text-[13px] font-medium text-bad">
            <ServerCrash size={15} className="mt-0.5 shrink-0" aria-hidden />
            {text}
          </span>
        </motion.p>
      )}
    </AnimatePresence>
  )
}
