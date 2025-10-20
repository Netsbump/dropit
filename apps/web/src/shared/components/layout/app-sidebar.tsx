import { authClient } from '@/lib/auth-client';
import { useToast } from '@/shared/hooks/use-toast';
import { useTranslation } from '@dropit/i18n';
import { Link, useMatches, useNavigate } from '@tanstack/react-router';
import {
  BicepsFlexed,
  Calendar,
  GraduationCap,
  Home,
  BookOpen,
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
      // Call the API directly to logout
      // With credentials: 'include', the cookies will be automatically sent
      await authClient.signOut();

      // Redirect to the login page
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

  const mainItems = [
    {
      title: t('sidebar.menu.dashboard'),
      url: '/dashboard',
      icon: Home,
    },
    {
      title: t('sidebar.menu.library'),
      url: '/library/workouts',
      icon: BookOpen,
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
  ]

  const secondaryItems = [
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

  // Function to check if an item is active
  const isActiveItem = (itemUrl: string) => {
    const currentPath = matches[matches.length - 1]?.pathname || '';

    // Special handling for nested routes
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
    <aside className="w-[200px] h-screen flex flex-col py-6 px-4 gap-8">
      {/* Logo */}
      <div className="flex items-center gap-2 px-2">
        <BicepsFlexed className="h-7 w-7 stroke-[2.5] text-[hsl(var(--sidebar-logo))]" />
        <span className="text-base font-bold text-[hsl(var(--sidebar-logo))]">Dropit</span>
      </div>

      {/* Main Menu */}
      <nav className="flex-1 flex flex-col gap-1">
        {mainItems.map((item) => {
          const isActive = isActiveItem(item.url);
          return (
            <Link
              key={item.title}
              to={item.url}
              className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all ${
                isActive
                  ? 'bg-[hsl(var(--sidebar-accent))]/20 backdrop-blur-sm text-[hsl(var(--sidebar-accent-foreground))] border border-[hsl(var(--sidebar-accent))]/30'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent/10'
              }`}
            >
              <item.icon className="h-5 w-5 stroke-[2.5]" />
              <span className="text-sm font-semibold uppercase">
                {item.title}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Secondary Menu (Aide, Réglages, Déconnexion) */}
      <div className="flex flex-col gap-1">
        {secondaryItems.map((item) => {
          const isActive = isActiveItem(item.url);
          return (
            <Link
              key={item.title}
              to={item.url}
              className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all ${
                isActive
                  ? 'bg-[hsl(var(--sidebar-accent))]/20 backdrop-blur-sm text-[hsl(var(--sidebar-accent-foreground))] border border-[hsl(var(--sidebar-accent))]/30'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent/10'
              }`}
            >
              <item.icon className="h-5 w-5 stroke-[2.5]" />
              <span className="text-sm font-semibold uppercase">
                {item.title}
              </span>
            </Link>
          );
        })}

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-3 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent/50 transition-all"
          type="button"
        >
          <LogOut className="h-5 w-5 stroke-[2.5]" />
          <span className="text-sm font-semibold uppercase">
            {t('sidebar.user.logout')}
          </span>
        </button>
      </div>
    </aside>
  );
}
