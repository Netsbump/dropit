import { WorkoutCreationForm } from '@/features/workout/workout-creation-form';
import { WorkoutDetail } from '@/features/workout/workout-detail';
import { WorkoutFilters } from '@/features/workout/workout-filters';
import { WorkoutGrid } from '@/features/workout/workout-grid';
import { api } from '@/lib/api';
import { DetailsPanel } from '@/shared/components/ui/details-panel';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { DialogCreation } from '../features/exercises/dialog-creation';

export const Route = createFileRoute('/programs/workouts')({
  component: WorkoutPage,
});

function WorkoutPage() {
  const [createWorkoutModalOpen, setCreateWorkoutModalOpen] = useState(false);
  const [filter, setFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const queryClient = useQueryClient();
  const [selectedWorkout, setSelectedWorkout] = useState<string | null>(null);

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

  const { data: workoutDetails } = useQuery({
    queryKey: ['workout', selectedWorkout],
    queryFn: async () => {
      if (!selectedWorkout) return null;
      const response = await api.workout.getWorkout({
        params: { id: selectedWorkout },
      });
      if (response.status !== 200)
        throw new Error('Failed to load workout details');
      return response.body;
    },
    enabled: !!selectedWorkout,
  });

  const filteredWorkouts = workouts?.filter((workout) => {
    const matchesSearch = workout.title
      .toLowerCase()
      .includes(filter.toLowerCase());
    const matchesCategory =
      categoryFilter === 'all' || workout.workoutCategory === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleCreationSuccess = () => {
    setCreateWorkoutModalOpen(false);
    queryClient.invalidateQueries({ queryKey: ['workouts'] });
  };

  return (
    <div className="relative flex-1">
      <div
        className={`transition-all duration-200 ${
          selectedWorkout ? 'mr-[400px]' : ''
        }`}
      >
        <WorkoutFilters
          onFilterChange={setFilter}
          onCategoryChange={setCategoryFilter}
          onCreateClick={() => setCreateWorkoutModalOpen(true)}
          categories={categories}
          disabled={isLoading || !workouts?.length}
        />

        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            Loading...
          </div>
        ) : !workouts?.length ? (
          <div className="flex flex-col items-center justify-center h-32 gap-2 text-muted-foreground">
            <p>Aucun workout trouvé</p>
            <p className="text-sm">Commencez par en créer un !</p>
          </div>
        ) : (
          <WorkoutGrid
            workouts={filteredWorkouts || []}
            onWorkoutClick={(workoutId) => setSelectedWorkout(workoutId)}
          />
        )}
      </div>

      <DetailsPanel
        open={!!selectedWorkout}
        onClose={() => setSelectedWorkout(null)}
        title="Détails du workout"
      >
        {workoutDetails && <WorkoutDetail workout={workoutDetails} />}
      </DetailsPanel>

      <DialogCreation
        open={createWorkoutModalOpen}
        onOpenChange={setCreateWorkoutModalOpen}
        title="Créer un workout"
        description="Ajoutez un nouveau workout à votre catalogue."
      >
        <WorkoutCreationForm
          onSuccess={handleCreationSuccess}
          onCancel={() => setCreateWorkoutModalOpen(false)}
        />
      </DialogCreation>
    </div>
  );
}
