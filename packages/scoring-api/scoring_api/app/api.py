"""API routes for the scoring service."""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status

from .dependencies import get_scoring_engine
from .schemas import ErrorResponse, ScoreRequest, ScoreResponse
from .services.scoring_engine import (
    ScoringEngine,
    ScoringEngineError,
    ScoringTimeoutError,
)

router = APIRouter()


@router.post(
    "/score",
    response_model=ScoreResponse,
    responses={
        status.HTTP_504_GATEWAY_TIMEOUT: {
            "model": ErrorResponse,
            "description": "The downstream scoring engine timed out.",
        },
        status.HTTP_500_INTERNAL_SERVER_ERROR: {
            "model": ErrorResponse,
            "description": "The scoring engine failed unexpectedly.",
        },
    },
)
def score_url(
    payload: ScoreRequest,
    scoring_engine: ScoringEngine = Depends(get_scoring_engine),
) -> ScoreResponse:
    """Score a URL by delegating to the configured scoring engine."""

    try:
        result = scoring_engine.score_url(
            url=str(payload.url), timeout_seconds=payload.timeout_seconds
        )
    except ScoringTimeoutError as exc:
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail=str(exc) or "Scoring operation exceeded timeout.",
        ) from exc
    except ScoringEngineError as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(exc) or "Failed to compute score.",
        ) from exc

    return ScoreResponse(
        risk_score=result.risk_score,
        reasons=result.reasons,
        signals=result.signals,
    )
