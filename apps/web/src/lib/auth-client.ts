import { createAuthClient } from 'better-auth/react';
import { organizationClient } from 'better-auth/client/plugins';

const authClient = createAuthClient({
  baseURL: 'http://localhost:3000',
  plugins: [organizationClient()],
});

export { authClient };
