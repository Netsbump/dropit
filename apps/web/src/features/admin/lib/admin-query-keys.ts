export const adminQueryKeys = {
  organizations: {
    all: () => ['admin', 'organizations'] as const,
    list: () => ['admin', 'organizations', 'list'] as const,
  },
  users: {
    all: () => ['admin', 'users'] as const,
    list: () => ['admin', 'users', 'list'] as const,
  },
};
