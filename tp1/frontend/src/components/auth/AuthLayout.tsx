import { motion } from 'framer-motion'
import { Layers } from 'lucide-react'
import type { ReactNode } from 'react'
import { t } from '../../i18n'

// A small inverted index made of Reuters vocabulary (the document numbers are only an illustration).
const POSTINGS: { term: string; docs: number[] }[] = [
  { term: 'cocoa', docs: [1, 18, 312, 1840] },
  { term: 'crude', docs: [64, 127, 902] },
  { term: 'dollar', docs: [5, 38, 215, 4471, 9012] },
  { term: 'tariff', docs: [96, 1263] },
  { term: 'wheat', docs: [23, 410, 2876] },
]

/** Split screen: the brand panel (an inverted index drawing itself) on the left, the form on the right. */
export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-screen bg-paper lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
      <aside className="relative hidden overflow-hidden bg-blue-strong text-white lg:flex lg:flex-col lg:justify-between lg:p-12 xl:p-16">
        <Brand light />

        <div className="max-w-[520px]">
          <h1 className="text-balance text-[34px] font-semibold leading-[1.15] tracking-tight xl:text-[40px]">{t.auth.panelTitle}</h1>
          <p className="mt-4 max-w-md text-[15px] text-white/75">{t.auth.panelBody}</p>

          <figure className="mt-10">
            <ul className="flex flex-col gap-2.5" aria-hidden>
              {POSTINGS.map(({ term, docs }, row) => (
                <li key={term} className="flex items-center gap-3">
                  <motion.span
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.25 + row * 0.12, duration: 0.4 }}
                    className="w-[74px] shrink-0 font-mono text-[14px] font-medium"
                  >
                    {term}
                  </motion.span>
                  <motion.span
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.4 + row * 0.12, duration: 0.35 }}
                    className="h-px w-8 shrink-0 origin-left bg-orange"
                  />
                  <span className="flex flex-wrap gap-1.5">
                    {docs.map((doc, i) => (
                      <motion.span
                        key={doc}
                        initial={{ opacity: 0, scale: 0.6 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.55 + row * 0.12 + i * 0.06, type: 'spring', stiffness: 500, damping: 26 }}
                        className="num rounded-md border border-white/30 px-2 py-0.5 font-mono text-[12px] text-white/90"
                      >
                        #{doc}
                      </motion.span>
                    ))}
                  </span>
                </li>
              ))}
            </ul>
            <figcaption className="mt-5 text-[13px] text-white/60">{t.auth.panelCaption}</figcaption>
          </figure>
        </div>

        <p className="text-xs text-white/50">Reuters-21578, Distribution 1.0</p>
      </aside>

      <main className="flex flex-col px-5 py-8 sm:px-10 lg:justify-center lg:px-16">
        <div className="lg:hidden">
          <Brand />
        </div>
        <div className="mx-auto mt-12 w-full max-w-[400px] lg:mt-0">{children}</div>
      </main>
    </div>
  )
}

function Brand({ light = false }: { light?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <span className={`grid h-9 w-9 place-items-center rounded-[10px] border-2 ${light ? 'border-white text-white' : 'border-blue text-blue'}`}>
        <Layers size={18} strokeWidth={2} aria-hidden />
      </span>
      <p className="text-[15px] font-semibold tracking-tight">{t.app.name}</p>
    </div>
  )
}
