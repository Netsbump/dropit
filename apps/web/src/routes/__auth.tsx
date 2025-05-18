import { Outlet, createFileRoute, redirect } from '@tanstack/react-router';
import { useAuth } from '../shared/hooks/use-auth';
import { isAuthenticated } from '../shared/utils/auth';

export const Route = createFileRoute('/__auth')({
  beforeLoad: () => {
    // Quick check to avoid unnecessary redirects
    // This will be replaced with a full cookie check in the future
    if (isAuthenticated()) {
      throw redirect({
        to: '/dashboard',
      });
    }
  },
  component: AuthLayout,
});

function AuthLayout() {
  // Use the auth hook to verify authentication with the API
  const { isAuthenticated, isLoading } = useAuth();

  // If authenticated after API check, redirect to dashboard
  if (!isLoading && isAuthenticated) {
    throw redirect({
      to: '/dashboard',
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Outlet />
    </div>
  );
}
