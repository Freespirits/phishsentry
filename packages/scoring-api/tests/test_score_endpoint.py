"""Tests for the scoring API endpoint."""

from __future__ import annotations

import pytest
from fastapi import FastAPI, status
from fastapi.testclient import TestClient

from scoring_api.app.dependencies import get_scoring_engine
from scoring_api.app.main import create_app
from scoring_api.app.services.scoring_engine import (
    RuleBasedScoringEngine,
    ScoreResult,
    ScoringEngine,
    ScoringEngineError,
    ScoringTimeoutError,
)


class _MockEngine(ScoringEngine):
    def __init__(self, result: ScoreResult | None = None, exc: Exception | None = None):
        self._result = result
        self._exc = exc

    def score_url(self, url: str, timeout_seconds: float | None = None) -> ScoreResult:
        if self._exc:
            raise self._exc
        assert self._result is not None
        return self._result


@pytest.fixture()
def app() -> FastAPI:
    application = create_app()
    yield application
    application.dependency_overrides.clear()


@pytest.fixture()
def client(app: FastAPI) -> TestClient:
    return TestClient(app)


def test_score_endpoint_returns_result(client: TestClient, app: FastAPI) -> None:
    result = ScoreResult(
        risk_score=0.7,
        reasons=["Detected suspicious keyword"],
        signals={"matched_indicators": "Login keyword detected"},
    )

    app.dependency_overrides[get_scoring_engine] = lambda: _MockEngine(result=result)

    response = client.post(
        "/score",
        json={"url": "https://example.com/login"},
    )

    assert response.status_code == status.HTTP_200_OK
    payload = response.json()
    assert payload["risk_score"] == pytest.approx(0.7)
    assert payload["reasons"] == ["Detected suspicious keyword"]
    assert payload["signals"]["matched_indicators"] == "Login keyword detected"


def test_score_endpoint_validates_url(client: TestClient) -> None:
    response = client.post("/score", json={"url": "not-a-url"})
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


def test_score_endpoint_handles_timeout(client: TestClient, app: FastAPI) -> None:
    app.dependency_overrides[get_scoring_engine] = lambda: _MockEngine(
        exc=ScoringTimeoutError("Model timed out after 2s")
    )

    response = client.post("/score", json={"url": "https://example.com"})

    assert response.status_code == status.HTTP_504_GATEWAY_TIMEOUT
    assert response.json()["detail"] == "Model timed out after 2s"


def test_score_endpoint_handles_engine_error(client: TestClient, app: FastAPI) -> None:
    app.dependency_overrides[get_scoring_engine] = lambda: _MockEngine(
        exc=ScoringEngineError("Engine failure")
    )

    response = client.post("/score", json={"url": "https://example.com"})

    assert response.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR
    assert response.json()["detail"] == "Engine failure"


def test_rule_based_engine_default_behavior() -> None:
    engine = RuleBasedScoringEngine()

    result = engine.score_url("https://phishy.example.com/login")

    assert result.risk_score > 0.2
    assert "keyword" in " ".join(result.reasons).lower()
    assert "matched_indicators" in result.signals
