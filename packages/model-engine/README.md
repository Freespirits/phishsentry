# Model Engine

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
