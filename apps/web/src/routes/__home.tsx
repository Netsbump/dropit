import { Outlet, createFileRoute, redirect, useMatches } from '@tanstack/react-router';
import { AppSidebar } from '../shared/components/layout/app-sidebar';
import { AppHeader } from '../shared/components/layout/app-header';
import { authClient } from '../lib/auth-client';
import { useTranslation } from '@dropit/i18n';
import { PageMetaProvider } from '../shared/hooks/use-page-meta';

export const Route = createFileRoute('/__home')({
  beforeLoad: async () => {
    const session = await authClient.getSession();
    if (!session) {
      throw redirect({ to: '/login' });
    }

    try {
      // Vérifier si l'utilisateur a un membre actif dans une organisation
      const activeMember = await authClient.organization.getActiveMember();
      if (!activeMember?.data) {
        throw redirect({ to: '/onboarding' });
      }

      // Vérifier le rôle de l'utilisateur - seuls les coachs peuvent accéder au dashboard
      const userRole = activeMember.data.role;

      // Si c'est un membre (athlète), rediriger vers download-app
      if (userRole === 'member') {
        throw redirect({ to: '/download-app' });
      }

      // Les owner et admin peuvent continuer
      if (userRole !== 'owner' && userRole !== 'admin') {
        throw redirect({ to: '/download-app' });
      }
    } catch (error) {
      // Si erreur lors de la récupération du membre actif, rediriger vers onboarding
      throw redirect({ to: '/onboarding' });
    }
  },
  component: HomeLayout,
});

function HomeLayout() {
  const matches = useMatches();
  const { t } = useTranslation();
  const currentPath = matches[matches.length - 1]?.pathname || '';

  // Définir les tabs selon la route active
  const getTabs = () => {
    if (currentPath.startsWith('/library')) {
      return [
        { label: t('library.tabs.workouts'), path: '/library/workouts' },
        { label: t('library.tabs.complex'), path: '/library/complex' },
        { label: t('library.tabs.exercises'), path: '/library/exercises' },
      ];
    }
    // On peut ajouter d'autres conditions pour d'autres sections avec tabs
    return undefined;
  };

  return (
    <PageMetaProvider>
      <div className="flex min-h-screen w-full bg-slate-700">
        <AppSidebar />

        <main className="flex-1 w-full h-screen flex flex-col">
          <AppHeader tabs={getTabs()} />

          <div className="flex-1 min-h-0 pb-3 px-3 pt-0">
            <div className="bg-white rounded-3xl h-full shadow-xl overflow-auto">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </PageMetaProvider>
  );
}
