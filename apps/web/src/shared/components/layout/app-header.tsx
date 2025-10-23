import { Link, useMatches, useRouter } from '@tanstack/react-router';
import { ChevronLeft } from 'lucide-react';
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
  const middleContent = pageMeta.middleContent;

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
    <header className="h-20 flex items-center justify-between pr-3 pl-4">
      {/* Left side: Back button OR Page Title */}
      <div className="flex items-center gap-3 min-w-0 pl-3">
        {showBackButton ? (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={handleBackClick}
              className="h-8 w-8 px-3 rounded-full border bg-outlet text-black hover:bg-white/80 flex items-center gap-2"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <span className="text-sm font-medium text-[hsl(var(--appheader-foreground))]">{t('common.back')}</span>
          </div>
        ) : pageTitle ? (
          <h1 className="text-xl font-medium truncate text-[hsl(var(--appheader-foreground))]">
            {pageTitle}
          </h1>
        ) : null}
      </div>

      {/* Center: Custom Content OR Detail Title OR Tabs */}
      {middleContent ? (
        <div className="absolute left-1/2 -translate-x-1/2">
          {middleContent}
        </div>
      ) : showBackButton && pageTitle ? (
        <h1 className="absolute left-1/2 -translate-x-1/2 text-medium font-semibold uppercase text-[hsl(var(--appheader-foreground))]">
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
                    ? 'text-[hsl(var(--appheader-tab-active))] font-semibold'
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
      <div className="flex gap-3 items-center">
        {/* Notifications */}

        {/* User Profile */}
        <Link to="/profile">
          <Button variant="ghost" className="h-auto py-2 rounded-full border bg-outlet hover:bg-purple-100 hover:border-purple-500 gap-3 transition-all">
            <Avatar className="h-10 w-10 shadow-sm">
              <AvatarFallback className="bg-purple-600 text-white text-sm font-bold">
                {getUserInitials(session?.user?.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-start">
              <span className="text-sm font-medium text-[hsl(var(--appheader-foreground))] leading-tight">
                {session?.user?.name || 'User'}
              </span>
              <span className="text-xs text-[hsl(var(--appheader-foreground))]/60 leading-tight">
                Coach
              </span>
            </div>
          </Button>
        </Link>
      </div>
    </header>
  );
}
