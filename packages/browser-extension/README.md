# PhishSentry Browser Extension

A Manifest V3 compliant browser extension that scans links across Gmail, popular social platforms, and general websites using the PhishSentry API.

## Features

- Background service worker requests phishing-risk insights from the PhishSentry API with caching and offline handling.
- Content scripts highlight links, append badges, and expose a floating details panel with actionable guidance.
- Environment-aware configuration for API endpoint, token, and timeout.
- Build targets for Chrome and Firefox bundles, plus linting and type checking support.

## Getting Started

```bash
cd packages/browser-extension
npm install
```

Create environment files as needed (e.g. `.env`, `.env.chrome`, `.env.firefox`) with:

```
VITE_API_ENDPOINT=https://api.example.com/scan
VITE_API_TOKEN=your-api-token
VITE_API_TIMEOUT_MS=4000
```

> The repository deliberately avoids hard-coding secrets. Configure the real endpoint and token locally.

## Scripts

- `npm run dev` – Watch mode for Chrome with Vite.
- `npm run build:chrome` – Build the Chrome MV3 bundle to `dist/chrome`.
- `npm run build:firefox` – Build the Firefox MV3 bundle to `dist/firefox`.
- `npm run lint` – ESLint across the TypeScript sources.
- `npm run typecheck` – TypeScript compiler in `--noEmit` mode.
- `npm run qa` – Print manual QA steps for loading the extension unpacked.

## Manual QA Summary

1. Build the target bundle.
2. Load the unpacked directory in your browser (`chrome://extensions` or `about:debugging#` for Firefox).
3. Visit Gmail, Facebook/Twitter/LinkedIn/Instagram, and a generic website.
4. Confirm risk badges appear near links and the details panel opens with context from the API response.
5. Toggle offline mode and verify the extension surfaces cached or offline messaging.
6. Check DevTools for errors.

## Development Notes

- The background worker caches API responses for five minutes to reduce repeated requests.
- Content scripts automatically observe DOM mutations to cover SPA experiences.
- Styling is encapsulated via prefixed classes to minimise CSS bleed.
- Update `manifest.chrome.json` and `manifest.firefox.json` if you adjust host permissions or content script matches.
