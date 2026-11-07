// The only file that talks to the backend. Components call these functions and never use fetch directly.
// Contract: see ./README.md
import { readSession } from '../auth/session'
import * as mock from '../mocks/mockBackend'
import type {
  Account,
  AppConfig,
  DatasetId,
  DatasetsResponse,
  DocumentsResponse,
  DownloadRequest,
  ForgotResponse,
  IndexingEvent,
  LoginResponse,
  PreviewRequest,
  PreviewResponse,
  PublishedSettings,
  PublishRequest,
  RunRequest,
  SaveResponse,
  UserDownloadRequest,
  UserRunRequest,
} from '../types'

/** Single switch: true = fake data from src/mocks, false = real backend. Set it in .env */
export const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true'
/** "/api" works locally (Vite forwards it to the backend) and online (same domain on Vercel). */
const BASE_URL = (import.meta.env.VITE_API_URL as string | undefined) || '/api'

/** Called when the server says the login is no longer valid (the auth context logs out). */
let onUnauthorized: () => void = () => {}
export const setUnauthorizedHandler = (handler: () => void) => (onUnauthorized = handler)

/** The backend (FastAPI) sends errors as {"detail": "message"}. Show just the message when we can. */
async function readErrorMessage(response: Response): Promise<string> {
  const body = await response.text().catch(() => '')
  try {
    const detail = (JSON.parse(body) as { detail?: unknown }).detail
    if (typeof detail === 'string') return detail
  } catch {
    // not JSON, use the raw text below
  }
  if (response.status === 504) return 'The server took too long. Try with fewer documents.'
  return body || `The server answered with an error (${response.status}).`
}

async function send(path: string, init?: RequestInit): Promise<Response> {
  const token = readSession()?.token
  let response: Response
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })
  } catch {
    throw new Error('Cannot reach the server. Check your connection, or start the backend.')
  }
  if (!response.ok) {
    if (response.status === 401 && token) onUnauthorized()
    throw new Error(await readErrorMessage(response))
  }
  return response
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await send(path, init)
  return response.status === 204 ? (undefined as T) : ((await response.json()) as T)
}

const post = <T>(path: string, body: unknown) => request<T>(path, { method: 'POST', body: JSON.stringify(body) })

/** Reads the indexing answer line by line and calls onEvent for each line, as soon as it arrives. */
async function stream(path: string, body: unknown, onEvent: (event: IndexingEvent) => void): Promise<void> {
  const response = await send(path, { method: 'POST', body: JSON.stringify(body) })
  if (!response.body) throw new Error('This browser cannot read the progress stream.')
  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  for (;;) {
    const { done, value } = await reader.read()
    buffer += decoder.decode(value, { stream: !done })
    const lines = buffer.split('\n')
    buffer = lines.pop() ?? ''
    lines.filter(Boolean).forEach((line) => onEvent(JSON.parse(line) as IndexingEvent))
    if (done) break
  }
  if (buffer.trim()) onEvent(JSON.parse(buffer) as IndexingEvent)
}

/** Asks for a .zip and makes the browser save it. Returns the file name. */
async function download(path: string, body: unknown): Promise<string> {
  const response = await send(path, { method: 'POST', body: JSON.stringify(body) })
  const disposition = response.headers.get('Content-Disposition') ?? ''
  const name = disposition.split('filename="')[1]?.split('"')[0] ?? 'indexes.zip'
  const url = URL.createObjectURL(await response.blob())
  const link = document.createElement('a')
  link.href = url
  link.download = name
  document.body.appendChild(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
  return name
}

// ---------- config + auth ----------

export const getConfig = (): Promise<AppConfig> => (USE_MOCKS ? mock.getConfig() : request('/config'))

export const login = (email: string, password: string): Promise<LoginResponse> =>
  USE_MOCKS ? mock.login(email) : post('/auth/login', { email, password })

export const getMe = (): Promise<Account> => (USE_MOCKS ? mock.getMe() : request('/auth/me'))

export const forgotPassword = (email: string): Promise<ForgotResponse> =>
  USE_MOCKS ? mock.forgotPassword() : post('/auth/forgot', { email })

export const resetPassword = (email: string, code: string, newPassword: string): Promise<void> =>
  USE_MOCKS ? mock.wait(600) : post('/auth/reset', { email, code, new_password: newPassword })

// ---------- admin ----------

export const getDatasets = (): Promise<DatasetsResponse> => (USE_MOCKS ? mock.getDatasets() : request('/datasets'))

export const getDocuments = (dataset: DatasetId, limit: number): Promise<DocumentsResponse> =>
  USE_MOCKS ? mock.getDocuments(limit) : request(`/documents?dataset=${dataset}&limit=${limit}`)

export const previewPipeline = (body: PreviewRequest): Promise<PreviewResponse> =>
  USE_MOCKS ? mock.previewPipeline(body) : post('/pipeline/preview', body)

export const runIndexing = (body: RunRequest, onEvent: (event: IndexingEvent) => void): Promise<void> =>
  USE_MOCKS ? mock.runIndexing(body.n_documents, body.pipeline, onEvent) : stream('/indexing/run', body, onEvent)

export const downloadIndexes = (body: DownloadRequest): Promise<string> =>
  USE_MOCKS ? mock.downloadFile(body.format) : download('/indexes/download', body)

export const saveIndexes = (body: DownloadRequest): Promise<SaveResponse> =>
  USE_MOCKS ? mock.saveIndexes(body.format) : post('/storage/save', body)

export const publishSettings = (body: PublishRequest): Promise<PublishedSettings> =>
  USE_MOCKS ? mock.publish(body) : post('/settings/publish', body)

// ---------- user (and admin) ----------

export const getPublishedSettings = (): Promise<PublishedSettings> =>
  USE_MOCKS ? mock.getPublished() : request('/settings/published')

export const runUserIndexing = (body: UserRunRequest, onEvent: (event: IndexingEvent) => void): Promise<void> =>
  USE_MOCKS ? mock.runIndexing(body.n_documents, null, onEvent) : stream('/user/run', body, onEvent)

export const downloadUserIndexes = (body: UserDownloadRequest): Promise<string> =>
  USE_MOCKS ? mock.downloadFile(body.format) : download('/user/download', body)
