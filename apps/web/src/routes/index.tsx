import { authClient } from '@/lib/auth-client';
import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  beforeLoad: async () => {
    const session = await authClient.getSession();
    if (session) {
      throw redirect({
        to: '/dashboard',
      });
    }
    throw redirect({
      to: '/login',
    });
  },
});
