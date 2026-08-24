"""ASGI entrypoint for hosting from repository root.

Some hosting platforms import a top-level module (for example, `asgi:app`).
This file ensures the repository root and backend directory are on `sys.path`
and exposes the FastAPI `app` object from `backend.app.main`.
"""
import os
import sys

ROOT = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.join(ROOT, "backend")

if ROOT not in sys.path:
    sys.path.insert(0, ROOT)
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

try:
    from backend.app.main import app  # noqa: E402,F401
except ModuleNotFoundError:
    from app.main import app  # noqa: E402,F401

