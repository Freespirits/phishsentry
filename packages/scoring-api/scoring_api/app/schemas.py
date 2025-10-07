"""Pydantic schemas for the scoring API."""

from __future__ import annotations

from typing import Dict, Optional

from pydantic import BaseModel, Field, HttpUrl, conlist, confloat


class ScoreRequest(BaseModel):
    """Incoming request for URL scoring."""

    url: HttpUrl = Field(..., description="URL to evaluate for phishing risk")
    timeout_seconds: Optional[confloat(gt=0)] = Field(
        None,
        description="Optional timeout override for downstream scoring engine.",
        example=2.5,
    )


class ScoreResponse(BaseModel):
    """Response returned by the scoring endpoint."""

    risk_score: confloat(ge=0, le=1) = Field(
        ..., description="Normalized phishing risk score between 0 and 1."
    )
    reasons: conlist(str, min_length=1) = Field(
        ..., description="Human-readable explanations supporting the risk score."
    )
    signals: Dict[str, Optional[str]] = Field(
        default_factory=dict,
        description="Raw detection signals that contributed to the assessment.",
    )


class ErrorResponse(BaseModel):
    """Error response payload."""

    detail: str
