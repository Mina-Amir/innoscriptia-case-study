export const env = {
  newsApiKey: import.meta.env.VITE_NEWS_API_KEY,
  guardianApiKey: import.meta.env.VITE_THE_GUARDIAN_API_KEY,
  nytApiKey: import.meta.env.VITE_NEW_YORK_TIMES_API_KEY,
} as const;
