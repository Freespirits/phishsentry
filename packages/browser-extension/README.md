# Browser Extension

## Ownership
- **Team:** Client Integrations Guild
- **Primary Maintainer:** Jordan Lee (<jlee@phishsentry.internal>)

## Tech Stack
- TypeScript + React
- Vite build tooling
- WebExtension APIs targeting Chromium-based browsers

## Development Workflow
```bash
pnpm install
pnpm dev
```

## Build Commands
```bash
pnpm build
pnpm package
```

## Deployment Targets
- Chrome Web Store (internal unlisted distribution)
- Signed bundles for enterprise customers via manual delivery

## Contribution Notes
- Feature requests and bug reports are tracked in Linear project `EXT`
- Coordinate release timelines with the Ops Dashboard team for analytics schema changes
