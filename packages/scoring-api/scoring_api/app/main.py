"""Application entrypoint for the scoring API."""

from __future__ import annotations

from fastapi import FastAPI

from . import api


def create_app() -> FastAPI:
    """Create and configure the FastAPI application instance."""

    application = FastAPI(
        title="PhishSentry Scoring API",
        version="0.1.0",
        description=(
            "API for evaluating URLs using the PhishSentry phishing detection "
            "rules and machine learning models."
        ),
    )
    application.include_router(api.router)
    return application


app = create_app()
