import { authClient } from '@/lib/auth-client';
import { Outlet, createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';

export const Route = createFileRoute('/__auth')({
  component: AuthLayout,
});

function AuthLayout() {
  const { data: session, isPending } = authClient.useSession();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isPending && session) {
      navigate({ to: '/dashboard' });
    }
  }, [isPending, session, navigate]);

  if (isPending) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center">
        Loading...
      </div>
    );
  }

  if (session) {
    return null;
  }
  
  return (
    <div
      className="min-h-screen flex items-center justify-center"
    >
      <Outlet />
    </div>
  );
}
