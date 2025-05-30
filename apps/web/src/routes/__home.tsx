import { authClient } from '@/lib/auth-client';
import { Outlet, createFileRoute, useNavigate } from '@tanstack/react-router';
import { AppSidebar } from '../shared/components/layout/app-sidebar';
import { Breadcrumbs } from '../shared/components/layout/breadcrumbs';
import { Separator } from '../shared/components/ui/separator';
import {
  SidebarProvider,
  SidebarTrigger,
} from '../shared/components/ui/sidebar';
import { useEffect } from 'react';

export const Route = createFileRoute('/__home')({
  component: HomeLayout,
});

function HomeLayout() {
  const { data: session, isPending } = authClient.useSession();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isPending && !session) {
      navigate({ to: '/login' });
    }
  }, [isPending, session, navigate]);

  if (isPending) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!session) {
    return null;
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
