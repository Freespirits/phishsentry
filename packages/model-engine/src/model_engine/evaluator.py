from __future__ import annotations

from dataclasses import dataclass
from typing import Optional

from .config import EngineConfig, get_config
from .features import extract_features
from .heuristics import score_with_heuristics
from .model import ModelNotAvailable, UrlModel
from .types import ModelResult


@dataclass
class _ModelCache:
    model: Optional[UrlModel] = None
    path: Optional[str] = None


_model_cache = _ModelCache()


def evaluate_url(url: str, config: Optional[EngineConfig] = None) -> ModelResult:
    """Score *url* and explain the contributing factors."""

    cfg = config or get_config()

    if url in cfg.allowlist:
        return ModelResult(
            url=url,
            score=0.0,
            label="allow",
            threshold=cfg.phishing_threshold,
            factors={"reason": "allowlist"},
            overrides=["allowlist"],
            model_used=None,
        )

    if url in cfg.blocklist:
        return ModelResult(
            url=url,
            score=1.0,
            label="block",
            threshold=cfg.phishing_threshold,
            factors={"reason": "blocklist"},
            overrides=["blocklist"],
            model_used=None,
        )

    features = extract_features(url)
    heuristics_score, heuristic_contrib = score_with_heuristics(features, cfg.heuristics)

    model_score = None
    model_used = None
    if cfg.model_path:
        model = _get_or_load_model(cfg)
        if model:
            model_score = model.predict_probability(features)
            model_used = model.name

    factors = {
        "heuristics": {
            "score": heuristics_score,
            "contributions": heuristic_contrib,
        }
    }

    final_score: float
    if model_score is not None:
        final_score = cfg.model_weight * model_score + (1 - cfg.model_weight) * heuristics_score
        factors["model_score"] = model_score
    else:
        final_score = heuristics_score
        model_used = None

    final_score = max(0.0, min(final_score, 1.0))

    label = "malicious" if final_score >= cfg.phishing_threshold else "benign"

    return ModelResult(
        url=url,
        score=final_score,
        label=label,
        threshold=cfg.phishing_threshold,
        factors=factors,
        overrides=[],
        model_used=model_used,
    )


def _get_or_load_model(config: EngineConfig) -> Optional[UrlModel]:
    if not config.model_path:
        return None
    path_str = str(config.model_path)
    if _model_cache.model and _model_cache.path == path_str:
        return _model_cache.model

    try:
        model = UrlModel.load(config.model_path)
    except ModelNotAvailable:
        _model_cache.model = None
        _model_cache.path = None
        return None

    _model_cache.model = model
    _model_cache.path = path_str
    return model
