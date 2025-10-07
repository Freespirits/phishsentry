export interface EnvConfig {
  apiBaseUrl: string;
  authToken?: string;
}

const DEFAULT_API_BASE_URL = 'https://api.example.com';

export function getEnv(): EnvConfig {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? DEFAULT_API_BASE_URL;
  const authToken = import.meta.env.VITE_API_TOKEN;

  return {
    apiBaseUrl: apiBaseUrl.replace(/\/$/, ''),
    authToken
  };
}
