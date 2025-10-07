from __future__ import annotations

import re
from dataclasses import dataclass
from typing import Dict
from urllib.parse import urlparse

_SUSPICIOUS_KEYWORDS = (
    "login",
    "secure",
    "update",
    "verify",
    "account",
    "bank",
    "invoice",
    "alert",
)

_IP_PATTERN = re.compile(
    r"^(?:(?:25[0-5]|2[0-4]\d|[0-1]?\d?\d)(?:\.(?!$)|$)){4}$"
)


@dataclass
class FeatureVector:
    values: Dict[str, float]


def extract_features(url: str) -> FeatureVector:
    parsed = urlparse(url)
    host = parsed.hostname or ""
    length_norm = min(len(url) / 100, 1.0)
    digit_ratio = _count_digits(url) / max(len(url), 1)
    keyword_flag = 1.0 if any(word in url.lower() for word in _SUSPICIOUS_KEYWORDS) else 0.0
    has_ip = 1.0 if _IP_PATTERN.match(host) else 0.0
    subdomain_ratio = min(max(host.count(".") - 1, 0) / 4, 1.0)
    https_flag = 1.0 if parsed.scheme == "https" else 0.0
    suspicious_tld = 1.0 if _tld_is_suspicious(host) else 0.0

    values = {
        "length_norm": length_norm,
        "digit_ratio": digit_ratio,
        "keyword_flag": keyword_flag,
        "has_ip": has_ip,
        "subdomain_ratio": subdomain_ratio,
        "https_flag": https_flag,
        "suspicious_tld": suspicious_tld,
    }
    return FeatureVector(values=values)


def _count_digits(text: str) -> int:
    return sum(1 for char in text if char.isdigit())


def _tld_is_suspicious(host: str) -> bool:
    if "." not in host:
        return False
    tld = host.split(".")[-1].lower()
    return tld in {"zip", "xyz", "top", "click", "link"}
