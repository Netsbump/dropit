import { useTranslation } from '@dropit/i18n';
import {
  Link,
  Outlet,
  createFileRoute,
  useMatches,
} from '@tanstack/react-router';
import { HeaderPage } from '../shared/components/layout/header-page';

export const Route = createFileRoute('/__home/library')({
  component: LibraryLayout,
});

function LibraryLayout() {
  const { t } = useTranslation();
  const matches = useMatches();

  // Si c'est pas un complex ou exercice, on affiche les workouts par défaut
  const activeTab =
    matches[matches.length - 1].pathname.split('/').pop() || 'workouts';

  return (
    <>
      <HeaderPage
        title={t('library.title')}
        description={t('library.description')}
      />
      <div className="border-b">
        <nav className="flex gap-8">
          <Link
            to="/library/workouts"
            className={`pb-2 px-1 transition-all relative ${
              activeTab === 'workouts'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {t('library.tabs.workouts')}
          </Link>
          <Link
            to="/library/complex"
            className={`pb-2 px-1 transition-all relative ${
              activeTab === 'complex'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {t('library.tabs.complex')}
          </Link>
          <Link
            to="/library/exercises"
            className={`pb-2 px-1 transition-all relative ${
              activeTab === 'exercises'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {t('library.tabs.exercises')}
          </Link>
        </nav>
      </div>

      <div className="mt-6 h-full flex flex-col">
        <Outlet />
      </div>
    </>
  );
}
