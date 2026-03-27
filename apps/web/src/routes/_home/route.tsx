import { Outlet, createFileRoute, redirect, useMatches } from '@tanstack/react-router';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { AppHeader } from '@/components/layout/app-header';
import { authClient } from '@/lib/auth-client';
import { useTranslation } from '@dropit/i18n';
import { PageMetaProvider } from '@/hooks/use-page-meta';

export const Route = createFileRoute('/_home')({
  beforeLoad: async () => {
    const session = await authClient.getSession();
    if (!session?.data) {
      throw redirect({ to: '/login' });
    }

    const activeMember = await authClient.organization.getActiveMember();
    //TODO: Redirect into specific route if no active member
    if (!activeMember?.data) {
      throw redirect({ to: '/login' });
    }

    const orgRole = activeMember.data.role;
    const isSuperAdmin = session.data.user?.role === 'admin';

    // Only coaches (org admin) and super admins can access the dashboard
    if (orgRole !== 'admin' && !isSuperAdmin) {
      throw redirect({ to: '/download-app' });
    }
  },
  component: HomeLayout,
});

function HomeLayout() {
  const matches = useMatches();
  const { t } = useTranslation();
  const currentPath = matches[matches.length - 1]?.pathname || '';

  // Define tabs based on the active route
  const getTabs = () => {
    if (currentPath.startsWith('/library')) {
      return [
        { label: t('library.tabs.workouts'), path: '/library/workouts' },
        { label: t('library.tabs.complex'), path: '/library/complex' },
        { label: t('library.tabs.exercises'), path: '/library/exercises' },
      ];
    }
    // We can add other conditions for other sections with tabs
    return undefined;
  };

  return (
    <PageMetaProvider>
      <div className="min-h-screen w-full">
        <div className="h-screen w-full glass-container flex">
          <AppSidebar />

          <main className="flex-1 flex flex-col">
            <AppHeader tabs={getTabs()} />

            <div className="flex-1 min-h-0 pb-3 px-3 pt-0 ">
              <div className="rounded-3xl h-full overflow-hidden shadow-none border bg-outlet">
                <Outlet />
              </div>
            </div>
          </main>
        </div>
      </div>
    </PageMetaProvider>
  );
}
