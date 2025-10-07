# Scoring API

## Ownership
- **Team:** Detection Services
- **Primary Maintainer:** Priya Raman (<praman@phishsentry.internal>)

## Tech Stack
- Python 3.11
- FastAPI + Uvicorn
- PostgreSQL + Redis integrations

## Local Development
```bash
uv sync
uv run fastapi dev app/main.py
```

## Build & Packaging
```bash
uv run poe lint
uv run poe test
uv run poe build-docker
```

## Deployment Targets
- Kubernetes: `scoring-api` namespace in the `prod-phish` cluster
- Staging environment: `scoring-api-stg` helm release

## Contribution Notes
- API contracts documented via OpenAPI specs under `docs/openapi`
- Coordinate schema changes with the Model Engine team to ensure feature parity
