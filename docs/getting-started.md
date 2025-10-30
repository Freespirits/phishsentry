# Project Kickoff & Local Setup Guide

This guide helps new contributors spin up the PhishSentry stack locally and highlights the immediate delivery priorities for the next iteration.

## Prerequisites

Install the following tooling versions (or newer):

- **Node.js 18+** and **PNPM 8+** for front-end and extension workspaces.
- **Python 3.11** with [uv](https://docs.astral.sh/uv/latest/) for the Scoring API and Model Engine packages.
- **Docker** (optional) if you want to run container images or compose services together.
- **Git LFS** if you plan to work with large model artifacts under `packages/model-engine`.

Clone the repository and install workspace dependencies from the repository root:

```bash
pnpm install --frozen-lockfile
```

> PNPM will only install dependencies for workspaces that use Node-based tooling (Ops Dashboard, Browser Extension). Python packages are handled per-project using `uv`.

## Running the Applications Locally

### Ops Dashboard (`apps/ops-dashboard`)

```bash
pnpm dev --filter ops-dashboard
```

The dashboard is served via Vite on <http://localhost:5173>. Environment variables can be configured through a `.env.local` file inside `apps/ops-dashboard/`.

### Scoring API (`packages/scoring-api`)

```bash
cd packages/scoring-api
uv sync
uv run fastapi dev app/main.py
```

The development server listens on <http://127.0.0.1:8000>. Interactive API docs are available at `/docs` when the server is running.

### Model Engine (`packages/model-engine`)

```bash
cd packages/model-engine
uv sync
uv run poe prepare-data
uv run poe train
```

For iterative development, export the lightweight model artifact (under `src/model_engine/artifacts/`) and point the Scoring API to it via the `MODEL_ENGINE_CONFIG` environment variable.

### Browser Extension (`packages/browser-extension`)

```bash
cd packages/browser-extension
pnpm install
pnpm dev
```

Create `.env` files that define `VITE_API_ENDPOINT`, `VITE_API_TOKEN`, and `VITE_API_TIMEOUT_MS` before loading the unpacked extension in your browser.

## Recommended Local Topology

1. Start the **Scoring API** so that both the Ops Dashboard and Browser Extension can query live scores.
2. Run the **Model Engine** training or evaluation tasks to refresh local model artifacts.
3. Launch the **Ops Dashboard** for operator workflows and UI validation.
4. Build or load the **Browser Extension** to exercise end-to-end flows from the client side.

Consider using Docker Compose (see `packages/scoring-api/docker-compose.yml`) once the model engine exposes a container image for local orchestration.

## Immediate Delivery Priorities

1. **Provision shared infrastructure** following the [Infrastructure & Hosting Plan](./infrastructure.md):
   - Create the Cloudflare Pages project for the Ops Dashboard.
   - Set up AWS networking plus RDS and ECS resources (or Fly.io if preferred) for the Scoring API and Model Engine.
   - Configure GitHub Actions secrets for deployment (`CLOUDFLARE_API_TOKEN`, `AWS_ACCESS_KEY_ID`, `FLY_API_TOKEN`).
2. **Define service data contracts**:
   - Maintain the protobuf/OpenAPI schemas referenced in the [Architecture Overview](./architecture.md).
   - Keep the event payload definitions under `docs/schemas/` current as new fields roll out across clients.
3. **Operational readiness**:
   - Draft incident response and database failover runbooks.
   - Align alerting/observability wiring with the logging and metrics stack described in the infrastructure plan.
4. **Feature alignment**:
   - Coordinate telemetry schema updates across the Ops Dashboard, Scoring API, and Browser Extension teams before the next release.

Maintaining momentum on these items will unblock cross-team testing and our initial staging deployment.
