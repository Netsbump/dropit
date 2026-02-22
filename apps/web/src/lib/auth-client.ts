import { createAuthClient } from 'better-auth/react';
import { organizationClient, adminClient, emailOTPClient } from 'better-auth/client/plugins';
import config from '../config';

const authClient = createAuthClient({
  baseURL: config.apiUrl,
  plugins: [organizationClient(), adminClient(), emailOTPClient()],
});

export { authClient };
