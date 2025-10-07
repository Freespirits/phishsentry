/// <reference types="vite/client" />

declare const __TARGET__: 'chrome' | 'firefox';

declare interface ImportMetaEnv {
  readonly VITE_API_ENDPOINT?: string;
  readonly VITE_API_TOKEN?: string;
  readonly VITE_API_TIMEOUT_MS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
