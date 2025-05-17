import { Outlet, createRootRoute, redirect } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';

// Définition de la route principale
export const Route = createRootRoute({
  component: RootLayout,
  beforeLoad: ({ location }) => {
    // Simplified example - replace with your actual auth check
    const isAuthenticated = localStorage.getItem('auth_token');

    // Skip checks for the root route, handled by index.tsx
    if (location.pathname === '/') return;

    // Check if current path is an auth route
    const isAuthRoute = location.pathname.includes('/auth');

    // If not authenticated and not on an auth route, redirect to login
    if (!isAuthenticated && !isAuthRoute) {
      throw redirect({
        to: '/login',
      });
    }

    // If authenticated and on an auth route, redirect to home
    if (isAuthenticated && isAuthRoute) {
      throw redirect({
        to: '/dashboard',
      });
    }
  },
});

function RootLayout() {
  return (
    <div className="min-h-screen">
      <Outlet />
      <TanStackRouterDevtools position="bottom-right" />
    </div>
  );
}
