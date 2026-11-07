from fastapi import APIRouter, Depends, Response
from fastapi.responses import StreamingResponse

from api.build import build_zip, prepare, stream_build, zip_filename
from api.deps import require_admin
from api.schemas import DownloadRequest, RunRequest

router = APIRouter(dependencies=[Depends(require_admin)])


@router.post("/indexing/run")
def run_indexing(request: RunRequest):
    """Build the 4 models x 3 structures and stream the progress, then the metrics (one JSON per line)."""
    docs_tokens, doc_ids = prepare(request.dataset, request.n_documents, request.pipeline)
    return StreamingResponse(stream_build(docs_tokens, doc_ids), media_type="application/x-ndjson")


@router.post("/indexes/download")
def download_indexes(request: DownloadRequest):
    docs_tokens, doc_ids = prepare(request.dataset, request.n_documents, request.pipeline)
    content = build_zip(request.format, docs_tokens, doc_ids, request.pipeline, request.dataset)
    name = zip_filename(request.format, request.dataset, len(doc_ids))
    return Response(content, media_type="application/zip",
                    headers={"Content-Disposition": f'attachment; filename="{name}"'})
