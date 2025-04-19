import { api } from '@/lib/api';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/shared/components/ui/breadcrumb';
import { useTranslation } from '@dropit/i18n';
import { useQuery } from '@tanstack/react-query';
import { Link, useMatches } from '@tanstack/react-router';

export function Breadcrumbs() {
  const { t } = useTranslation();
  const matches = useMatches();

  // Trouver le match pour la route workoutId si elle existe
  const workoutMatch = matches.find(
    (match) => match.routeId === '/workouts/$workoutId'
  );

  const athleteMatch = matches.find(
    (match) => match.routeId === '/athletes/$athleteId'
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

  // Si on est sur une page de détail athlete, récupérer les infos
  const { data: athlete } = useQuery({
    queryKey: ['athlete', athleteMatch?.params.athleteId],
    queryFn: async () => {
      if (!athleteMatch?.params.athleteId) return null;
      const response = await api.athlete.getAthlete({
        params: { id: athleteMatch.params.athleteId },
      });
      if (response.status !== 200) return null;
      return response.body;
    },
  });

  // Filtrer les doublons basés sur le pathname
  const uniqueMatches = matches.filter(
    (match, index, self) =>
      index === self.findIndex((m) => m.pathname === match.pathname)
  );

  // Construire le breadcrumb
  let breadcrumbs = uniqueMatches.map((match) => ({
    title:
      match.routeId === '/workouts/$workoutId' && workout
        ? workout.title
        : t(`routes.${match.pathname}`),
    path: match.pathname,
  }));

  // Si on est sur un détail de workout, insérer l'étape "Entrainements"
  if (workoutMatch) {
    const dashboardCrumb = breadcrumbs[0]; // Garder "Tableau de bord"
    breadcrumbs = [
      dashboardCrumb,
      { title: t('routes./workouts'), path: '/workouts' },
      {
        title: workout?.title || t('common.loading'),
        path: workoutMatch.pathname,
      },
    ];
  }

  // Si on est sur un détail de athlete, insérer l'étape "Athlètes"
  if (athleteMatch) {
    const dashboardCrumb = breadcrumbs[0]; // Garder "Tableau de bord"
    breadcrumbs = [
      dashboardCrumb,
      { title: t('routes./athletes'), path: '/athletes' },
      {
        title: athlete
          ? `${athlete.firstName} ${athlete.lastName}`
          : t('common.loading'),
        path: athleteMatch.pathname,
      },
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
