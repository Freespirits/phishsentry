# phishsentry

🛡️ AI-powered phishing URL zero-day detector

## Ops Dashboard (React + Vite + Tailwind)

The `apps/ops-dashboard` workspace hosts a React/Vite application used by the security operations team to triage alerts, review phishing intelligence, manage detection model metrics, and maintain block/allow lists.

### Features

- **Alert investigations** – sortable table with severity badges and drill-down view for each alert.
- **URL detail view** – redirect chain, enrichment context, and related alerts.
- **Feed insights** – ingestion statistics and provider breakdowns.
- **Model performance** – key model health metrics (precision, recall, F1, AUC) with update timestamps.
- **Blocklist / allowlist CRUD** – create/remove list entries with form validation and optimistic refresh.
- **Authentication guard** – lightweight provider/guard with placeholder login screen and local storage persistence.
- **API abstraction** – strongly-typed client powered by `zod`, `react-query`, and environment-driven configuration.
- **Testing** – Vitest + Testing Library unit tests and Playwright smoke E2E runner.

### Getting Started

```bash
npm install
npm run dev
```

The app runs on `http://localhost:5173` by default. Environment variables can be configured via `.env` files (`.env.local`, etc.). See `.env.example` for available options.

### Scripts

All scripts are exposed at the repository root and proxied to the workspace:

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server. |
| `npm run build` | Type-check and build the production bundle. |
| `npm run preview` | Preview the production build locally. |
| `npm run test` | Execute Vitest unit/component tests. |
| `npm run test:e2e` | Run Playwright smoke tests (requires build or dev server). |
| `npm run lint` | Run TypeScript for type-safety checks (no emit). |

### Testing

Unit tests run via Vitest:

```bash
npm run test
```

End-to-end smoke coverage runs via Playwright and automatically launches the Vite dev server:

```bash
npm run test:e2e
```

### Deployment

The dashboard is a static Vite site and can be deployed to any static hosting provider. The build output is generated in `apps/ops-dashboard/dist` after running `npm run build`.

#### Vercel

1. Fork/clone the repository and connect it to Vercel.
2. Set the project root to `apps/ops-dashboard`.
3. Configure build command `npm run build` and output directory `apps/ops-dashboard/dist`.
4. Define environment variables (`VITE_API_BASE_URL`, `VITE_API_TOKEN`, etc.) in the Vercel dashboard.

#### Netlify

1. Create a new site from Git in Netlify.
2. Set base directory to `apps/ops-dashboard` and build command `npm run build`.
3. Publish directory: `apps/ops-dashboard/dist`.
4. Add environment variables under **Site settings → Build & deploy → Environment**.

#### Self-hosted / Docker

1. Run `npm run build` to produce static assets.
2. Serve the `apps/ops-dashboard/dist` directory with your preferred HTTP server (e.g., Nginx, Caddy, S3 + CloudFront).
3. Ensure environment variables are compiled in at build time. For runtime configuration, host a JSON config endpoint and fetch it before bootstrapping React.

### API Authentication

The dashboard sends API requests using an optional bearer token. Configure `VITE_API_TOKEN` for local development and deployment environments if your API requires it.

### Repository Structure

```
apps/
  ops-dashboard/
    src/
      components/
      context/
      hooks/
      lib/
      pages/
      tests/
```

### Security

- Placeholder authentication is provided for development convenience. Replace the guard with production-ready OAuth/OpenID or SSO flows before shipping.
- The user-provided account ID and API token should **not** be committed to source control. Use environment variables and secrets management.
