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

const items = [
  {
    title: 'Tableau de bord',
    url: '/',
    icon: Home,
  },
  {
    title: 'Programmation',
    url: '/programs',
    icon: LayoutDashboard,
  },
  {
    title: 'Calendrier',
    url: '/planning',
    icon: Calendar,
  },
  {
    title: 'Athlètes',
    url: '/athletes',
    icon: GraduationCap,
  },
  {
    title: 'Aide & Support',
    url: '/about',
    icon: LifeBuoy,
  },
];

export function AppSidebar() {
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
          <SidebarGroupLabel>Application</SidebarGroupLabel>
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
                  <span>Profil</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <span>Réglages</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <span>Aide</span>
                </DropdownMenuItem>
                <Separator />
                <DropdownMenuItem>
                  <span>Déconnexion</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
