import { authClient } from '@/lib/auth-client';
import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  beforeLoad: async () => {
    const session = await authClient.getSession();
    if (session) {
      // TODO: Vérifier si l'utilisateur est un coach et s'il a une organisation
      // Pour l'instant, rediriger vers le dashboard
      throw redirect({
        to: '/dashboard',
      });
    }
    throw redirect({
      to: '/login',
    });
  },
});
