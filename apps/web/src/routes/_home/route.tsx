import {
  Outlet,
  createFileRoute,
  redirect,
  useMatches,
} from '@tanstack/react-router';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { AppHeader } from '@/components/layout/app-header';
import { useTranslation } from '@dropit/i18n';
import { PageMetaProvider } from '@/hooks/use-page-meta';
import { getBackOfficeAccessState } from '@/features/auth/auth-access';
import { getHeaderTabs } from '@/features/navigation/header-tabs';

export const Route = createFileRoute('/_home')({
  beforeLoad: async () => {
    const accessState = await getBackOfficeAccessState();

    if (!accessState.isAuthenticated) {
      throw redirect({ to: '/login' });
    }

    // Only coaches (org admin) and super admins can access the dashboard
    if (!accessState.hasBackOfficeAccess) {
      throw redirect({ to: '/download-app' });
    }
  },
  component: HomeLayout,
});

function HomeLayout() {
  const matches = useMatches();
  const { t } = useTranslation();
  //TODO: Ugly, need changes
  const currentPath = matches[matches.length - 1]?.pathname || '';

  const tabs = getHeaderTabs(currentPath, t);

  return (
    <PageMetaProvider>
      <div className="min-h-screen w-full">
        <div className="h-screen w-full max-w-app mx-auto glass-container flex">
          <AppSidebar />

          <main className="flex-1 min-w-0 flex flex-col">
            <AppHeader tabs={tabs} />

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
