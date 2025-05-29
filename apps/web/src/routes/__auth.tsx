import { authClient } from '@/lib/auth-client';
import { Outlet, createFileRoute, redirect } from '@tanstack/react-router';
import { useEffect } from 'react';

export const Route = createFileRoute('/__auth')({
  component: AuthLayout,
});

function AuthLayout() {
  const { data: sessionData, isPending } = authClient.useSession();

  useEffect(() => {
    if (!isPending && sessionData) {
      throw redirect({
        to: '/dashboard',
      });
    }
  }, [isPending, sessionData]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Outlet />
    </div>
  );
}
