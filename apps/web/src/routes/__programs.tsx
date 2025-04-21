import { useTranslation } from '@dropit/i18n';
import {
  Link,
  Outlet,
  createFileRoute,
  useMatches,
} from '@tanstack/react-router';
import { HeaderPage } from '../shared/components/layout/header-page';

export const Route = createFileRoute('/__programs')({
  component: ProgramsLayout,
});

function ProgramsLayout() {
  const { t } = useTranslation();
  const matches = useMatches();

  // Si c'est pas un complex ou exercice, on affiche les workouts par défaut
  const activeTab =
    matches[matches.length - 1].pathname.split('/').pop() || 'workouts';

  return (
    <>
      <HeaderPage
        title={t('programs.title')}
        description={t('programs.description')}
      />
      <div className="border-b">
        <nav className="flex gap-8">
          <Link
            to="/workouts"
            className={`pb-2 px-1 transition-all relative ${
              activeTab === 'workouts'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {t('programs.tabs.workouts')}
          </Link>
          <Link
            to="/complex"
            className={`pb-2 px-1 transition-all relative ${
              activeTab === 'complex'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {t('programs.tabs.complex')}
          </Link>
          <Link
            to="/exercises"
            className={`pb-2 px-1 transition-all relative ${
              activeTab === 'exercises'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {t('programs.tabs.exercises')}
          </Link>
        </nav>
      </div>

      <div className="mt-6">
        <Outlet />
      </div>
    </>
  );
}
