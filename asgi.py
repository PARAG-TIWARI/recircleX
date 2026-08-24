"""ASGI entrypoint for hosting.

Some hosting platforms import a top-level module (for example, `asgi:app`).
This file ensures the repository root is on `sys.path` so `backend` is importable
and then exposes the FastAPI `app` object from `backend.app.main`.
"""
import os
import sys

ROOT = os.path.dirname(__file__)
if ROOT not in sys.path:
    sys.path.insert(0, ROOT)

from backend.app.main import app  # noqa: E402,F401
