import type { ApiResponse } from '../config';
import { createPanelController } from './panel';
import './styles.css';

const panel = createPanelController();
const processedLinks = new WeakSet<HTMLAnchorElement>();
const inflightRequests = new Map<string, Promise<ApiResponse>>();

const sendScanRequest = (url: string): Promise<ApiResponse> => {
  if (!url) {
    return Promise.resolve({ status: 'error', message: 'Invalid URL provided.' });
  }

  const existing = inflightRequests.get(url);
  if (existing) {
    return existing;
  }

  const request = new Promise<ApiResponse>((resolve) => {
    chrome.runtime.sendMessage({ type: 'SCAN_URL', url }, (response: ApiResponse) => {
      if (chrome.runtime.lastError) {
        resolve({ status: 'error', message: chrome.runtime.lastError.message });
        inflightRequests.delete(url);
        return;
      }

      if (!response) {
        resolve({ status: 'error', message: 'Empty response from background worker.' });
        inflightRequests.delete(url);
        return;
      }

      resolve(response);
      inflightRequests.delete(url);
    });
  });

  inflightRequests.set(url, request);
  return request;
};

const getBadgeLabel = (response: ApiResponse): string => {
  const risk = response.assessment?.riskLevel ?? 'unknown';
  switch (risk) {
    case 'high':
      return 'High risk';
    case 'medium':
      return 'Medium risk';
    case 'low':
      return 'Low risk';
    default:
      return response.status === 'offline' ? 'Offline' : 'Unknown';
  }
};

const decorateLink = (link: HTMLAnchorElement, response: ApiResponse) => {
  link.classList.add('ps-link-flagged');
  const risk = response.assessment?.riskLevel ?? 'unknown';

  let badge = link.nextElementSibling;
  if (!badge || !(badge instanceof HTMLElement) || !badge.classList.contains('ps-risk-badge')) {
    badge = document.createElement('span');
    badge.className = 'ps-risk-badge';
    badge.tabIndex = 0;
    badge.setAttribute('role', 'button');
    badge.setAttribute('aria-label', 'View phishing risk details');
    link.insertAdjacentElement('afterend', badge);
  }

  badge.dataset.risk = risk;
  badge.textContent = getBadgeLabel(response);

  const showPanel = () => {
    panel.show({
      ...response,
      assessment: {
        url: response.assessment?.url ?? link.href,
        riskLevel: risk,
        score: response.assessment?.score,
        reason: response.assessment?.reason,
        guidance: response.assessment?.guidance,
      },
    });
  };

  badge.addEventListener('click', showPanel);
  badge.addEventListener('keypress', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      showPanel();
    }
  });

  link.addEventListener('click', () => {
    showPanel();
  });
};

const processLink = async (link: HTMLAnchorElement) => {
  if (processedLinks.has(link)) {
    return;
  }

  processedLinks.add(link);

  try {
    const response = await sendScanRequest(link.href);
    decorateLink(link, response);
  } catch (error) {
    console.error('Failed to process link', error);
  }
};

const observeLinks = (root: ParentNode = document): void => {
  const initialLinks = Array.from(root.querySelectorAll<HTMLAnchorElement>('a[href^="http"]'));
  initialLinks.forEach((link) => {
    if (link.href.startsWith('chrome-extension://')) {
      return;
    }
    processLink(link).catch((error) => console.error(error));
  });
};

const mutationObserver = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    mutation.addedNodes.forEach((node) => {
      if (node.nodeType !== Node.ELEMENT_NODE) {
        return;
      }

      const element = node as Element;
      if (element instanceof HTMLAnchorElement && element.href) {
        processLink(element).catch((error) => console.error(error));
        return;
      }

      observeLinks(element);
    });
  }
});

let isRunning = false;

export const startLinkScanner = (): void => {
  if (isRunning) {
    return;
  }

  isRunning = true;
  observeLinks();
  mutationObserver.observe(document.body, { childList: true, subtree: true });
};
