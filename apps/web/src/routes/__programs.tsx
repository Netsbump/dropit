import { Link, Outlet, createFileRoute, useMatches } from '@tanstack/react-router';
import { HeaderPage } from '../shared/components/layout/header-page';
export const Route = createFileRoute('/__programs')({
  component: ProgramsLayout,
});

function ProgramsLayout() {
  const matches = useMatches();

  // Si c'est pas un complex ou exercice, on affiche les workouts par défaut
  const activeTab =
    matches[matches.length - 1].pathname.split('/').pop() || 'workouts';  

  console.log(matches);

  return (
    <>
      <HeaderPage title="Programmation" description="Retrouvez et gérez tous vos entrainements, combinés et exercices ici" />
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
            Entrainements
          </Link>
          <Link
            to="/complex"
            className={`pb-2 px-1 transition-all relative ${
              activeTab === 'complex'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Combinés
          </Link>
          <Link
            to="/exercises"
            className={`pb-2 px-1 transition-all relative ${
              activeTab === 'exercises'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Exercices
          </Link>
        </nav>
      </div>

      <div className="mt-6">
        <Outlet />
      </div>    
    </>
  );
}
