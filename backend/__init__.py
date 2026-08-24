"""
Make `backend` a Python package so imports like `import backend` work
when the app is started from the repository root (fixes ModuleNotFoundError
on some hosts / container setups).
"""

__all__ = []
