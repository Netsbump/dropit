import { Outlet, createFileRoute, redirect } from '@tanstack/react-router';
import { AppSidebar } from '../shared/components/layout/app-sidebar';
import { Breadcrumbs } from '../shared/components/layout/breadcrumbs';
import { Separator } from '../shared/components/ui/separator';
import {
  SidebarProvider,
  SidebarTrigger,
} from '../shared/components/ui/sidebar';
import { useAuth } from '../shared/hooks/use-auth';
import { isAuthenticated } from '../shared/utils/auth';

export const Route = createFileRoute('/__home')({
  beforeLoad: () => {
    // Quick check to avoid unnecessary redirects
    // This will be replaced with a full cookie check in the future
    if (!isAuthenticated()) {
      throw redirect({
        to: '/login',
      });
    }
  },
  component: HomeLayout,
});

function HomeLayout() {
  // Use the auth hook to verify authentication with the API
  const { isAuthenticated, isLoading } = useAuth();

  // If not authenticated after API check, redirect to login
  if (!isLoading && !isAuthenticated) {
    throw redirect({
      to: '/login',
    });
  }

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <SidebarProvider className="w-full">
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <main className="flex-1 overflow-auto w-full">
          <div className="h-full w-full">
            <div className="flex items-center p-2 border-b gap-2">
              <SidebarTrigger />
              <Separator orientation="vertical" className="h-6" />
              <Breadcrumbs />
            </div>
            <div className="px-4 pt-10">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
