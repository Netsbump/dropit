import { authClient } from '@/lib/auth-client';
import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  beforeLoad: async () => {
    // Route racine : toujours rediriger vers login
    // C'est la route /login qui gérera la redirection si l'utilisateur est déjà connecté
    throw redirect({ to: '/login' });
  },
});
