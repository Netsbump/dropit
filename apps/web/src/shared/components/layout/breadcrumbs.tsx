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
  '/workouts': 'Entrainements',
  '/exercises': 'Exercices',
  '/complex': 'Combinés',
  '/workouts/$workoutId': 'Nom Entrainement',
  '/planning': 'Calendrier',
  '/athletes': 'Athlètes',
  '/about': 'Aide & Support',
};

export function Breadcrumbs() {
  const matches = useMatches();

  // Trouver le match pour la route workoutId si elle existe
  const workoutMatch = matches.find(
    (match) => match.routeId === '/workouts/$workoutId'
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

  // Filtrer les doublons basés sur le pathname
  const uniqueMatches = matches.filter((match, index, self) =>
    index === self.findIndex((m) => m.pathname === match.pathname)
  );

  // Construire le breadcrumb
  let breadcrumbs = uniqueMatches.map((match) => ({
    title:
      match.routeId === '/workouts/$workoutId' && workout
        ? workout.title
        : routeNames[match.pathname] || match.pathname,
    path: match.pathname,
  }));

  // Si on est sur un détail de workout, insérer l'étape "Entrainements"
  if (workoutMatch) {
    const dashboardCrumb = breadcrumbs[0]; // Garder "Tableau de bord"
    breadcrumbs = [
      dashboardCrumb,
      { title: 'Entrainements', path: '/workouts' },
      { title: workout?.title || 'Chargement...', path: workoutMatch.pathname },
    ];
  }

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
