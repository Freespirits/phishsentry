# System Architecture Overview

The PhishSentry platform is organized as a set of loosely coupled components that collaborate to detect, score, and surface phishing attempts across customer environments.

## High-Level Flow
1. **Browser Extension (`packages/browser-extension`)**
   - Monitors user interactions and page metadata inside customer browsers.
   - Submits event payloads and suspicious artifacts to the Scoring API over authenticated HTTPS.
2. **Scoring API (`packages/scoring-api`)**
   - Receives event payloads from the extension and internal integrations.
   - Enriches requests with customer configuration and passes structured feature vectors to the Model Engine.
   - Persists scoring results and case notes to the shared PostgreSQL database.
3. **Model Engine (`packages/model-engine`)**
   - Hosts machine-learned models and deterministic rules for phishing detection.
   - Returns threat scores, recommended actions, and explanation metadata to the Scoring API.
4. **Ops Dashboard (`apps/ops-dashboard`)**
   - Presents real-time case data and analytics to Trust & Safety operators.
   - Consumes Scoring API webhooks and polling endpoints to display investigation queues and trends.

## Operational Considerations
- All services emit structured logs to the centralized logging pipeline (`Loki + Grafana`).
- Shared secrets are managed via HashiCorp Vault and injected at deploy time.
- Deployment pipelines for all components are orchestrated in GitHub Actions with environment-specific gates.

## Data Contracts
- Event schemas between the Browser Extension and Scoring API are versioned under `docs/schemas` (to be created).
- The Scoring API ↔ Model Engine contract uses protobuf definitions for low-latency inference calls.
- Ops Dashboard expects normalized case records and metrics exposed via `/v1/analytics` endpoints on the Scoring API.

## Future Enhancements
- Evaluate gRPC streaming between the Scoring API and Model Engine to reduce serialization overhead.
- Expand the Ops Dashboard to support real-time push updates using WebSockets.
