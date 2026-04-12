import { getSession } from '@/features/auth/auth-queries';
import { Outlet, createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_auth')({
  beforeLoad: async () => {
    const { data: session } = await getSession();
    if (session) throw redirect({ to: '/dashboard' });
  },
  component: () => <Outlet />,
});

