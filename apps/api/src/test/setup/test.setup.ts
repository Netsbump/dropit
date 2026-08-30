import 'reflect-metadata';
import { beforeAll, vi } from 'vitest';

process.env.NODE_ENV = 'test';

process.env.API_PORT ??= '3000';
process.env.APP_URL ??= 'http://localhost:5173';
process.env.BETTER_AUTH_SECRET ??= 'test-secret-key';
process.env.TRUSTED_ORIGINS ??= 'http://localhost:3000,http://localhost:5173';

process.env.DB_HOST =
  process.env.DB_HOST_TEST ?? process.env.DB_HOST ?? 'localhost';
process.env.DB_PORT = process.env.DB_PORT_TEST ?? process.env.DB_PORT ?? '5433';
process.env.DB_USER =
  process.env.DB_USER_TEST ?? process.env.DB_USER ?? 'postgres';
process.env.DB_PASSWORD =
  process.env.DB_PASSWORD_TEST ?? process.env.DB_PASSWORD ?? 'example';
process.env.DB_NAME =
  process.env.DB_NAME_TEST ?? process.env.DB_NAME ?? 'dropit_test';

beforeAll(() => {
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
});

vi.mock('better-auth', () => ({
  betterAuth: vi.fn(() => ({
    api: {
      getSession: vi.fn(),
    },
  })),
  User: {},
}));

vi.mock('better-auth/api', () => ({
  createAuthMiddleware: vi.fn(),
}));

vi.mock('better-auth/plugins', () => ({
  openAPI: vi.fn(),
}));

vi.mock('better-auth/plugins/organization', () => ({
  organization: vi.fn(() => ({
    id: 'organization',
    endpoints: {},
  })),
}));
