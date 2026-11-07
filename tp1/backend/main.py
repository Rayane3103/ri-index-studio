"""Starts the server. Run from the backend folder:  uvicorn main:app --reload --port 8000
On Vercel, tp1/api/index.py imports this same `app`."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.routes_auth import router as auth_router
from api.routes_documents import router as documents_router
from api.routes_indexing import router as indexing_router
from api.routes_pipeline import router as pipeline_router
from api.routes_settings import router as settings_router
from api.routes_storage import router as storage_router
from api.routes_user import router as user_router

app = FastAPI(title="RI - Indexing API")

# In dev the React app runs on another port, so the browser needs this permission.
# (Online, the frontend and the API are on the same domain, so this is not used.)
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1):\d+",  # the frontend, on any local port (5173, 5174...)
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Disposition"],
)

# Every route starts with /api (the same path locally and on Vercel)
for router in (auth_router, settings_router, documents_router, pipeline_router,
               indexing_router, storage_router, user_router):
    app.include_router(router, prefix="/api")
