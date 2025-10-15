import { authClient } from '@/lib/auth-client';
import { useToast } from '@/shared/hooks/use-toast';
import { useTranslation } from '@dropit/i18n';
import { Link, useMatches, useNavigate } from '@tanstack/react-router';
import {
  BicepsFlexed,
  Calendar,
  GraduationCap,
  Home,
  LayoutDashboard,
  CircleQuestionMark,
  Settings,
  LogOut,
} from 'lucide-react';

export function AppSidebar() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const matches = useMatches();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      // Appeler directement l'API pour se déconnecter
      // Avec credentials: 'include', les cookies seront automatiquement envoyés
      await authClient.signOut();

      // Rediriger vers la page de connexion
      toast({
        title: 'Logout successful',
        description: 'You have been logged out successfully',
      });

      navigate({ to: '/', replace: true });
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);

      toast({
        title: 'Logout issue',
        description:
          'You have been logged out but there was an issue contacting the server',
        variant: 'destructive',
      });

      navigate({ to: '/', replace: true });
    }
  };

  const items = [
    {
      title: t('sidebar.menu.dashboard'),
      url: '/dashboard',
      icon: Home,
    },
    {
      title: t('sidebar.menu.library'),
      url: '/library/workouts',
      icon: LayoutDashboard,
    },
    {
      title: t('sidebar.menu.calendar'),
      url: '/planning',
      icon: Calendar,
    },
    {
      title: t('sidebar.menu.athletes'),
      url: '/athletes',
      icon: GraduationCap,
    },
    {
      title: t('sidebar.menu.help'),
      url: '/help',
      icon: CircleQuestionMark,
    },
    {
      title: t('sidebar.menu.settings'),
      url: '/settings',
      icon: Settings,
    },
  ];

  // Fonction pour vérifier si un item est actif
  const isActiveItem = (itemUrl: string) => {
    const currentPath = matches[matches.length - 1]?.pathname || '';

    // Gestion spéciale pour les routes imbriquées
    if (itemUrl === '/library/workouts') {
      return currentPath.startsWith('/library/') || currentPath.startsWith('/workouts/');
    }

    if (itemUrl === '/athletes') {
      return currentPath.startsWith('/athletes');
    }

    if (itemUrl === '/dashboard') {
      return currentPath === '/dashboard' || currentPath === '/';
    }

    return currentPath === itemUrl;
  };

  return (
    <aside className="w-[90px] h-screen bg-slate-700 flex flex-col items-center py-6 gap-8">
      {/* Logo */}
      <div className="flex flex-col items-center gap-1 text-white">
        <BicepsFlexed className="h-8 w-8" />
        <span className="text-xs font-semibold">Dropit</span>
      </div>

      {/* Main Menu */}
      <nav className="flex-1 flex flex-col justify-center">
        {items.map((item) => {
          const isActive = isActiveItem(item.url);
          return (
            <Link
              key={item.title}
              to={item.url}
              className="flex flex-col items-center gap-1.5 px-4 py-3 transition-colors hover:text-white"
            >
              <div className={`flex items-center justify-center h-12 w-12 rounded-full transition-colors ${
                isActive
                  ? 'bg-white text-slate-700'
                  : 'text-slate-300'
              }`}>
                <item.icon className="h-6 w-6" />
              </div>
              <span className={`text-[10px] font-medium text-center leading-tight uppercase ${
                isActive ? 'text-white' : 'text-slate-300'
              }`}>
                {item.title}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="flex flex-col items-center gap-1.5 px-4 py-3 text-slate-300 hover:text-white transition-colors"
        type="button"
      >
        <div className="flex items-center justify-center h-12 w-12 rounded-full hover:bg-white/5 transition-colors">
          <LogOut className="h-6 w-6" />
        </div>
        <span className="text-[10px] font-medium text-center leading-tight uppercase">
          {t('sidebar.user.logout')}
        </span>
      </button>
    </aside>
  );
}
