import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, Download, Loader2 } from 'lucide-react'
import type { ReactNode } from 'react'
import { t } from '../../i18n'
import type { useAction } from '../../hooks/useAction'
import type { SaveFormat } from '../../types'
import { Button } from '../ui/Button'
import { ErrorNotice } from '../ui/ErrorNotice'
import { FormatPicker } from './FormatPicker'

interface Props {
  format: SaveFormat
  onFormatChange: (format: SaveFormat) => void
  /** False until the indexes are built. */
  ready: boolean
  download: ReturnType<typeof useAction<[SaveFormat], string>>
  /** Extra buttons next to Download (the admin's "Save on server disk"). */
  children?: ReactNode
}

/** Pick a format, then download the .zip. Shows what is happening while the server prepares the file. */
export function DownloadControls({ format, onFormatChange, ready, download, children }: Props) {
  const working = download.status === 'working'
  return (
    <div className="flex flex-col gap-6">
      <FormatPicker value={format} onChange={onFormatChange} disabled={!ready || working} />
      {download.status === 'error' && (
        <ErrorNotice title={t.storage.downloadErrorTitle} message={download.error ?? ''} onRetry={() => void download.run(format)} />
      )}
      <div className="flex flex-wrap items-center gap-3">
        <Button
          onClick={() => void download.run(format)}
          disabled={!ready || working}
          icon={working ? <Loader2 size={16} className="animate-spin" aria-hidden /> : <Download size={16} aria-hidden />}
        >
          {working ? t.storage.downloading : t.storage.download}
        </Button>
        {children}
        {!ready && <p className="text-sm text-muted">{t.storage.disabled}</p>}
      </div>
      <AnimatePresence mode="wait" initial={false}>
        {working && (
          <motion.p key="working" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="-mt-3 text-[13px] text-muted">
            {t.storage.downloadingHint}
          </motion.p>
        )}
        {download.status === 'done' && download.result && (
          <motion.p
            key="done"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            role="status"
            className="-mt-3 flex items-center gap-1.5 text-[13px] font-medium text-good"
          >
            <CheckCircle2 size={15} aria-hidden />
            <span className="break-all">{t.storage.downloaded(download.result)}</span>
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}
