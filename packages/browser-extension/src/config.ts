export type ApiStatus = 'ok' | 'error' | 'offline';

export interface RiskAssessment {
  url: string;
  riskLevel: 'low' | 'medium' | 'high' | 'unknown';
  score?: number;
  reason?: string;
  guidance?: string;
}

export interface ApiResponse {
  status: ApiStatus;
  assessment?: RiskAssessment;
  message?: string;
}

export interface RuntimeConfig {
  apiEndpoint: string;
  apiToken?: string;
  requestTimeout: number;
}

const FALLBACK_ENDPOINT = 'https://api.phishsentry.invalid/scan';
const FALLBACK_TIMEOUT = 4000;

export const getRuntimeConfig = (): RuntimeConfig => {
  const { VITE_API_ENDPOINT, VITE_API_TOKEN, VITE_API_TIMEOUT_MS } = import.meta.env;

  const requestTimeout = Number.parseInt(VITE_API_TIMEOUT_MS ?? '', 10);

  return {
    apiEndpoint: VITE_API_ENDPOINT?.trim() || FALLBACK_ENDPOINT,
    apiToken: VITE_API_TOKEN?.trim(),
    requestTimeout: Number.isFinite(requestTimeout) ? requestTimeout : FALLBACK_TIMEOUT,
  };
};

export const isOffline = (): boolean => {
  if (typeof navigator === 'undefined') {
    return false;
  }

  return navigator.onLine === false;
};
