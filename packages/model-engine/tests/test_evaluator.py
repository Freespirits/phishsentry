import math
import sys
from pathlib import Path

import pytest

PROJECT_ROOT = Path(__file__).resolve().parents[1]
SRC_PATH = PROJECT_ROOT / "src"
if str(SRC_PATH) not in sys.path:
    sys.path.insert(0, str(SRC_PATH))

from model_engine.config import EngineConfig
from model_engine.evaluator import evaluate_url
from model_engine.heuristics import score_with_heuristics
from model_engine.features import extract_features


def load_default_config() -> EngineConfig:
    config_path = SRC_PATH / "model_engine" / "default_config.json"
    return EngineConfig.load(config_path)


def test_ml_evaluation_uses_model():
    config = load_default_config()
    url = "http://login-secure-update.example.com/account"
    result = evaluate_url(url, config=config)

    assert result.model_used == "lightweight-phish-model"
    assert "model_score" in result.factors
    assert result.factors["model_score"] > result.factors["heuristics"]["score"]
    assert result.is_malicious()


def test_heuristic_fallback_when_model_missing():
    config_payload = {
        "model": {"path": None, "weight": 0.5},
        "thresholds": {"phishing": 0.5},
        "blocklist": [],
        "allowlist": [],
        "heuristics": {
            "digit_threshold": 5,
            "digit_weight": 0.2,
            "length_threshold": 30,
            "length_weight": 0.2,
            "subdomain_threshold": 2,
            "subdomain_weight": 0.2,
            "suspicious_tlds": ["zip"],
            "suspicious_tld_weight": 0.2,
            "keyword_weight": 0.2,
            "https_bonus": 0.05,
            "base_score": 0.1,
        },
    }
    config = EngineConfig.from_dict(config_payload, base_path=SRC_PATH)

    url = "https://safe.example.com/profile"
    result = evaluate_url(url, config=config)

    assert result.model_used is None
    heuristics_score, _ = score_with_heuristics(extract_features(url), config.heuristics)
    assert math.isclose(result.score, heuristics_score)
    assert result.label == "benign"


def test_block_and_allow_list_override():
    config_payload = {
        "model": {"path": None, "weight": 0.5},
        "thresholds": {"phishing": 0.5},
        "blocklist": {"items": ["http://evil.example"]},
        "allowlist": {"items": ["https://trusted.example"]},
        "heuristics": {},
    }
    config = EngineConfig.from_dict(config_payload, base_path=SRC_PATH)

    allow_result = evaluate_url("https://trusted.example", config=config)
    assert allow_result.score == pytest.approx(0.0)
    assert allow_result.label == "allow"
    assert "allowlist" in allow_result.overrides
    assert not allow_result.is_malicious()

    block_result = evaluate_url("http://evil.example", config=config)
    assert block_result.score == pytest.approx(1.0)
    assert block_result.label == "block"
    assert "blocklist" in block_result.overrides
    assert block_result.is_malicious()
