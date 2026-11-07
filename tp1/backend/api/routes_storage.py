import os

from fastapi import APIRouter, Depends, HTTPException

from api.build import prepare, save_to_folder
from api.deps import require_admin
from api.schemas import DownloadRequest, SaveResponse
from config import LOCAL, SAVED_INDEXES_DIR

router = APIRouter(dependencies=[Depends(require_admin)])


@router.post("/storage/save", response_model=SaveResponse)
def save(request: DownloadRequest):
    """Write the indexes in saved_indexes/<format>/ (only on your PC: the online disk is not kept)."""
    if not LOCAL:
        raise HTTPException(status_code=400, detail="Saving on the server disk only works on your PC. Use Download.")

    docs_tokens, doc_ids = prepare(request.dataset, request.n_documents, request.pipeline)
    folder = os.path.join(SAVED_INDEXES_DIR, request.format)
    try:
        saved = save_to_folder(folder, request.format, docs_tokens, doc_ids, request.pipeline, request.dataset)
    except OSError as error:
        raise HTTPException(status_code=500, detail=f"Cannot write to saved_indexes/: {error.strerror}")

    return {"format": request.format, "path": f"saved_indexes/{request.format}/", **saved}
