import { Separator } from '@/components/ui/separator';
import { Outlet, createRootRoute } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';
import { AppSidebar } from '../components/app-sidebar';
import { Breadcrumbs } from '../components/breadcrumbs';
import { SidebarProvider, SidebarTrigger } from '../components/ui/sidebar';

export const Route = createRootRoute({
  component: () => (
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
            <div className="p-4">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
      <TanStackRouterDevtools />
    </SidebarProvider>
  ),
});
