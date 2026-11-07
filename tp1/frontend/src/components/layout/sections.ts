import { Database, FileText, Gauge, HardDriveDownload, Layers3, Send, Workflow, type LucideIcon } from 'lucide-react'
import { t } from '../../i18n'

export type SectionId = 'dataset' | 'documents' | 'pipeline' | 'indexing' | 'metrics' | 'storage' | 'publish'

export const SECTIONS: { id: SectionId; label: string; icon: LucideIcon }[] = [
  { id: 'dataset', label: t.nav.dataset, icon: Layers3 },
  { id: 'documents', label: t.nav.documents, icon: FileText },
  { id: 'pipeline', label: t.nav.pipeline, icon: Workflow },
  { id: 'indexing', label: t.nav.indexing, icon: Database },
  { id: 'metrics', label: t.nav.metrics, icon: Gauge },
  { id: 'storage', label: t.nav.storage, icon: HardDriveDownload },
  { id: 'publish', label: t.nav.publish, icon: Send },
]

export const SECTION_IDS = SECTIONS.map((s) => s.id)
