from fastapi import APIRouter, Depends, Query

from api.deps import require_admin
from api.rules import check_dataset
from api.schemas import DatasetId, DatasetsResponse, DocumentsResponse
from api.state import get_all_documents, xml_available

router = APIRouter(dependencies=[Depends(require_admin)])


@router.get("/datasets", response_model=DatasetsResponse)
def list_datasets():
    """Which datasets can be used, and how many documents each one has."""
    has_xml = xml_available()
    return {
        "csv": {"available": True, "total": len(get_all_documents("csv"))},
        "xml": {"available": has_xml, "total": len(get_all_documents("xml")) if has_xml else 0},
    }


@router.get("/documents", response_model=DocumentsResponse)
def list_documents(limit: int = Query(500, ge=1), dataset: DatasetId = "csv"):
    """Choose the first N documents. Only a short preview of the first 8 is sent back."""
    check_dataset(dataset)
    all_documents = get_all_documents(dataset)
    selected = all_documents[:limit]
    preview = [
        {"id": doc["id"], "title": doc["title"], "preview": " ".join(doc["text"].split())[:160]}
        for doc in selected[:8]
    ]
    return {"total_available": len(all_documents), "selected": len(selected), "documents": preview}
