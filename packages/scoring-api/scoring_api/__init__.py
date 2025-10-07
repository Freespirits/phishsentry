"""PhishSentry scoring API package."""

from .app import app as app
from .app.main import create_app

__all__ = ["app", "create_app"]
