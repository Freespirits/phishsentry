import { z } from 'zod';
import { ApiError } from './errors';
import { getEnv } from './env';

const alertSchema = z.object({
  id: z.string(),
  url: z.string().url(),
  status: z.enum(['new', 'investigating', 'mitigated']),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  detectedAt: z.string(),
  reporter: z.string(),
  tags: z.array(z.string()).default([])
});

const paginatedAlertsSchema = z.object({
  items: z.array(alertSchema),
  total: z.number()
});

const urlDetailSchema = alertSchema.extend({
  redirectChain: z.array(z.string().url()).default([]),
  screenshotUrl: z.string().url().optional(),
  relatedAlerts: z.array(alertSchema.pick({ id: true, severity: true, status: true })).default([]),
  intelligence: z.object({
    brand: z.string().optional(),
    ttp: z.string().optional(),
    confidence: z.number().min(0).max(1).optional()
  })
});

const feedStatsSchema = z.object({
  totalUrls: z.number(),
  uniques24h: z.number(),
  providers: z.array(z.object({ name: z.string(), count: z.number() }))
});

const modelMetricsSchema = z.object({
  modelVersion: z.string(),
  precision: z.number(),
  recall: z.number(),
  f1: z.number(),
  auc: z.number(),
  updatedAt: z.string()
});

const listItemSchema = z.object({
  id: z.string(),
  url: z.string().url(),
  createdAt: z.string(),
  reason: z.string().optional()
});

const listResponseSchema = z.object({
  items: z.array(listItemSchema)
});

export type Alert = z.infer<typeof alertSchema>;
export type PaginatedAlerts = z.infer<typeof paginatedAlertsSchema>;
export type UrlDetail = z.infer<typeof urlDetailSchema>;
export type FeedStats = z.infer<typeof feedStatsSchema>;
export type ModelMetrics = z.infer<typeof modelMetricsSchema>;
export type ListItem = z.infer<typeof listItemSchema>;

async function request<T>(path: string, init?: RequestInit) {
  const { apiBaseUrl, authToken } = getEnv();
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...init?.headers
    }
  });

  if (!response.ok) {
    throw new ApiError(`Request failed with status ${response.status}`, response.status);
  }

  return (await response.json()) as T;
}

export const api = {
  async listAlerts(page = 1, pageSize = 25) {
    const data = await request(`/alerts?page=${page}&pageSize=${pageSize}`);
    return paginatedAlertsSchema.parse(data);
  },
  async getAlert(id: string) {
    const data = await request(`/alerts/${id}`);
    return urlDetailSchema.parse(data);
  },
  async getFeedStats() {
    const data = await request('/feeds/stats');
    return feedStatsSchema.parse(data);
  },
  async getModelMetrics() {
    const data = await request('/models/metrics');
    return modelMetricsSchema.parse(data);
  },
  async listBlocklist() {
    const data = await request('/lists/block');
    return listResponseSchema.parse(data);
  },
  async listAllowlist() {
    const data = await request('/lists/allow');
    return listResponseSchema.parse(data);
  },
  async createListEntry(type: 'block' | 'allow', payload: { url: string; reason?: string }) {
    const data = await request(`/lists/${type}`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    return listItemSchema.parse(data);
  },
  async deleteListEntry(type: 'block' | 'allow', id: string) {
    await request(`/lists/${type}/${id}`, { method: 'DELETE' });
    return true;
  }
};
