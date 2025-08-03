import { authClient } from '@/lib/auth-client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { Separator } from '@/shared/components/ui/separator';
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
  User,
} from 'lucide-react';
import { useEffect, useState } from 'react';

export function AppSidebar() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const matches = useMatches();
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    // Récupérer l'email de l'utilisateur depuis le localStorage
    const email = localStorage.getItem('user_email');
    setUserEmail(email);
  }, []);

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
                      className={isActive ? 'bg-blue-50 text-blue-600 hover:bg-blue-100' : ''}
                    >
                      <Link to={item.url} className="flex items-center gap-2">
                        <item.icon className={`h-4 w-4 ${isActive ? 'text-blue-600' : ''}`} />
                        <span className={isActive ? 'text-blue-600 font-medium' : ''}>
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
                <SidebarMenuButton>
                  <User /> {userEmail || 'User'}
                  <ChevronUp className="ml-auto" />
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
