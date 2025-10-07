"""Dependency wiring for the scoring API."""

from __future__ import annotations

from functools import lru_cache

from .services.scoring_engine import RuleBasedScoringEngine, ScoringEngine


@lru_cache(maxsize=1)
def get_scoring_engine() -> ScoringEngine:
    """Return the configured scoring engine instance.

    This function acts as an integration point for the shared model/rules package.
    Once the production implementation is available it can be swapped here without
    touching the API handlers or tests.
    """

    return RuleBasedScoringEngine()
