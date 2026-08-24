"""ASGI entrypoint for hosting inside backend or container context.

Some hosting platforms import `asgi:app` from the backend directory.
This file ensures python can resolve both `backend.app` and `app` package paths.
"""
import os
import sys

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PARENT_DIR = os.path.dirname(CURRENT_DIR)

if CURRENT_DIR not in sys.path:
    sys.path.insert(0, CURRENT_DIR)
if PARENT_DIR not in sys.path:
    sys.path.insert(0, PARENT_DIR)

try:
    from backend.app.main import app  # noqa: E402,F401
except ModuleNotFoundError:
    from app.main import app  # noqa: E402,F401
