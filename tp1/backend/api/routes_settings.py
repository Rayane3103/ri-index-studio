from datetime import datetime, timezone

from fastapi import APIRouter, Depends

import store
from api.deps import require_admin, require_user
from api.rules import bad_request, check_dataset, check_pipeline
from api.schemas import AppConfig, PublishedSettings, PublishRequest
from config import LOCAL, MAX_DOCUMENTS_ONLINE

router = APIRouter()

# What users get before the admin publishes anything
DEFAULT_SETTINGS = {
    "dataset": "csv",
    "pipeline": ["normalize", "stopwords", "stem"],
    "max_documents_for_users": 500,
    "published_at": None,
}


def get_published():
    return store.get("published_settings") or DEFAULT_SETTINGS


@router.get("/config", response_model=AppConfig)
def get_config():
    return {"local": LOCAL, "max_documents_online": MAX_DOCUMENTS_ONLINE}


@router.get("/settings/published", response_model=PublishedSettings, dependencies=[Depends(require_user)])
def read_published():
    return get_published()


@router.post("/settings/publish", response_model=PublishedSettings, dependencies=[Depends(require_admin)])
def publish(request: PublishRequest):
    """The admin decides what the users will run: dataset, steps in order, max documents."""
    check_dataset(request.dataset)
    check_pipeline(request.dataset, request.pipeline)
    if MAX_DOCUMENTS_ONLINE is not None and request.max_documents_for_users > MAX_DOCUMENTS_ONLINE:
        bad_request(f"The online server allows at most {MAX_DOCUMENTS_ONLINE} documents.")

    settings = {**request.model_dump(), "published_at": datetime.now(timezone.utc).isoformat()}
    store.set("published_settings", settings)
    return settings
