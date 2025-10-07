from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional


@dataclass(frozen=True)
class ModelResult:
    """Represents the outcome of scoring a URL."""

    url: str
    score: float
    label: str
    threshold: float
    factors: Dict[str, Any] = field(default_factory=dict)
    overrides: List[str] = field(default_factory=list)
    model_used: Optional[str] = None

    def is_malicious(self) -> bool:
        """True when the URL was classified as malicious."""

        return self.score >= self.threshold and "allowlist" not in self.overrides
