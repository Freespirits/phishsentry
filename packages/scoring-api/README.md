# PhishSentry Scoring API

This package provides a lightweight FastAPI service for evaluating URLs using the PhishSentry rules and model stack. The service exposes a single endpoint `POST /score` that returns a normalized risk score together with supporting reasons and raw signals.

## Quick start

### Install dependencies

```bash
cd packages/scoring-api
python -m venv .venv
source .venv/bin/activate
pip install -e .[dev]
```

### Run the API locally

```bash
uvicorn scoring_api.app.main:app --reload --host 0.0.0.0 --port 8000
```

The interactive documentation is available at <http://127.0.0.1:8000/docs> once the server is running.

### Run the test suite

```bash
pytest
```

## Configuration

The API currently ships with a simple rule-based scoring engine (`RuleBasedScoringEngine`) that acts as a stand-in for the production rules/model package. To integrate the real engine, update `get_scoring_engine` in `scoring_api/app/dependencies.py` to return the appropriate implementation. The API handlers and tests rely only on the abstract `ScoringEngine` interface.

## Deployment

### Docker

A production-ready container image can be built using the provided Dockerfile:

```bash
# From the repository root
docker build -f packages/scoring-api/Dockerfile -t phishsentry/scoring-api:latest .
```

Run the image locally:

```bash
docker run --rm -p 8000:8000 phishsentry/scoring-api:latest
```

### Docker Compose

A sample `docker-compose.yml` is included to facilitate local orchestration alongside other services:

```bash
# From the repository root
docker compose -f packages/scoring-api/docker-compose.yml up --build
```

### Staging/Production considerations

* Set the `UVICORN_WORKERS` build argument or environment variable (defaults to 4) to tune concurrency for your deployment target.
* Terminate TLS at the load balancer or configure Uvicorn/Gunicorn accordingly.
* Add observability by wiring FastAPI middleware (e.g., logging, tracing) as required by your environment.
* Configure health checks against `GET /docs` or add a dedicated `/healthz` endpoint before production rollout.
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
