import { useEffect, useState } from 'react'
import { downloadIndexes, publishSettings, runIndexing, saveIndexes } from '../api'
import { DatasetPanel } from '../components/dataset/DatasetPanel'
import { DocumentsPanel } from '../components/documents/DocumentsPanel'
import { IndexingPanel } from '../components/indexing/IndexingPanel'
import { MobileNav } from '../components/layout/MobileNav'
import { PageHeader } from '../components/layout/PageHeader'
import { SECTION_IDS, type SectionId } from '../components/layout/sections'
import { Sidebar } from '../components/layout/Sidebar'
import { MetricsPanel } from '../components/metrics/MetricsPanel'
import { PipelineBuilder } from '../components/pipeline/PipelineBuilder'
import { PublishPanel } from '../components/publish/PublishPanel'
import { StoragePanel } from '../components/storage/StoragePanel'
import { useAction } from '../hooks/useAction'
import { useActiveSection } from '../hooks/useActiveSection'
import { useCappedCount } from '../hooks/useCappedCount'
import { useConfig } from '../hooks/useConfig'
import { useDatasets } from '../hooks/useDatasets'
import { useDocuments } from '../hooks/useDocuments'
import { useIndexing } from '../hooks/useIndexing'
import { usePipeline } from '../hooks/usePipeline'
import { usePublished } from '../hooks/usePublished'
import { t } from '../i18n'
import type { DatasetId, PublishRequest, RunRequest, SaveFormat } from '../types'

const DEFAULT_COUNT = 500
const FALLBACK_TOTAL = 19043 // shown until the server tells us the real total

/** The whole admin screen. It owns the state and passes it down to one panel per step. */
export function AdminPage() {
  const config = useConfig()
  const datasets = useDatasets()
  const [dataset, setDataset] = useState<DatasetId>('csv')
  const total = datasets.data?.[dataset].total || FALLBACK_TOTAL
  const cap = config?.max_documents_online ?? null
  const counter = useCappedCount(DEFAULT_COUNT, total, cap)

  const documents = useDocuments(dataset)
  const pipeline = usePipeline(dataset)
  const indexing = useIndexing()
  const published = usePublished()
  const active = useActiveSection(SECTION_IDS)

  // What was used for the last build: Download and Save must rebuild exactly the same thing.
  const [built, setBuilt] = useState<RunRequest | null>(null)
  const download = useAction((format: SaveFormat) => downloadIndexes({ ...built!, format }))
  const serverSave = useAction((format: SaveFormat) => saveIndexes({ ...built!, format }))
  const publish = useAction((request: PublishRequest) => publishSettings(request))

  const jobState = indexing.status.state
  const isBuilt = jobState === 'done' && built !== null
  const xmlMissing = dataset === 'xml' && datasets.data !== null && !datasets.data.xml.available

  // A new build makes any earlier download/save result out of date.
  useEffect(() => {
    if (jobState === 'running') {
      download.reset()
      serverSave.reset()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobState])

  const completed: Record<SectionId, boolean> = {
    dataset: datasets.data !== null && !xmlMissing,
    documents: documents.status === 'ready',
    pipeline: documents.status === 'ready' && pipeline.active.length > 0,
    indexing: isBuilt,
    metrics: indexing.metrics !== null,
    storage: download.status === 'done' || serverSave.status === 'done',
    publish: published.settings?.published_at != null,
  }

  const generate = () => {
    if (documents.loadedCount === null) return
    const request: RunRequest = { dataset, n_documents: documents.loadedCount, pipeline: pipeline.active }
    setBuilt(request)
    void indexing.start((onEvent) => runIndexing(request, onEvent))
  }

  return (
    <div className="min-h-screen bg-paper">
      <Sidebar active={active} completed={completed} />
      <MobileNav active={active} completed={completed} />
      <main className="px-4 pb-24 pt-8 sm:px-8 lg:ml-[248px] lg:px-12 lg:pt-12">
        <div className="mx-auto flex max-w-[1040px] flex-col gap-7">
          <PageHeader />
          <DatasetPanel index={1} value={dataset} onChange={setDataset} datasets={datasets} />
          <DocumentsPanel index={2} dataset={dataset} total={total} cap={cap} counter={counter} documents={documents} />
          <PipelineBuilder index={3} dataset={dataset} pipeline={pipeline} documentCount={documents.loadedCount} />
          <IndexingPanel
            index={4}
            indexing={indexing}
            documentCount={documents.loadedCount}
            stepCount={pipeline.active.length}
            blocked={xmlMissing ? t.indexing.xmlMissing : null}
            onGenerate={generate}
          />
          <MetricsPanel index={5} metrics={indexing.metrics} loading={indexing.status.measuring} />
          <StoragePanel index={6} ready={isBuilt} local={config?.local ?? false} download={download} serverSave={serverSave} />
          <PublishPanel
            index={7}
            dataset={dataset}
            pipeline={pipeline.active}
            total={total}
            cap={cap}
            blocked={xmlMissing ? t.publish.xmlMissing : null}
            published={published}
            publish={publish}
          />
        </div>
      </main>
    </div>
  )
}
