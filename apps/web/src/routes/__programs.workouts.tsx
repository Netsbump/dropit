import { WorkoutCreationStepper } from '@/features/workout/workout-creation-stepper';
import { WorkoutFilters } from '@/features/workout/workout-filters';
import { WorkoutGrid } from '@/features/workout/workout-grid';
import { api } from '@/lib/api';
import { useToast } from '@/shared/hooks/use-toast';
import { useTranslation } from '@dropit/i18n';
import { CreateWorkout } from '@dropit/schemas';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Outlet, createFileRoute, useMatches } from '@tanstack/react-router';
import { useState } from 'react';
import { DialogCreation } from '../features/exercises/dialog-creation';

export const Route = createFileRoute('/__programs/workouts')({
  component: WorkoutPage,
});

function WorkoutPage() {
  const [createWorkoutModalOpen, setCreateWorkoutModalOpen] = useState(false);
  const [filter, setFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const queryClient = useQueryClient();
  const navigate = Route.useNavigate();
  const matches = useMatches();
  const isWorkoutDetail = matches.some(
    (match) => match.routeId === '/workouts/$workoutId'
  );
  const { t } = useTranslation();
  const { toast } = useToast();

  // Mutation pour créer un workout
  const { mutate: createWorkoutMutation } = useMutation({
    mutationFn: async (data: CreateWorkout) => {
      const response = await api.workout.createWorkout({ body: data });
      if (response.status !== 201) {
        throw new Error('Erreur lors de la création du workout');
      }
      return response.body;
    },
    onSuccess: () => {
      toast({
        title: 'Succès',
        description: "L'entraînement a été créé avec succès",
      });
      setCreateWorkoutModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
    },
    onError: (error) => {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

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

  const filteredWorkouts = workouts?.filter((workout) => {
    const matchesSearch = workout.title
      .toLowerCase()
      .includes(filter.toLowerCase());
    const matchesCategory =
      categoryFilter === 'all' || workout.workoutCategory === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleCreationSuccess = (data: CreateWorkout) => {
    // Appeler la mutation pour créer le workout
    createWorkoutMutation(data);
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
    <div className="relative flex-1">
      <WorkoutFilters
        onFilterChange={setFilter}
        onCategoryChange={setCategoryFilter}
        onCreateClick={() => setCreateWorkoutModalOpen(true)}
        categories={categories}
        disabled={isLoading || !workouts?.length}
      />

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
          onWorkoutClick={handleWorkoutClick}
        />
      )}

      <DialogCreation
        open={createWorkoutModalOpen}
        onOpenChange={setCreateWorkoutModalOpen}
        title={t('workout.creation.title')}
        description={t('workout.creation.description')}
        maxWidth="xl"
      >
        <WorkoutCreationStepper
          onSuccess={handleCreationSuccess}
          onCancel={() => setCreateWorkoutModalOpen(false)}
        />
      </DialogCreation>
    </div>
  );
}
