import { createFileRoute, redirect } from '@tanstack/react-router';
import { getSession } from '@/features/auth/auth-queries';

export const Route = createFileRoute('/')({
  beforeLoad: async () => {
    const { data: session } = await getSession();
    throw redirect({ to: session ? '/dashboard' : '/login' });
  },
});
