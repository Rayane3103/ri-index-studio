import random

from fastapi import APIRouter, Depends, HTTPException

from api.deps import require_admin
from api.rules import check_dataset
from api.schemas import PreviewRequest, PreviewResponse
from api.state import get_all_documents
from nlp.pipeline import tokenize, trace_pipeline

router = APIRouter(dependencies=[Depends(require_admin)])


@router.post("/pipeline/preview", response_model=PreviewResponse)
def preview_pipeline(request: PreviewRequest):
    """Run the chosen pipeline on ONE document and return the text after every step."""
    check_dataset(request.dataset)
    documents = get_all_documents(request.dataset)

    if request.doc_id is not None:
        found = [doc for doc in documents if doc["id"] == request.doc_id]
        if not found:
            raise HTTPException(status_code=404, detail=f"Document {request.doc_id} was not found or has no text.")
        document = found[0]
    else:
        document = random.choice(documents[:request.n_documents])

    steps = trace_pipeline(document["text"], request.pipeline)
    final_text = steps[-1]["text"] if steps else document["text"]
    return {
        "doc_id": document["id"],
        "title": document["title"],
        "raw_text": document["text"],
        "steps": steps,
        "tokens": tokenize(final_text),
    }
