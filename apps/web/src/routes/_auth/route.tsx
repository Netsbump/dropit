import { getBackOfficeAccessState } from '@/features/auth/auth-access';
import { Outlet, createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_auth')({
  beforeLoad: async () => {
    const accessState = await getBackOfficeAccessState();
    if (!accessState.isAuthenticated) return;

    throw redirect({
      to: accessState.hasBackOfficeAccess ? '/dashboard' : '/download-app',
    });
  },
  component: () => <Outlet />,
});
