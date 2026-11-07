import { Gauge } from 'lucide-react'
import { t } from '../../i18n'
import type { Metrics } from '../../types'
import { EmptyState } from '../ui/EmptyState'
import { SectionCard } from '../ui/SectionCard'
import { MetricsView, MetricsSkeleton } from './MetricsView'

interface Props {
  index: number
  metrics: Metrics | null
  /** True while the server measures the memory (after the build, before the metrics arrive). */
  loading: boolean
}

export function MetricsPanel({ index, metrics, loading }: Props) {
  return (
    <SectionCard id="metrics" index={index} icon={Gauge} title={t.metrics.title} description={t.metrics.description}>
      {metrics ? (
        <MetricsView metrics={metrics} />
      ) : loading ? (
        <MetricsSkeleton />
      ) : (
        <EmptyState icon={Gauge} title={t.metrics.emptyTitle} body={t.metrics.emptyBody} />
      )}
    </SectionCard>
  )
}
