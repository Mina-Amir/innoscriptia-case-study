import '@testing-library/jest-dom/vitest';
import { QueryClient } from '@tanstack/react-query';
import { afterAll, afterEach, beforeAll } from 'vitest';
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

beforeAll(() => server.listen());

afterEach(() => {
  server.resetHandlers();
  queryClient.clear();
});

afterAll(() => server.close());
