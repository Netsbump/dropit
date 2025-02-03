import { api } from '@/lib/api';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/shared/components/ui/breadcrumb';
import { useQuery } from '@tanstack/react-query';
import { Link, useMatches } from '@tanstack/react-router';

const routeNames: Record<string, string> = {
  '/': 'Tableau de bord',
  '/programs': 'Programmation',
  '/programs/workouts': 'Entrainements',
  '/programs/exercises': 'Exercices',
  '/programs/complex': 'Complexes',
  '/programs/workouts/$workoutId': 'Nom Entrainement',
  '/planning': 'Calendrier',
  '/athletes': 'Athlètes',
  '/about': 'Aide & Support',
};

export function Breadcrumbs() {
  const matches = useMatches();

  // Trouver le match pour la route workoutId si elle existe
  const workoutMatch = matches.find(
    (match) => match.routeId === '/programs/workouts/$workoutId'
  );

  // Si on est sur une page de détail workout, récupérer les infos
  const { data: workout } = useQuery({
    queryKey: ['workout', workoutMatch?.params.workoutId],
    queryFn: async () => {
      if (!workoutMatch?.params.workoutId) return null;
      const response = await api.workout.getWorkout({
        params: { id: workoutMatch.params.workoutId },
      });
      if (response.status !== 200) return null;
      return response.body;
    },
    enabled: !!workoutMatch?.params.workoutId,
  });

  const breadcrumbs = matches.map((match) => ({
    title:
      // Si c'est la route de détail workout et qu'on a les infos
      match.routeId === '/programs/workouts/$workoutId' && workout
        ? workout.title // Utiliser le titre du workout
        : routeNames[match.pathname] || match.pathname,
    path: match.pathname,
  }));

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumbs.map((crumb, index) => {
          const isLast = index === breadcrumbs.length - 1;

          return (
            <BreadcrumbItem key={crumb.path}>
              {!isLast ? (
                <>
                  <BreadcrumbLink asChild>
                    <Link to={crumb.path}>{crumb.title}</Link>
                  </BreadcrumbLink>
                  <BreadcrumbSeparator />
                </>
              ) : (
                <BreadcrumbPage>{crumb.title}</BreadcrumbPage>
              )}
            </BreadcrumbItem>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
