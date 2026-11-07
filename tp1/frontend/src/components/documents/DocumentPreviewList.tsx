import { AnimatePresence, motion } from 'framer-motion'
import { t } from '../../i18n'
import type { DocumentSummary } from '../../types'
import { Skeleton } from '../ui/Skeleton'

interface Props {
  documents: DocumentSummary[]
  loading: boolean
}

/** Short list of the first documents, so the admin can check what was selected. */
export function DocumentPreviewList({ documents, loading }: Props) {
  const showSkeleton = loading && documents.length === 0
  return (
    <div>
      <p className="mb-2 text-sm font-medium">{t.documents.previewTitle}</p>
      <ul
        className="thin-scroll max-h-[260px] divide-y divide-line overflow-y-auto rounded-2xl border border-line"
        aria-busy={loading}
      >
        {showSkeleton &&
          Array.from({ length: 4 }, (_, i) => (
            <li key={i} className="flex flex-col gap-2 p-3.5">
              <Skeleton className="h-3.5 w-3/5" />
              <Skeleton className="h-3 w-full" />
            </li>
          ))}
        <AnimatePresence initial>
          {documents.map((doc, i) => (
            <motion.li
              key={doc.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: loading ? 0.5 : 1, x: 0 }}
              transition={{ delay: i * 0.04, duration: 0.35 }}
              className="flex gap-3 p-3.5"
            >
              <span className="num mt-0.5 w-9 shrink-0 font-mono text-xs text-muted">#{doc.id}</span>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{doc.title || t.documents.untitled}</p>
                <p className="line-clamp-1 text-[13px] text-muted">{doc.preview}</p>
              </div>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </div>
  )
}
