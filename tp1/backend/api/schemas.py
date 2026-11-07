"""The API contract: the exact shape of what the frontend sends and receives.
It mirrors frontend/src/types/index.ts and frontend/src/api/README.md."""
from typing import Literal

from pydantic import BaseModel, Field

StepId = Literal["tag_cleaning", "normalize", "stopwords", "stem", "lemmatize"]
ModelId = Literal["bow", "f", "tf", "tfidf"]
StructureId = Literal["doc_term_matrix", "term_doc_matrix", "inverted_index"]
SaveFormat = Literal["json", "text", "binary"]
DatasetId = Literal["csv", "xml"]
Role = Literal["admin", "user"]


# GET /api/config
class AppConfig(BaseModel):
    local: bool  # running on your PC (not on Vercel)
    max_documents_online: int | None  # None = no limit


# POST /api/auth/login, GET /api/auth/me
class LoginRequest(BaseModel):
    email: str
    password: str


class Account(BaseModel):
    email: str
    name: str
    role: Role


class LoginResponse(BaseModel):
    token: str
    user: Account


# POST /api/auth/forgot, POST /api/auth/reset
class ForgotRequest(BaseModel):
    email: str


class ForgotResponse(BaseModel):
    demo_code: str  # demo mode: the code is shown on screen instead of being emailed
    expires_in: int  # seconds


class ResetRequest(BaseModel):
    email: str
    code: str
    new_password: str


# GET /api/datasets
class DatasetInfo(BaseModel):
    available: bool
    total: int


class DatasetsResponse(BaseModel):
    csv: DatasetInfo
    xml: DatasetInfo


# GET /api/documents
class DocumentSummary(BaseModel):
    id: int
    title: str
    preview: str


class DocumentsResponse(BaseModel):
    total_available: int
    selected: int
    documents: list[DocumentSummary]


# POST /api/pipeline/preview
class PreviewRequest(BaseModel):
    dataset: DatasetId = "csv"
    pipeline: list[StepId]
    n_documents: int = Field(ge=1)  # a random document is picked among the first N
    doc_id: int | None = None  # a specific document (if None, a random one)


class StepResult(BaseModel):
    step: StepId
    text: str


class PreviewResponse(BaseModel):
    doc_id: int
    title: str
    raw_text: str
    steps: list[StepResult]
    tokens: list[str]


# POST /api/indexing/run (admin) -> a stream of JSON lines, see api/build.py
class RunRequest(BaseModel):
    dataset: DatasetId
    n_documents: int = Field(ge=1)
    pipeline: list[StepId]


# POST /api/indexes/download (admin) -> a .zip file
class DownloadRequest(RunRequest):
    format: SaveFormat


# The "done" line of the stream
class Metrics(BaseModel):
    vocabulary_size: int
    documents_indexed: int
    memory: dict[ModelId, dict[StructureId, int]]


# POST /api/storage/save (admin, only on your PC)
class SaveResponse(BaseModel):
    format: SaveFormat
    path: str
    files: int
    size_bytes: int


# GET /api/settings/published, POST /api/settings/publish (admin)
class PublishRequest(BaseModel):
    dataset: DatasetId
    pipeline: list[StepId]
    max_documents_for_users: int = Field(ge=1)


class PublishedSettings(PublishRequest):
    published_at: str | None  # ISO date, None = the default settings (never published)


# POST /api/user/run, POST /api/user/download (the server uses the published settings)
class UserRunRequest(BaseModel):
    n_documents: int = Field(ge=1)


class UserDownloadRequest(UserRunRequest):
    format: SaveFormat
