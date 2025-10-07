# Model Engine

This package provides phishing URL scoring that blends machine learning with transparent heuristics and list-based overrides. It can be used directly or embedded inside larger services.

## Evaluating URLs

```python
from model_engine import evaluate_url

result = evaluate_url("http://login-secure-update.example.com")
print(result.score, result.label)
print(result.factors)
```

The returned `ModelResult` exposes the blended score, threshold, contributing factors, and which model (if any) was used.

## Configuration

Configuration is stored in JSON (see [`default_config.json`](src/model_engine/default_config.json)). The keys include:

- `model.path`: relative path to a lightweight model artifact (`artifacts/lightweight_model.json`). Set to `null` to disable ML and force heuristics.
- `model.weight`: blending weight between the ML prediction and heuristic score.
- `thresholds.phishing`: score at which a URL is considered malicious.
- `blocklist` / `allowlist`: inline `items` arrays or a `path` pointing at newline-delimited files. Blocked URLs always return score `1.0`; allowed URLs return `0.0`.
- `heuristics`: tunable thresholds and weights controlling the deterministic fallback scorer.

To use a custom configuration file set the `MODEL_ENGINE_CONFIG` environment variable to its path or call `EngineConfig.load(path)` and pass the result to `evaluate_url`.

## Refreshing the ML Model

1. Collect labelled URLs and extract features with `model_engine.features.extract_features`.
2. Train a logistic-regression style model (any framework) and record the learned bias plus feature weights.
3. Export the model as JSON using the same field names as the training features, e.g.
   ```json
   {
     "name": "lightweight-phish-model",
     "bias": -0.9,
     "weights": {"length_norm": 1.1, "keyword_flag": 1.7}
   }
   ```
4. Place the artifact inside `src/model_engine/artifacts/` (or update `model.path` to the new location).
5. Bump the configuration weight or threshold if calibration changes.

Reload the engine by either restarting the service or calling `model_engine.set_config(new_config)`.

## Updating Heuristics

- Adjust the values inside the `heuristics` section of the configuration to change thresholds or weights.
- Add or remove suspicious TLDs and keywords in [`features.py`](src/model_engine/features.py) to match the current landscape.
- Tests in `tests/test_evaluator.py` cover the ML path, heuristic fallback, and list overrides—extend them when adding new rules.

## Blocklists and Allowlists

Maintain newline-delimited files referenced by the configuration `path` fields, or edit the `items` arrays directly. Overrides take precedence over any model score.
## Ownership
- **Team:** Applied Research
- **Primary Maintainer:** Dr. Elena Sorenson (<esorenson@phishsentry.internal>)

## Tech Stack
- Python 3.11
- TorchServe for model inference
- Feature rules executed via Pandas + custom DSL

## Local Development
```bash
uv sync
uv run poe prepare-data
uv run poe train
```

## Build & Release
```bash
uv run poe package-model  # produces model archive (*.mar)
uv run poe build-docker   # builds inference image with TorchServe
```

## Deployment Targets
- Model artifacts stored in S3 bucket `phishsentry-models`
- Deployed to Kubernetes `model-engine` deployment behind the Scoring API

## Contribution Notes
- Coordinate feature engineering changes with the Scoring API team to ensure feature availability
- Keep `MODEL_VERSION` synchronized with Ops Dashboard analytics expectations
