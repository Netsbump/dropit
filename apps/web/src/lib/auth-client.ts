import { createAuthClient } from 'better-auth/react';
import { organizationClient, adminClient } from 'better-auth/client/plugins';
import config from '../config';

const authClient = createAuthClient({
  baseURL: config.apiUrl,
  plugins: [organizationClient(), adminClient()],
});

export { authClient };
