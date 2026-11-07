"""Vercel entry point: Vercel runs this file as a Python function and serves the FastAPI `app`.
All the real code is in backend/ (the same code you run locally with uvicorn)."""
import os
import sys

BACKEND_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "backend")
sys.path.insert(0, BACKEND_DIR)

from main import app  # noqa: E402  (the path must be set first)
