from __future__ import annotations

from typing import Dict, Tuple

from .config import HeuristicSettings
from .features import FeatureVector


def score_with_heuristics(features: FeatureVector, settings: HeuristicSettings) -> Tuple[float, Dict[str, float]]:
    """Compute a deterministic heuristic score based on the extracted features."""

    contributions: Dict[str, float] = {}
    score = settings.base_score
    if settings.base_score:
        contributions["base"] = settings.base_score

    values = features.values

    if values.get("keyword_flag", 0.0) > 0:
        contributions["keyword_match"] = settings.keyword_weight
        score += settings.keyword_weight

    if values.get("digit_ratio", 0.0) * 100 >= settings.digit_threshold:
        contributions["many_digits"] = settings.digit_weight
        score += settings.digit_weight

    length_estimate = values.get("length_norm", 0.0) * 100
    if length_estimate >= settings.length_threshold:
        contributions["long_url"] = settings.length_weight
        score += settings.length_weight

    subdomain_ratio = values.get("subdomain_ratio", 0.0)
    if subdomain_ratio * 4 >= settings.subdomain_threshold:
        contributions["deep_subdomains"] = settings.subdomain_weight
        score += settings.subdomain_weight

    if values.get("suspicious_tld", 0.0) > 0:
        contributions["suspicious_tld"] = settings.suspicious_tld_weight
        score += settings.suspicious_tld_weight

    if values.get("https_flag", 0.0) > 0:
        # HTTPS slightly reduces the risk score but never below zero.
        bonus = min(settings.https_bonus, score)
        if bonus:
            contributions["https"] = -bonus
            score -= bonus

    score = max(0.0, min(score, 1.0))
    return score, contributions
