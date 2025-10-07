import { ApiResponse, getRuntimeConfig, isOffline, RiskAssessment } from '../config';

interface ScanCacheEntry {
  timestamp: number;
  response: ApiResponse;
}

const cache = new Map<string, ScanCacheEntry>();
const CACHE_TTL = 5 * 60 * 1000; // five minutes

const buildHeaders = (token?: string): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

const buildTimeout = <T>(promise: Promise<T>, timeoutMs: number): Promise<T> => {
  return new Promise<T>((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Request timeout'));
    }, timeoutMs);

    promise
      .then((value) => {
        clearTimeout(timeout);
        resolve(value);
      })
      .catch((error) => {
        clearTimeout(timeout);
        reject(error);
      });
  });
};

const fromCache = (url: string): ApiResponse | undefined => {
  const entry = cache.get(url);
  if (!entry) {
    return undefined;
  }

  if (Date.now() - entry.timestamp > CACHE_TTL) {
    cache.delete(url);
    return undefined;
  }

  return entry.response;
};

const saveToCache = (url: string, response: ApiResponse): void => {
  cache.set(url, {
    timestamp: Date.now(),
    response,
  });
};

const mapAssessment = (url: string, payload: unknown): RiskAssessment | undefined => {
  if (!payload || typeof payload !== 'object') {
    return undefined;
  }

  const record = payload as Record<string, unknown>;
  const riskLevel = typeof record.riskLevel === 'string' ? (record.riskLevel as RiskAssessment['riskLevel']) : 'unknown';

  return {
    url,
    riskLevel,
    score: typeof record.score === 'number' ? record.score : undefined,
    reason: typeof record.reason === 'string' ? record.reason : undefined,
    guidance: typeof record.guidance === 'string' ? record.guidance : undefined,
  };
};

const scanUrl = async (url: string): Promise<ApiResponse> => {
  const cached = fromCache(url);
  if (cached) {
    return cached;
  }

  if (!url) {
    return { status: 'error', message: 'Invalid URL' };
  }

  if (isOffline()) {
    const offlineResponse: ApiResponse = {
      status: 'offline',
      message: 'No network connection. Using cached data if available.',
      assessment: cached?.assessment ?? { url, riskLevel: 'unknown' },
    };
    saveToCache(url, offlineResponse);
    return offlineResponse;
  }

  const { apiEndpoint, apiToken, requestTimeout } = getRuntimeConfig();

  try {
    const response = await buildTimeout(
      fetch(apiEndpoint, {
        method: 'POST',
        headers: buildHeaders(apiToken),
        body: JSON.stringify({ url }),
      }),
      requestTimeout
    );

    if (!response.ok) {
      const errorResponse: ApiResponse = {
        status: 'error',
        message: `API responded with status ${response.status}`,
      };
      saveToCache(url, errorResponse);
      return errorResponse;
    }

    const payload = await response.json();
    const assessment = mapAssessment(url, (payload as Record<string, unknown>).assessment ?? payload);

    const successResponse: ApiResponse = {
      status: 'ok',
      assessment: assessment ?? { url, riskLevel: 'unknown' },
    };
    saveToCache(url, successResponse);
    return successResponse;
  } catch (error) {
    const errorResponse: ApiResponse = {
      status: isOffline() ? 'offline' : 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
    };
    saveToCache(url, errorResponse);
    return errorResponse;
  }
};

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type !== 'SCAN_URL') {
    return;
  }

  const { url } = message;
  scanUrl(url)
    .then(sendResponse)
    .catch((error) => {
      const fallback: ApiResponse = {
        status: 'error',
        message: error instanceof Error ? error.message : 'Unexpected failure',
      };
      sendResponse(fallback);
    });

  return true;
});

chrome.runtime.onInstalled.addListener(() => {
  console.info('PhishSentry extension installed for target:', __TARGET__);
});
