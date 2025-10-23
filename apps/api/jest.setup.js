// Jest setup file to suppress console logs during tests
beforeAll(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});

// Mock better-auth to avoid ESM dependencies issues
jest.mock('better-auth', () => ({
  betterAuth: jest.fn(() => ({
    api: {
      getSession: jest.fn(),
    },
  })),
  User: {},
}));

jest.mock('better-auth/api', () => ({
  createAuthMiddleware: jest.fn(),
}));

jest.mock('better-auth/plugins', () => ({
  openAPI: jest.fn(),
}));

jest.mock('better-auth/plugins/organization', () => ({
  organization: jest.fn(() => ({
    id: 'organization',
    endpoints: {},
  })),
})); 