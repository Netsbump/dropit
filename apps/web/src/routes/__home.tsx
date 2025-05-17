import { Outlet, createFileRoute } from '@tanstack/react-router';
import { AppSidebar } from '../shared/components/layout/app-sidebar';
import { Breadcrumbs } from '../shared/components/layout/breadcrumbs';
import { Separator } from '../shared/components/ui/separator';
import {
  SidebarProvider,
  SidebarTrigger,
} from '../shared/components/ui/sidebar';

export const Route = createFileRoute('/__home')({
  component: HomeLayout,
});

export default function HomeLayout() {
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
