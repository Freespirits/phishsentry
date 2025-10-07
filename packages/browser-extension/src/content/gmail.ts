import { startLinkScanner } from './linkHighlighter';

document.addEventListener('DOMContentLoaded', () => {
  startLinkScanner();
});

if (document.readyState === 'complete' || document.readyState === 'interactive') {
  startLinkScanner();
}
