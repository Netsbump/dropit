import { Link, useMatches, useRouter } from '@tanstack/react-router';
import { ChevronLeft, Bell } from 'lucide-react';
import { authClient } from '@/lib/auth-client';
import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar';
import { Button } from '@/shared/components/ui/button';
import { usePageMeta } from '@/shared/hooks/use-page-meta';
import { useTranslation } from '@dropit/i18n';
interface Tab {
  label: string;
  path: string;
}

interface AppHeaderProps {
  tabs?: Tab[];
}

export function AppHeader({ tabs }: AppHeaderProps) {
  const matches = useMatches();
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const { pageMeta } = usePageMeta();
  const { t } = useTranslation();
  const pageTitle = pageMeta.title;
  const showBackButton = pageMeta.showBackButton || false;
  const onBackClick = pageMeta.onBackClick;

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
    <header className="h-16 flex items-center justify-between pr-6">
      {/* Left side: Back button OR Page Title */}
      <div className="flex items-center gap-3 min-w-0 pl-11">
        {showBackButton ? (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={handleBackClick}
              className="h-8 w-8 px-3 rounded-full bg-white text-black hover:bg-white/80 flex items-center gap-2 shadow-md"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <span className="text-sm font-bold text-[hsl(var(--appheader-foreground))]">{t('common.back')}</span>
          </div>
        ) : pageTitle ? (
          <h1 className="text-xl font-extrabold truncate uppercase text-[hsl(var(--appheader-foreground))]">
            {pageTitle}
          </h1>
        ) : null}
      </div>

      {/* Center: Detail Title OR Tabs */}
      {showBackButton && pageTitle ? (
        <h1 className="absolute left-1/2 -translate-x-1/2 text-medium font-extrabold uppercase text-[hsl(var(--appheader-foreground))]">
          {pageTitle}
        </h1>
      ) : tabs && tabs.length > 0 ? (
        <nav className="flex gap-6 h-16 items-center absolute left-1/2 -translate-x-1/2">
          {tabs.map((tab) => {
            const isActive = currentPath === tab.path || currentPath.startsWith(`${tab.path}/`);
            return (
              <Link
                key={tab.path}
                to={tab.path}
                className={`px-3 transition-all uppercase text-sm ${
                  isActive
                    ? 'text-[hsl(var(--appheader-tab-active))] font-extrabold'
                    : 'text-[hsl(var(--appheader-tab-inactive))] hover:text-[hsl(var(--appheader-tab-active))] font-semibold'
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>
      ) : null}

      {/* Right side: Notifications and User Menu */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <Button variant="ghost" size="icon" className="h-9 w-9 relative text-[hsl(var(--appheader-foreground))] hover:bg-white/50">
          <Bell className="h-5 w-5 stroke-[2.5]" />
          <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full shadow-sm" />
        </Button>

        {/* User Profile */}
        <Link to="/profile">
          <Button variant="ghost" className="h-9 w-9 rounded-full p-0 hover:bg-white/50">
            <Avatar className="h-9 w-9 shadow-md">
              <AvatarFallback className="bg-white text-[hsl(var(--appheader-foreground))] text-sm font-bold">
                {getUserInitials(session?.user?.name)}
              </AvatarFallback>
            </Avatar>
          </Button>
        </Link>
      </div>
    </header>
  );
}
