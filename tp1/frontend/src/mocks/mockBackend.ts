// A fake backend that lives in the browser. It answers like the real API.
// Force errors for demos: add ?mock=error (indexing fails) or ?mock=save-error (saving fails) to the page URL.
// Login: any password works; an email that starts with "admin" logs in as the admin.
import { readSession } from '../auth/session'
import type {
  Account,
  AppConfig,
  DatasetsResponse,
  DocumentsResponse,
  ForgotResponse,
  IndexingEvent,
  LoginResponse,
  PreviewRequest,
  PreviewResponse,
  PublishedSettings,
  PublishRequest,
  SaveFormat,
  SaveResponse,
  StepId,
} from '../types'
import { MODEL_IDS, STRUCTURE_IDS } from '../types'
import { TOTAL_DOCUMENTS, fakeDocument, fakeDocuments } from './documents'
import { buildFakeMetrics } from './metrics'

export const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))
const mockFlag = () => new URLSearchParams(window.location.search).get('mock')

let published: PublishedSettings = {
  dataset: 'csv',
  pipeline: ['normalize', 'stopwords', 'stem'],
  max_documents_for_users: 500,
  published_at: null,
}

export async function getConfig(): Promise<AppConfig> {
  return { local: true, max_documents_online: 1500 }
}

export async function login(email: string): Promise<LoginResponse> {
  await wait(500)
  const role = email.trim().toLowerCase().startsWith('admin') ? 'admin' : 'user'
  return { token: 'mock-token', user: { email, name: role === 'admin' ? 'Admin' : 'Guest user', role } }
}

export async function getMe(): Promise<Account> {
  const session = readSession()
  if (!session) throw new Error('Please log in.')
  return session.user
}

export async function forgotPassword(): Promise<ForgotResponse> {
  await wait(500)
  return { demo_code: '424242', expires_in: 600 }
}

export async function getDatasets(): Promise<DatasetsResponse> {
  await wait(300)
  return { csv: { available: true, total: 19043 }, xml: { available: true, total: TOTAL_DOCUMENTS } }
}

export async function getDocuments(limit: number): Promise<DocumentsResponse> {
  await wait(650)
  const selected = Math.min(Math.max(limit, 1), TOTAL_DOCUMENTS)
  return { total_available: TOTAL_DOCUMENTS, selected, documents: fakeDocuments(Math.min(selected, 8)) }
}

/** Rough JavaScript versions of the real steps, only to make the demo mode look alive. */
const MOCK_STEPS: Record<StepId, (text: string) => string> = {
  tag_cleaning: (text) => text.replace(/<[^>]*>/g, ' '),
  normalize: (text) => text.toLowerCase().replace(/[^a-z\s]/g, ' ').replace(/\s+/g, ' ').trim(),
  stopwords: (text) => text.split(/\s+/).filter((w) => !['the', 'a', 'of', 'in', 'to', 'and', 'on', 'as', 'for'].includes(w)).join(' '),
  stem: (text) => text.split(/\s+/).map((w) => w.replace(/(ing|ed|es|s)$/, '')).join(' '),
  lemmatize: (text) => text.split(/\s+/).map((w) => w.replace(/s$/, '')).join(' '),
}

export async function previewPipeline(request: PreviewRequest): Promise<PreviewResponse> {
  await wait(350)
  const id = request.doc_id ?? 1 + Math.floor(Math.random() * request.n_documents)
  const doc = fakeDocument(id)
  const raw = `<BODY>${doc.title}\n${doc.preview} Prices rose 2.5 pct on Monday.</BODY>`
  let text = raw
  const steps = request.pipeline.map((step) => {
    text = MOCK_STEPS[step](text)
    return { step, text }
  })
  return { doc_id: id, title: doc.title, raw_text: raw, steps, tokens: text.split(/\s+/).filter(Boolean) }
}

/** Sends the 12 "structure built" events one after another, then the metrics. */
export async function runIndexing(nDocs: number, pipeline: StepId[] | null, onEvent: (event: IndexingEvent) => void) {
  await wait(300)
  const steps = pipeline ?? published.pipeline
  const failAt = mockFlag() === 'error' ? 5 : -1
  const pause = 300 + Math.min(nDocs, 5000) * 0.15
  let count = 0
  for (const model of MODEL_IDS) {
    for (const structure of STRUCTURE_IDS) {
      await wait(pause)
      if (count === failAt) {
        onEvent({ type: 'error', message: 'Out of memory while building the indexes. Try fewer documents.' })
        return
      }
      count += 1
      onEvent({ type: 'progress', model, structure, percent: Math.round((100 * count) / 12) })
    }
  }
  onEvent({ type: 'measuring' })
  await wait(900)
  onEvent({ type: 'done', metrics: buildFakeMetrics(nDocs, steps) })
}

export async function downloadFile(format: SaveFormat): Promise<string> {
  await wait(1500)
  if (mockFlag() === 'save-error') throw new Error('The server could not build the file.')
  return `indexes_csv_500docs_${format}.zip`
}

export async function saveIndexes(format: SaveFormat): Promise<SaveResponse> {
  await wait(1500)
  if (mockFlag() === 'save-error') throw new Error('Permission denied: cannot write to saved_indexes/.')
  return { format, path: `saved_indexes/${format}/`, files: 14, size_bytes: 18_400_000 }
}

export async function getPublished(): Promise<PublishedSettings> {
  await wait(300)
  return published
}

export async function publish(request: PublishRequest): Promise<PublishedSettings> {
  await wait(700)
  published = { ...request, published_at: new Date().toISOString() }
  return published
}
