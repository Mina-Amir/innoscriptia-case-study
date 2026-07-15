import { env } from '@/helpers/env';

const required = [
  ['VITE_NEWS_API_KEY', env.newsApiKey],
  ['VITE_THE_GUARDIAN_API_KEY', env.guardianApiKey],
  ['VITE_NEW_YORK_TIMES_API_KEY', env.nytApiKey],
] as const;

export function assertRequiredEnv(): void {
  const missing = required
    .filter(([, value]) => !value?.trim())
    .map(([key]) => key);

  if (missing.length > 0) {
    throw new Error(
      `Missing env vars: ${missing.join(', ')}. Copy .env.example to .env and restart.`,
    );
  }
}
