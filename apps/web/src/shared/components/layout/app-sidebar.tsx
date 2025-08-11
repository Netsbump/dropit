import { authClient } from '@/lib/auth-client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { Separator } from '@/shared/components/ui/separator';
import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from '@/shared/components/ui/sidebar';
import { toast } from '@/shared/hooks/use-toast';
import { useTranslation } from '@dropit/i18n';
import { Link, useMatches, useNavigate } from '@tanstack/react-router';
import {
  BicepsFlexed,
  Calendar,
  ChevronUp,
  GraduationCap,
  Home,
  LayoutDashboard,
  LifeBuoy,
} from 'lucide-react';

export function AppSidebar() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const matches = useMatches();
  const { data: session } = authClient.useSession();

  // Function to get user initials from name
  const getUserInitials = (name?: string) => {
    if (!name) return 'U';
    const names = name.trim().split(' ');
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    return names[0].charAt(0).toUpperCase() + names[names.length - 1].charAt(0).toUpperCase();
  };

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
      title: t('sidebar.menu.programming'),
      url: '/programs/workouts',
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
      url: '/about',
      icon: LifeBuoy,
    },
  ];

  // Fonction pour vérifier si un item est actif
  const isActiveItem = (itemUrl: string) => {
    const currentPath = matches[matches.length - 1]?.pathname || '';
    
    // Gestion spéciale pour les routes imbriquées
    if (itemUrl === '/programs/workouts') {
      return currentPath.startsWith('/programs/') || currentPath.startsWith('/workouts/');
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
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link to="/" className="flex items-center gap-2">
                <BicepsFlexed className="h-6 w-6" />
                <span className="text-lg font-bold">Dropit</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            {t('sidebar.sections.application')}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const isActive = isActiveItem(item.url);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild
                      className={isActive ? 'bg-white text-gray-900 hover:bg-gray-50 rounded-lg shadow-sm border border-gray-200' : 'hover:bg-gray-100'}
                    >
                      <Link to={item.url} className="flex items-center gap-2">
                        <item.icon className={`h-4 w-4 ${isActive ? 'text-gray-700' : ''}`} />
                        <span className={isActive ? 'text-gray-900 font-medium' : ''}>
                          {item.title}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarSeparator />
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="h-12 px-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-white text-sm font-medium flex items-center justify-center">
                      {getUserInitials(session?.user?.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start min-w-0 flex-1">
                    <span className="text-sm font-medium truncate">
                      {session?.user?.name || 'User'}
                    </span>
                    <span className="text-xs text-muted-foreground truncate">
                      {session?.user?.email || 'user@example.com'}
                    </span>
                  </div>
                  <ChevronUp className="h-4 w-4 shrink-0" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                className="w-[--radix-popper-anchor-width]"
              >
                <DropdownMenuItem>
                  <span>{t('sidebar.user.profile')}</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <span>{t('sidebar.user.settings')}</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <span>{t('sidebar.user.help')}</span>
                </DropdownMenuItem>
                <Separator />
                <DropdownMenuItem onClick={handleLogout}>
                  <span>{t('sidebar.user.logout')}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
