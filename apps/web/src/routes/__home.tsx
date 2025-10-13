import { Outlet, createFileRoute, redirect } from '@tanstack/react-router';
import { AppSidebar } from '../shared/components/layout/app-sidebar';
//import { Breadcrumbs } from '../shared/components/layout/breadcrumbs';
import { Separator } from '../shared/components/ui/separator';
import {
  SidebarProvider,
  SidebarTrigger,
} from '../shared/components/ui/sidebar';
import { authClient } from '../lib/auth-client';

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
  return (
    <SidebarProvider className="w-full">
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <main className="flex-1 w-full h-screen">
          <div className="h-full w-full flex flex-col">
            <div className="px-4 pt-6 pb-4 flex-1 min-h-0 overflow-hidden">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
