import { BookText, FileStack, MemoryStick } from 'lucide-react'
import { t } from '../../i18n'
import { formatBytes } from '../../lib/format'
import type { Metrics } from '../../types'
import { Skeleton } from '../ui/Skeleton'
import { MemoryChart } from './MemoryChart'
import { MemoryTable } from './MemoryTable'
import { StatTile } from './StatTile'

/** The three numbers, the chart and the table. Shared by the admin Metrics step and the user results. */
export function MetricsView({ metrics, showTable = true }: { metrics: Metrics; showTable?: boolean }) {
  const totalBytes = Object.values(metrics.memory).reduce((sum, row) => sum + Object.values(row).reduce((a, b) => a + b, 0), 0)
  return (
    <div className="flex flex-col gap-9">
      <div className="grid gap-3.5 sm:grid-cols-3">
        <StatTile index={0} icon={BookText} label={t.metrics.vocabulary} value={metrics.vocabulary_size} unit={t.metrics.vocabularyUnit} />
        <StatTile index={1} icon={FileStack} label={t.metrics.documents} value={metrics.documents_indexed} unit={t.metrics.documentsUnit} />
        <StatTile index={2} icon={MemoryStick} label={t.metrics.totalMemory} value={totalBytes} unit={t.metrics.totalUnit} format={formatBytes} />
      </div>
      <MemoryChart metrics={metrics} />
      {showTable && <MemoryTable metrics={metrics} />}
    </div>
  )
}

export function MetricsSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-busy aria-label={t.indexing.measuring}>
      <div className="grid gap-3.5 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-[116px] rounded-2xl" />
        ))}
      </div>
      <Skeleton className="h-64 rounded-2xl" />
    </div>
  )
}
