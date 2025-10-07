# Ops Dashboard

## Ownership
- **Team:** Trust & Safety Operations
- **Primary Maintainer:** Casey Martinez (<cmartinez@phishsentry.internal>)

## Tech Stack
- React + TypeScript
- Vite + PNPM tooling
- Tailwind CSS + Headless UI

## Local Development
```bash
pnpm install
pnpm dev
```

## Build & QA
```bash
pnpm build
pnpm preview
pnpm test
```

## Deployment Targets
- Netlify app `ops-dashboard` for staging
- Kubernetes-hosted SSR Node service for production analytics surface

## Contribution Notes
- Coordinate telemetry schema updates with Browser Extension and Scoring API teams
- Dashboard roadmap tracked in Jira project `OPSENG`
