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
import { useTranslation } from '@dropit/i18n';
import { Link } from '@tanstack/react-router';
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

export function AppSidebar() {
  const { t } = useTranslation();

  const items = [
    {
      title: t('sidebar.menu.dashboard'),
      url: '/',
      icon: Home,
    },
    {
      title: t('sidebar.menu.programming'),
      url: '/workouts',
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
          <SidebarGroupLabel>{t('sidebar.sections.application')}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link to={item.url} className="flex items-center gap-2">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
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
                  <User /> Username
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
                <DropdownMenuItem>
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
