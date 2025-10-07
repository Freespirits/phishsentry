from __future__ import annotations

import json
import os
from dataclasses import dataclass, field
from pathlib import Path
from typing import Dict, Iterable, Optional, Sequence, Set


_DEFAULT_CONFIG_NAME = "default_config.json"


@dataclass
class HeuristicSettings:
    digit_threshold: int = 6
    digit_weight: float = 0.15
    length_threshold: int = 40
    length_weight: float = 0.2
    subdomain_threshold: int = 3
    subdomain_weight: float = 0.15
    suspicious_tlds: Sequence[str] = field(default_factory=lambda: ["zip", "xyz", "top", "click"])
    suspicious_tld_weight: float = 0.15
    keyword_weight: float = 0.2
    https_bonus: float = 0.1
    base_score: float = 0.05


@dataclass
class EngineConfig:
    model_path: Optional[Path]
    model_weight: float
    phishing_threshold: float
    blocklist: Set[str]
    allowlist: Set[str]
    heuristics: HeuristicSettings

    @classmethod
    def load(cls, path: Optional[Path] = None) -> "EngineConfig":
        base_path = None
        if path is None:
            env_path = os.getenv("MODEL_ENGINE_CONFIG")
            if env_path:
                path = Path(env_path)
            else:
                path = Path(__file__).with_name(_DEFAULT_CONFIG_NAME)
        else:
            path = Path(path)

        base_path = path.parent
        with path.open("r", encoding="utf-8") as handle:
            raw: Dict[str, object] = json.load(handle)
        return cls.from_dict(raw, base_path=base_path)

    @classmethod
    def from_dict(cls, payload: Dict[str, object], base_path: Optional[Path] = None) -> "EngineConfig":
        model_section = payload.get("model", {})
        model_path = model_section.get("path") if isinstance(model_section, dict) else None
        resolved_model_path = Path(model_path) if model_path else None
        if resolved_model_path and base_path and not resolved_model_path.is_absolute():
            resolved_model_path = (base_path / resolved_model_path).resolve()

        model_weight = float(model_section.get("weight", 0.7)) if isinstance(model_section, dict) else 0.7

        thresholds = payload.get("thresholds", {})
        phishing_threshold = float(thresholds.get("phishing", 0.6)) if isinstance(thresholds, dict) else 0.6

        heuristics_payload = payload.get("heuristics", {})
        heuristics = HeuristicSettings(
            digit_threshold=int(heuristics_payload.get("digit_threshold", 6))
            if isinstance(heuristics_payload, dict)
            else 6,
            digit_weight=float(heuristics_payload.get("digit_weight", 0.15))
            if isinstance(heuristics_payload, dict)
            else 0.15,
            length_threshold=int(heuristics_payload.get("length_threshold", 40))
            if isinstance(heuristics_payload, dict)
            else 40,
            length_weight=float(heuristics_payload.get("length_weight", 0.2))
            if isinstance(heuristics_payload, dict)
            else 0.2,
            subdomain_threshold=int(heuristics_payload.get("subdomain_threshold", 3))
            if isinstance(heuristics_payload, dict)
            else 3,
            subdomain_weight=float(heuristics_payload.get("subdomain_weight", 0.15))
            if isinstance(heuristics_payload, dict)
            else 0.15,
            suspicious_tlds=tuple(heuristics_payload.get("suspicious_tlds", ["zip", "xyz", "top", "click"]))
            if isinstance(heuristics_payload, dict)
            else ("zip", "xyz", "top", "click"),
            suspicious_tld_weight=float(heuristics_payload.get("suspicious_tld_weight", 0.15))
            if isinstance(heuristics_payload, dict)
            else 0.15,
            keyword_weight=float(heuristics_payload.get("keyword_weight", 0.2))
            if isinstance(heuristics_payload, dict)
            else 0.2,
            https_bonus=float(heuristics_payload.get("https_bonus", 0.1))
            if isinstance(heuristics_payload, dict)
            else 0.1,
            base_score=float(heuristics_payload.get("base_score", 0.05))
            if isinstance(heuristics_payload, dict)
            else 0.05,
        )

        blocklist = _load_list(payload.get("blocklist"), base_path=base_path)
        allowlist = _load_list(payload.get("allowlist"), base_path=base_path)

        return cls(
            model_path=resolved_model_path,
            model_weight=model_weight,
            phishing_threshold=phishing_threshold,
            blocklist=blocklist,
            allowlist=allowlist,
            heuristics=heuristics,
        )


def _load_list(raw: object, base_path: Optional[Path]) -> Set[str]:
    if raw is None:
        return set()
    if isinstance(raw, (list, tuple, set)):
        return {str(item).strip() for item in raw if str(item).strip()}
    if isinstance(raw, dict):
        values: Set[str] = set()
        items: Iterable[str] = raw.get("items", []) if isinstance(raw.get("items"), Iterable) else []
        for item in items:
            text = str(item).strip()
            if text:
                values.add(text)
        list_path = raw.get("path")
        if list_path:
            file_path = Path(list_path)
            if base_path and not file_path.is_absolute():
                file_path = (base_path / file_path).resolve()
            if file_path.exists():
                with file_path.open("r", encoding="utf-8") as handle:
                    for line in handle:
                        text = line.strip()
                        if text and not text.startswith("#"):
                            values.add(text)
        return values
    raise TypeError(f"Unsupported list specification: {raw!r}")


_config: Optional[EngineConfig] = None


def get_config() -> EngineConfig:
    global _config
    if _config is None:
        _config = EngineConfig.load()
    return _config


def set_config(config: EngineConfig) -> None:
    global _config
    _config = config
