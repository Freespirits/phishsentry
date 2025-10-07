from __future__ import annotations

import json
import math
from dataclasses import dataclass
from pathlib import Path
from typing import Dict

from .features import FeatureVector


class ModelNotAvailable(RuntimeError):
    """Raised when the ML model cannot be loaded."""


@dataclass
class UrlModel:
    name: str
    weights: Dict[str, float]
    bias: float

    @classmethod
    def load(cls, path: Path) -> "UrlModel":
        if not path or not path.exists():
            raise ModelNotAvailable(f"Model artifact not found at {path}")
        with path.open("r", encoding="utf-8") as handle:
            payload = json.load(handle)
        return cls(
            name=payload.get("name", "lightweight-phish-model"),
            weights=payload.get("weights", {}),
            bias=float(payload.get("bias", 0.0)),
        )

    def predict_probability(self, features: FeatureVector) -> float:
        score = self.bias
        for name, value in features.values.items():
            weight = self.weights.get(name)
            if weight is None:
                continue
            score += weight * value
        return _sigmoid(score)


def _sigmoid(value: float) -> float:
    return 1.0 / (1.0 + math.exp(-value))
