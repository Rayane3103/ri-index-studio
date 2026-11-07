// Shapes shared by the UI, the mocks and the API layer (this is the API contract).
// It mirrors backend/api/schemas.py.

export type ModelId = 'bow' | 'f' | 'tf' | 'tfidf'
export type StructureId = 'doc_term_matrix' | 'term_doc_matrix' | 'inverted_index'
export type StepId = 'tag_cleaning' | 'normalize' | 'stopwords' | 'stem' | 'lemmatize'
export type SaveFormat = 'json' | 'text' | 'binary'
export type DatasetId = 'csv' | 'xml'
export type Role = 'admin' | 'user'

export const MODEL_IDS: ModelId[] = ['bow', 'f', 'tf', 'tfidf']
export const STRUCTURE_IDS: StructureId[] = ['doc_term_matrix', 'term_doc_matrix', 'inverted_index']

/** GET /api/config (no login needed) */
export interface AppConfig {
  /** True when the server runs on your PC (not on Vercel). */
  local: boolean
  /** The online document cap. null = no cap. */
  max_documents_online: number | null
}

/** POST /api/auth/login, GET /api/auth/me */
export interface Account {
  email: string
  name: string
  role: Role
}
export interface LoginResponse {
  token: string
  user: Account
}

/** POST /api/auth/forgot (demo mode: the code is sent back instead of being emailed) */
export interface ForgotResponse {
  demo_code: string
  expires_in: number
}

/** GET /api/datasets */
export interface DatasetInfo {
  available: boolean
  total: number
}
export type DatasetsResponse = Record<DatasetId, DatasetInfo>

/** GET /api/documents?dataset=csv&limit=N */
export interface DocumentSummary {
  id: number
  title: string
  preview: string
}
export interface DocumentsResponse {
  total_available: number
  selected: number
  /** A short preview of the selected documents (the first few only). */
  documents: DocumentSummary[]
}

/** POST /api/pipeline/preview: run the pipeline on one document and see the text after each step. */
export interface PreviewRequest {
  dataset: DatasetId
  pipeline: StepId[]
  /** A random document is picked among the first N loaded documents. */
  n_documents: number
  /** Inspect this specific document instead of a random one. */
  doc_id?: number | null
}
export interface PreviewStep {
  step: StepId
  /** The whole text after this step. */
  text: string
}
export interface PreviewResponse {
  doc_id: number
  title: string
  raw_text: string
  steps: PreviewStep[]
  tokens: string[]
}

/** POST /api/indexing/run (admin). The answer is a stream of IndexingEvent, one JSON per line. */
export interface RunRequest {
  dataset: DatasetId
  n_documents: number
  pipeline: StepId[]
}
/** POST /api/indexes/download and /api/storage/save (admin) */
export interface DownloadRequest extends RunRequest {
  format: SaveFormat
}

/** POST /api/user/run, /api/user/download: the server uses the published settings. */
export interface UserRunRequest {
  n_documents: number
}
export interface UserDownloadRequest extends UserRunRequest {
  format: SaveFormat
}

/** One line of the indexing stream. */
export type IndexingEvent =
  | { type: 'progress'; model: ModelId; structure: StructureId; percent: number }
  | { type: 'measuring' }
  | { type: 'done'; metrics: Metrics }
  | { type: 'error'; message: string }

/** The progress shown by the UI, rebuilt from the stream. */
export type JobState = 'idle' | 'running' | 'done' | 'error'
export interface StructureProgress {
  percent: number // 0..100
}
export interface IndexingStatus {
  state: JobState
  percent: number // overall, 0..100
  models: Record<ModelId, Record<StructureId, StructureProgress>>
  /** True between "all built" and "metrics ready" (measuring memory takes a few seconds). */
  measuring: boolean
  error?: string
}

/** The "done" line of the stream (all memory values are in bytes) */
export interface Metrics {
  vocabulary_size: number
  documents_indexed: number
  memory: Record<ModelId, Record<StructureId, number>>
}

/** POST /api/storage/save (only on your PC) */
export interface SaveResponse {
  format: SaveFormat
  path: string
  files: number
  size_bytes: number
}

/** GET /api/settings/published, POST /api/settings/publish (admin) */
export interface PublishRequest {
  dataset: DatasetId
  pipeline: StepId[]
  max_documents_for_users: number
}
export interface PublishedSettings extends PublishRequest {
  /** ISO date. null = the default settings, never published. */
  published_at: string | null
}
