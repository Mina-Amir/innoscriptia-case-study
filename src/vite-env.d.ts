/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_NEWS_API_KEY: string;
  readonly VITE_THE_GUARDIAN_API_KEY: string;
  readonly VITE_NEW_YORK_TIMES_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
