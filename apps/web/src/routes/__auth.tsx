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
      style={{
        background: 'linear-gradient(135deg, rgba(200, 180, 255, 0.5) 0%, rgba(180, 200, 255, 0.4) 20%, rgba(255, 200, 220, 0.3) 40%, rgba(255, 220, 200, 0.35) 60%, rgba(255, 200, 220, 0.4) 80%, rgba(220, 180, 255, 0.5) 100%)'
      }}
    >
      <Outlet />
    </div>
  );
}
