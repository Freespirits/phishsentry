import type { ApiResponse, RiskAssessment } from '../config';
import './styles.css';

interface PanelController {
  show: (response: ApiResponse) => void;
}

const formatRiskLabel = (assessment?: RiskAssessment): string => {
  if (!assessment) {
    return 'Unknown';
  }

  const { riskLevel, score } = assessment;
  const label = riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1);
  if (typeof score === 'number') {
    return `${label} (${score.toFixed(0)})`;
  }
  return label;
};

const ensurePanel = (): HTMLDivElement => {
  let panel = document.querySelector<HTMLDivElement>('.ps-panel-container');
  if (panel) {
    return panel;
  }

  panel = document.createElement('div');
  panel.className = 'ps-panel-container';
  panel.dataset.open = 'false';

  panel.innerHTML = `
    <div class="ps-panel-header">
      <h3 class="ps-panel-title">PhishSentry Link Insights</h3>
      <button type="button" class="ps-panel-close" aria-label="Close">Close</button>
    </div>
    <div class="ps-panel-body ps-muted">
      Select a flagged link to view details.
    </div>
  `;

  document.body.append(panel);

  const closeButton = panel.querySelector<HTMLButtonElement>('.ps-panel-close');
  closeButton?.addEventListener('click', () => {
    panel!.dataset.open = 'false';
  });

  return panel;
};

const renderBody = (container: HTMLElement, response: ApiResponse): void => {
  const { assessment, status, message } = response;
  const riskLevel = assessment?.riskLevel ?? 'unknown';
  const reason = assessment?.reason ?? 'No specific reasoning provided.';
  const guidance = assessment?.guidance ?? 'Exercise caution when interacting with this link.';

  container.innerHTML = `
    <div class="ps-panel-metadata">
      <div><strong>Status</strong> ${status.toUpperCase()}</div>
      <div><strong>Risk</strong> ${formatRiskLabel(assessment)}</div>
      <div><strong>URL</strong> ${assessment?.url ?? 'Unavailable'}</div>
    </div>
    <div style="margin-top:16px;">
      <strong>Reason</strong>
      <p>${reason}</p>
    </div>
    <div style="margin-top:16px;">
      <strong>Guidance</strong>
      <p>${guidance}</p>
    </div>
    ${message ? `<p class="ps-muted" style="margin-top:12px;">${message}</p>` : ''}
  `;

  const header = container.parentElement?.querySelector<HTMLElement>('.ps-panel-header');
  if (header) {
    header.style.background =
      riskLevel === 'high'
        ? 'linear-gradient(120deg, #dc2626, #b91c1c)'
        : riskLevel === 'medium'
        ? 'linear-gradient(120deg, #f59e0b, #d97706)'
        : riskLevel === 'low'
        ? 'linear-gradient(120deg, #10b981, #059669)'
        : 'linear-gradient(120deg, #2563eb, #7c3aed)';
  }
};

export const createPanelController = (): PanelController => {
  const panel = ensurePanel();
  const body = panel.querySelector<HTMLElement>('.ps-panel-body');
  if (!body) {
    throw new Error('Panel body element missing');
  }

  const show = (response: ApiResponse) => {
    renderBody(body, response);
    panel.dataset.open = 'true';
  };

  return { show };
};
