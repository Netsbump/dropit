import { Outlet, createRootRoute } from '@tanstack/react-router';
import { Toaster } from '@/components/ui/toaster';
//import { TanStackRouterDevtools } from '@tanstack/router-devtools';

// Root route definition
export const Route = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  return (
    <div className="min-h-screen">
      <Outlet />
      <Toaster />
      {/* {process.env.NODE_ENV === 'development' && (
        <TanStackRouterDevtools position="bottom-right" />
      )} */}
    </div>
  );
}
