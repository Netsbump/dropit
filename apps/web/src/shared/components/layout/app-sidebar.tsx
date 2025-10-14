import { authClient } from '@/lib/auth-client';
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
  SidebarTrigger,
  useSidebar,
} from '@/shared/components/ui/sidebar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/shared/components/ui/tooltip';
import { useTranslation } from '@dropit/i18n';
import { Link, useMatches, useNavigate } from '@tanstack/react-router';
import {
  BicepsFlexed,
  Calendar,
  ChevronRight,
  GraduationCap,
  Home,
  LayoutDashboard,
  CircleQuestionMark,
  Settings,
} from 'lucide-react';

export function AppSidebar() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const matches = useMatches();
  const { data: session } = authClient.useSession();
  const { state } = useSidebar();

  // Function to get user initials from name
  const getUserInitials = (name?: string) => {
    if (!name) return 'U';
    const names = name.trim().split(' ');
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    return names[0].charAt(0).toUpperCase() + names[names.length - 1].charAt(0).toUpperCase();
  };

  const mainItems = [
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
  ];

  const footerItems = [
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
    <TooltipProvider delayDuration={0}>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem className="flex items-center justify-between">
              <SidebarMenuButton asChild size="lg" className="group-data-[collapsible=icon]:hidden">
                <Link to="/" className="flex items-center gap-2">
                  <BicepsFlexed className="h-6 w-6" />
                  <span className="text-lg font-bold">Dropit</span>
                </Link>
              </SidebarMenuButton>
              <SidebarTrigger />
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
                {mainItems.map((item) => {
                  const isActive = isActiveItem(item.url);
                  const menuButton = (
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
                  );

                  return (
                    <SidebarMenuItem key={item.title}>
                      {state === 'collapsed' ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            {menuButton}
                          </TooltipTrigger>
                          <TooltipContent side="right">
                            <p>{item.title}</p>
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        menuButton
                      )}
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarGroup>
            <SidebarMenu>
              {footerItems.map((item) => {
                const isActive = isActiveItem(item.url);
                const menuButton = (
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
                );

                return (
                  <SidebarMenuItem key={item.title}>
                    {state === 'collapsed' ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          {menuButton}
                        </TooltipTrigger>
                        <TooltipContent side="right">
                          <p>{item.title}</p>
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      menuButton
                    )}
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroup>
          <SidebarSeparator />
          <SidebarMenu>
            <SidebarMenuItem>
              {state === 'collapsed' ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <SidebarMenuButton className="h-12 px-2" onClick={() => navigate({ to: '/profile' })}>
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
                      <ChevronRight className="h-4 w-4 shrink-0" />
                    </SidebarMenuButton>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>{session?.user?.name || 'User'}</p>
                  </TooltipContent>
                </Tooltip>
              ) : (
                <SidebarMenuButton className="h-12 px-2" onClick={() => navigate({ to: '/profile' })}>
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
                  <ChevronRight className="h-4 w-4 shrink-0" />
                </SidebarMenuButton>
              )}
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
    </TooltipProvider>
  );
}
