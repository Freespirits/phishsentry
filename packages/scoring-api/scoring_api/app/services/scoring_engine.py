"""Scoring engine abstractions used by the API layer."""

from __future__ import annotations

import abc
from dataclasses import dataclass, field
from typing import Dict, List, Optional


class ScoringEngineError(RuntimeError):
    """Raised when the scoring engine fails to produce a score."""


class ScoringTimeoutError(ScoringEngineError):
    """Raised when scoring exceeds the configured timeout."""


@dataclass(frozen=True)
class ScoreResult:
    """Data transfer object representing scoring output."""

    risk_score: float
    reasons: List[str] = field(default_factory=list)
    signals: Dict[str, Optional[str]] = field(default_factory=dict)


class ScoringEngine(abc.ABC):
    """Interface for URL scoring implementations."""

    @abc.abstractmethod
    def score_url(self, url: str, timeout_seconds: Optional[float] = None) -> ScoreResult:
        """Return a phishing risk score for the provided URL."""


class RuleBasedScoringEngine(ScoringEngine):
    """Lightweight fallback engine until the real rules package is wired."""

    DEFAULT_REASON = "Heuristic analysis completed"

    def score_url(self, url: str, timeout_seconds: Optional[float] = None) -> ScoreResult:
        # Placeholder implementation until the shared rules package is available.
        # Uses a naive heuristic based on the presence of suspicious keywords.
        lowered = url.lower()
        indicators = [
            ("login", "Login keyword detected"),
            ("verify", "Verification keyword detected"),
            ("account", "Account keyword detected"),
        ]

        matches: List[str] = [reason for token, reason in indicators if token in lowered]
        risk = 0.2 + 0.2 * len(matches)
        risk_score = min(risk, 1.0)

        reasons: List[str] = matches or [self.DEFAULT_REASON]
        signals: Dict[str, Optional[str]] = {
            "matched_indicators": ", ".join(reason for reason in matches) or None,
            "timeout_seconds": str(timeout_seconds) if timeout_seconds is not None else None,
        }
        return ScoreResult(risk_score=risk_score, reasons=reasons, signals=signals)


__all__ = [
    "ScoringEngine",
    "ScoringEngineError",
    "ScoringTimeoutError",
    "ScoreResult",
    "RuleBasedScoringEngine",
]
