import { WorkoutFilters } from '@/features/workout/workout-filters';
import { WorkoutGrid } from '@/features/workout/workout-grid';
import { api } from '@/lib/api';
import { useTranslation } from '@dropit/i18n';
import { useQuery } from '@tanstack/react-query';
import { Outlet, createFileRoute, useMatches } from '@tanstack/react-router';
import { useState } from 'react';

export const Route = createFileRoute('/__home/programs/workouts')({
  component: WorkoutPage,
});

function WorkoutPage() {
  const [filter, setFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const navigate = Route.useNavigate();
  const matches = useMatches();
  const isWorkoutDetail = matches.some(
    (match) => match.routeId === '/__home/workouts/$workoutId'
  );
  const { t } = useTranslation();


  const { data: workouts, isLoading } = useQuery({
    queryKey: ['workouts'],
    queryFn: async () => {
      const response = await api.workout.getWorkouts();
      if (response.status !== 200) throw new Error('Failed to load workouts');
      return response.body;
    },
  });

  const { data: categories } = useQuery({
    queryKey: ['workoutCategories'],
    queryFn: async () => {
      const response = await api.workoutCategory.getWorkoutCategories();
      if (response.status !== 200) throw new Error('Failed to load categories');
      return response.body;
    },
  });

  const { data: trainingSessions } = useQuery({
    queryKey: ['trainingSessions'],
    queryFn: async () => {
      const response = await api.trainingSession.getTrainingSessions();
      if (response.status !== 200) throw new Error('Failed to load training sessions');
      return response.body;
    },
  });

  const filteredWorkouts = workouts?.filter((workout) => {
    const matchesSearch = workout.title
      .toLowerCase()
      .includes(filter.toLowerCase());
    const matchesCategory =
      categoryFilter === 'all' || workout.workoutCategory === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleCreateClick = () => {
    navigate({ to: '/workouts/create' });
  };

  const handleWorkoutClick = (workoutId: string) => {
    navigate({ to: `/workouts/${workoutId}` });
  };

  // Si on est sur un détail de workout, on affiche directement le contenu
  if (isWorkoutDetail) {
    return <Outlet />;
  }

  // Sinon on affiche la grille des workouts
  return (
    <div className="h-full flex flex-col">
      <div className="flex-shrink-0">
        <WorkoutFilters
          onFilterChange={setFilter}
          onCategoryChange={setCategoryFilter}
          onCreateClick={handleCreateClick}
          categories={categories}
          disabled={isLoading || !workouts?.length}
        />
      </div>

      <div className="flex-1 flex flex-col min-h-0">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            {t('common.loading')}
          </div>
        ) : !workouts?.length ? (
          <div className="flex flex-col items-center justify-center h-32 gap-2 text-muted-foreground">
            <p>{t('workout.filters.no_results')}</p>
            <p className="text-sm">{t('common.start_create')}</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto min-h-0">
            <div className="p-4 pb-8">
              <WorkoutGrid
                workouts={filteredWorkouts || []}
                trainingSessions={trainingSessions || []}
                onWorkoutClick={handleWorkoutClick}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
