#!/usr/bin/env node
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distChrome = path.join(__dirname, '..', 'dist', 'chrome');
const distFirefox = path.join(__dirname, '..', 'dist', 'firefox');

const steps = `Manual QA Checklist\n====================\n\nChrome\n------\n1. Run \`npm install\` within \`packages/browser-extension\`.\n2. Build the Chrome bundle with \`npm run build:chrome\`.\n3. Open Chrome and navigate to chrome://extensions.\n4. Enable Developer Mode and choose "Load unpacked".\n5. Select the built directory: ${distChrome}.\n6. Open Gmail, a social site, and a generic website to confirm badges appear next to links.\n7. Click a badge to verify the PhishSentry panel opens with API results and offline messaging.\n\nFirefox\n-------\n1. Run \`npm install\` if you have not already.\n2. Build the Firefox bundle with \`npm run build:firefox\`.\n3. Open Firefox and go to about:debugging#/runtime/this-firefox.\n4. Use "Load Temporary Add-on" and select the \`manifest.json\` within ${distFirefox}.\n5. Repeat the same navigation checks as Chrome.\n\nValidation\n---------\n- Toggle network offline to confirm the extension gracefully falls back to cached or offline messaging.\n- Confirm the details panel can be dismissed and reopened.\n- Review the browser console for any runtime errors.`;

console.log(steps);
