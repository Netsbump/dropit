import { createAuthClient } from 'better-auth/react';
import { organizationClient } from 'better-auth/client/plugins';
import { ac, owner, admin, member } from '@dropit/permissions';

const authClient = createAuthClient({
  baseURL: 'http://localhost:3000',
  plugins: [organizationClient({
    // biome-ignore lint/suspicious/noExplicitAny: Better Auth type compatibility
    ac: ac as any,
    roles: {
      owner,
      admin,
      member,
    }
  })],
});

export { authClient };
