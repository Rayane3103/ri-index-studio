"""The user only chooses how many documents. Everything else comes from the settings the admin published."""
from fastapi import APIRouter, Depends, Response
from fastapi.responses import StreamingResponse

from api.build import build_zip, prepare, stream_build, zip_filename
from api.deps import require_user
from api.rules import bad_request
from api.routes_settings import get_published
from api.schemas import UserDownloadRequest, UserRunRequest

router = APIRouter(prefix="/user", dependencies=[Depends(require_user)])


def prepare_for_user(n_documents):
    settings = get_published()
    if n_documents > settings["max_documents_for_users"]:
        bad_request(f"The admin allows at most {settings['max_documents_for_users']} documents.")
    return settings, prepare(settings["dataset"], n_documents, settings["pipeline"])


@router.post("/run")
def run(request: UserRunRequest):
    _, (docs_tokens, doc_ids) = prepare_for_user(request.n_documents)
    return StreamingResponse(stream_build(docs_tokens, doc_ids), media_type="application/x-ndjson")


@router.post("/download")
def download(request: UserDownloadRequest):
    settings, (docs_tokens, doc_ids) = prepare_for_user(request.n_documents)
    content = build_zip(request.format, docs_tokens, doc_ids, settings["pipeline"], settings["dataset"])
    name = zip_filename(request.format, settings["dataset"], len(doc_ids))
    return Response(content, media_type="application/zip",
                    headers={"Content-Disposition": f'attachment; filename="{name}"'})
