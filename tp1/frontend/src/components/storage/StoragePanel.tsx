import { AnimatePresence, motion } from 'framer-motion'
import { HardDriveDownload, Loader2, RotateCcw, Save } from 'lucide-react'
import { useState } from 'react'
import { t } from '../../i18n'
import type { useAction } from '../../hooks/useAction'
import { formatBytes } from '../../lib/format'
import type { SaveFormat, SaveResponse } from '../../types'
import { Button } from '../ui/Button'
import { ErrorNotice } from '../ui/ErrorNotice'
import { SectionCard } from '../ui/SectionCard'
import { DownloadControls } from './DownloadControls'
import { SuccessCheck } from './SuccessCheck'

interface Props {
  index: number
  /** True once the indexes are built. */
  ready: boolean
  /** True when the server runs on your PC: then it can also write in saved_indexes/. */
  local: boolean
  download: ReturnType<typeof useAction<[SaveFormat], string>>
  serverSave: ReturnType<typeof useAction<[SaveFormat], SaveResponse>>
}

export function StoragePanel({ index, ready, local, download, serverSave }: Props) {
  const [format, setFormat] = useState<SaveFormat>('json')
  const saving = serverSave.status === 'working'
  const saved = serverSave.status === 'done' ? serverSave.result : null

  return (
    <SectionCard id="storage" index={index} icon={HardDriveDownload} title={t.storage.title} description={t.storage.description}>
      <AnimatePresence mode="wait" initial={false}>
        {saved ? (
          <motion.div
            key="saved"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-4 rounded-2xl border border-blue/40 px-6 py-9 text-center"
            role="status"
          >
            <SuccessCheck />
            <div>
              <p className="text-lg font-semibold tracking-tight">{t.storage.successTitle}</p>
              <p className="mt-1 text-sm text-muted">{t.storage.successBody(saved.files, formatBytes(saved.size_bytes))}</p>
              <p className="mt-3 text-[13px] text-muted">
                {t.storage.savedTo}{' '}
                <code className="rounded-md border border-line px-1.5 py-0.5 font-mono text-xs text-ink">{saved.path}</code>
              </p>
            </div>
            <Button variant="outline" icon={<RotateCcw size={15} aria-hidden />} onClick={serverSave.reset}>
              {t.storage.saveAgain}
            </Button>
          </motion.div>
        ) : (
          <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-4">
            <DownloadControls format={format} onFormatChange={setFormat} ready={ready} download={download}>
              {local && (
                <Button
                  variant="outline"
                  onClick={() => void serverSave.run(format)}
                  disabled={!ready || saving}
                  icon={saving ? <Loader2 size={16} className="animate-spin" aria-hidden /> : <Save size={16} aria-hidden />}
                >
                  {saving ? t.storage.savingOnServer : t.storage.saveOnServer}
                </Button>
              )}
            </DownloadControls>
            {!local && <p className="text-[13px] text-muted">{t.storage.serverOnlyLocal}</p>}
            {serverSave.status === 'error' && (
              <ErrorNotice
                title={t.storage.errorTitle}
                message={serverSave.error ?? t.storage.errorFallback}
                onRetry={() => void serverSave.run(format)}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </SectionCard>
  )
}
