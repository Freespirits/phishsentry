# Infrastructure & Hosting Plan

This document defines the infrastructure blueprint for the PhishSentry platform, mapping each component to hosting services, outlining environment topology, and detailing the operational guardrails required for a production launch.

## Component Hosting Matrix

| Component | Runtime Requirements | Recommended Host | Rationale |
| --- | --- | --- | --- |
| Ops Dashboard (`apps/ops-dashboard`) | Static Vite bundle, global CDN, edge caching | **Cloudflare Pages** | Leverages Cloudflare's global edge, integrates with existing account, supports zero-trust access and environment variables for build-time secrets. |
| Scoring API (`packages/scoring-api`) | Node.js (Express/Fastify) service, auto-scaling HTTP API, private networking | **Cloudflare Workers + D1 / Durable Objects** (for lightweight), or **Fly.io** (for long-running Node services) | Workers provide instant scaling and proximity to users. If the API requires long-lived connections or heavier CPU, Fly.io offers containerized deployments with regional scaling. |
| Model Engine (`packages/model-engine`) | Python-based inference, GPU/CPU intensive workloads, background jobs | **AWS ECS Fargate** or **AWS SageMaker** | ECS supports container workloads with networking to the Scoring API; SageMaker is preferred if managed model hosting and auto-scaling for ML inference is required. |
| Shared PostgreSQL Database | Managed Postgres with automated backups and encryption | **AWS RDS (PostgreSQL)** | Managed service with automated patching, snapshots, and VPC integration with ECS/Fly workloads. |
| Browser Extension Telemetry Ingress | Event gateway for browser payloads, request brokering | **Cloudflare Workers** fronting the Scoring API | Workers act as an authenticated edge gateway, reduce latency, and apply bot mitigation before events hit core services. |

> **Note:** For teams already invested in Cloudflare, Workers + D1 provide cohesive tooling. Hybrid hosting (Workers + AWS) keeps the latency-sensitive path on the edge while delegating heavy compute to cloud containers.

## Environment Topology

- **Development**
  - Branch-based deploy previews via Cloudflare Pages for the Ops Dashboard.
  - Fly.io/Fargate dev environment with reduced autoscale limits.
  - Ephemeral PostgreSQL databases (e.g., Neon, Supabase) seeded via migration scripts for feature branches.
- **Staging**
  - Mirrors production infrastructure but with isolated VPC and credentials.
  - Synthetic monitoring and load testing executed before promoting to production.
  - Feature flags default to "off"; used to validate integrations with third-party intel feeds.
- **Production**
  - Multi-region deployment for Scoring API (Fly.io with active-active) and Model Engine (ECS with auto-scaling policies).
  - Cloudflare Zero Trust policies guarding Ops Dashboard and internal APIs.
  - Disaster recovery runbook with RDS automated snapshots (hourly) and cross-region read replicas.

## Networking & Security

- All services terminate TLS via Cloudflare (Workers/Pages) or AWS-managed certificates.
- Traffic from Workers to backend services travels over mutual TLS using service-to-service certificates managed by Vault.
- Private networking between Fly.io apps and RDS via WireGuard peering; for AWS-native deployments, use VPC endpoints.
- Implement Cloudflare Web Application Firewall (WAF) rules for Ops Dashboard and API endpoints.
- Centralized secret storage: HashiCorp Vault mounted in each workload; GitHub Actions retrieves short-lived tokens during deploys.

## Observability Stack

- **Logging:** Cloudflare Logpush for edge events, Loki for application logs (ECS/Fly) with Grafana dashboards.
- **Metrics:** Prometheus-compatible exporters for API/Model Engine; integrate with Grafana Cloud for visualization.
- **Tracing:** OpenTelemetry instrumentation with collectors deployed alongside services, exporting to Tempo or Honeycomb.
- **Alerting:** PagerDuty integration for Sev0/Sev1 alerts; Slack notifications for Sev2+.

## Deployment Pipeline

1. GitHub Actions workflows triggered on `main` and PR branches.
2. Lint/test/build matrix for packages and apps using PNPM workspaces.
3. On success:
   - Deploy Ops Dashboard to Cloudflare Pages via `cloudflare/pages-deploy` action.
   - Publish Scoring API image to Fly.io or AWS ECR and roll out with blue/green strategy.
   - Trigger Model Engine deployment using ECS rolling update or SageMaker endpoint update.
4. Post-deploy smoke tests executed via Playwright against staging/production.

## Next Steps

- Provision Cloudflare Pages project linked to the repository.
- Create AWS infrastructure via Terraform (VPC, ECS cluster, RDS instance, IAM roles).
- Establish Fly.io organization app (if chosen) and configure WireGuard peering to AWS VPC.
- Implement GitHub Actions secrets for deploy tokens (`CLOUDFLARE_API_TOKEN`, `AWS_ACCESS_KEY_ID`, `FLY_API_TOKEN`).
- Document runbooks for incident response, database failover, and certificate rotation.

