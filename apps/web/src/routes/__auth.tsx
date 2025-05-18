import { Outlet, createFileRoute, redirect } from '@tanstack/react-router';
import { isAuthenticated } from '../shared/utils/auth';

export const Route = createFileRoute('/__auth')({
  beforeLoad: () => {
    // If authenticated, redirect to dashboard
    if (isAuthenticated()) {
      throw redirect({
        to: '/dashboard',
      });
    }
  },
  component: AuthLayout,
});

function AuthLayout() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Outlet />
    </div>
  );
}
