import { createAuthClient } from 'better-auth/react';
import { organizationClient, adminClient, emailOTPClient, inferAdditionalFields } from 'better-auth/client/plugins';
import config from '../config';

const authClient = createAuthClient({
  baseURL: config.apiUrl,
  plugins: [
    organizationClient(),
    adminClient(),
    emailOTPClient(),
    // Keep in sync with: apps/api/src/modules/auth/infrastructure/better-auth.adapter.ts → enrichSession()
    inferAdditionalFields({
      session: {
        athleteId: {
          type: 'string',
          required: false,
        },
      },
    }),
  ],
});

export { authClient };
