# syntax=docker/dockerfile:1

FROM python:3.11-slim AS runtime

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

COPY packages/scoring-api/pyproject.toml ./pyproject.toml
COPY packages/scoring-api/scoring_api ./scoring_api

RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir .

ENV UVICORN_HOST=0.0.0.0 \
    UVICORN_PORT=8000 \
    UVICORN_WORKERS=4

EXPOSE 8000

CMD [
    "uvicorn",
    "scoring_api.app.main:app",
    "--host",
    "0.0.0.0",
    "--port",
    "8000",
    "--workers",
    "4"
]
