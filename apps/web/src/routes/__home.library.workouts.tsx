import { WorkoutFilters } from '@/features/workout/workout-filters';
import { WorkoutGrid } from '@/features/workout/workout-grid';
import { api } from '@/lib/api';
import { HeroCard } from '@/shared/components/ui/hero-card';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { useTranslation } from '@dropit/i18n';
import { useQuery } from '@tanstack/react-query';
import { Outlet, createFileRoute, useMatches } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { usePageMeta } from '../shared/hooks/use-page-meta';
import { Layers } from 'lucide-react';

export const Route = createFileRoute('/__home/library/workouts')({
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
  const { setPageMeta } = usePageMeta();

  useEffect(() => {
    setPageMeta({ title: t('library.title') });
  }, [setPageMeta, t]);


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

  // If we are on a workout detail, display the content directly
  if (isWorkoutDetail) {
    return <Outlet />;
  }

  // Otherwise display the grid of workouts
  return (
    <div className="flex flex-col h-full p-8">
      {/* Fixed header section */}
      <div className="flex-none space-y-6 mb-6">
        <HeroCard
          variant="workout"
          title={t('workout.hero.title')}
          description={t('workout.hero.description')}
          stat={{
            label: t('workout.hero.stat_label'),
            value: workouts?.length || 0,
            icon: Layers,
            description: t('workout.hero.stat_description'),
            callToAction: {
              text: t('workout.hero.stat_cta'),
              onClick: () => {
                // TODO: Ouvrir une popup avec vidéo explicative
                console.log('Open workout tutorial video');
              }
            }
          }}
        />

        <WorkoutFilters
          onFilterChange={setFilter}
          onCategoryChange={setCategoryFilter}
          onCreateClick={handleCreateClick}
          categories={categories}
          disabled={isLoading || !workouts?.length}
        />
      </div>

      {/* Scrollable content section */}
      <ScrollArea className="flex-1">
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
          <WorkoutGrid
            workouts={filteredWorkouts || []}
            trainingSessions={trainingSessions || []}
            onWorkoutClick={handleWorkoutClick}
          />
        )}
      </ScrollArea>
    </div>
  );
}
