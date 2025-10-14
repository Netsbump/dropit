import { Link, useMatches, useNavigate, useRouter } from '@tanstack/react-router';
import { ChevronLeft, Bell } from 'lucide-react';
import { authClient } from '@/lib/auth-client';
import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar';
import { Button } from '@/shared/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { useTranslation } from '@dropit/i18n';

interface Tab {
  label: string;
  path: string;
}

interface AppHeaderProps {
  tabs?: Tab[];
  showBackButton?: boolean;
  onBackClick?: () => void;
}

export function AppHeader({ tabs, showBackButton = false, onBackClick }: AppHeaderProps) {
  const matches = useMatches();
  const navigate = useNavigate();
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const { t } = useTranslation();

  // Function to get user initials from name
  const getUserInitials = (name?: string) => {
    if (!name) return 'U';
    const names = name.trim().split(' ');
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    return names[0].charAt(0).toUpperCase() + names[names.length - 1].charAt(0).toUpperCase();
  };

  const handleBackClick = () => {
    if (onBackClick) {
      onBackClick();
    } else {
      router.history.back();
    }
  };

  const currentPath = matches[matches.length - 1]?.pathname || '';

  return (
    <header className="h-16 bg-slate-700 flex items-center justify-between px-6">
      {/* Left side: Back button and Tabs */}
      <div className="flex items-center gap-4 flex-1  justify-center">
        {showBackButton && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBackClick}
            className="h-8 w-8 text-white hover:bg-white/10"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
        )}

        {tabs && tabs.length > 0 && (
          <nav className="flex gap-6 h-16 items-center">
            {tabs.map((tab) => {
              const isActive = currentPath === tab.path || currentPath.startsWith(`${tab.path}/`);
              return (
                <Link
                  key={tab.path}
                  to={tab.path}
                  className={`px-3 transition-all uppercase ${
                    isActive
                      ? 'text-white font-medium'
                      : 'text-white/40 hover:text-white/70'
                  }`}
                >
                  {tab.label}
                </Link>
              );
            })}
          </nav>
        )}
      </div>

      {/* Right side: Notifications and User Menu */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <Button variant="ghost" size="icon" className="h-9 w-9 relative text-white hover:bg-white/10">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full" />
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-9 w-9 rounded-full p-0 hover:bg-white/10">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-white text-slate-700 text-sm font-medium">
                  {getUserInitials(session?.user?.name)}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {session?.user?.name || 'User'}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {session?.user?.email || 'user@example.com'}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate({ to: '/profile' })}>
              {t('sidebar.user.profile')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate({ to: '/settings' })}>
              {t('sidebar.user.settings')}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-600"
              onClick={async () => {
                await authClient.signOut();
                navigate({ to: '/login' });
              }}
            >
              {t('sidebar.user.logout')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
