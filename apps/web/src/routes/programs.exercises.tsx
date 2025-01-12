import { ExerciseDetail } from '@/components/exercises/exercise-detail';
import { api } from '@/lib/api';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { columns } from '../components/exercises/columns';
import { DataTable } from '../components/exercises/data-table';
import { DialogCreation } from '../components/exercises/dialog-creation';
import { ExerciseCreationForm } from '../components/exercises/exercise-creation-form';
import { DetailsPanel } from '../components/ui/details-panel';

export const Route = createFileRoute('/programs/exercises')({
  component: ExercisesPage,
});

function ExercisesPage() {
  const [createExerciseModalOpen, setCreateExerciseModalOpen] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: exercises, isLoading: exercisesLoading } = useQuery({
    queryKey: ['exercises'],
    queryFn: async () => {
      const response = await api.exercise.getExercises();
      if (response.status !== 200) throw new Error('Failed to load exercises');
      return response.body;
    },
  });

  const { data: exerciseDetails } = useQuery({
    queryKey: ['exercise', selectedExercise],
    queryFn: async () => {
      if (!selectedExercise) return null;
      const response = await api.exercise.getExercise({
        params: { id: selectedExercise },
      });
      if (response.status !== 200)
        throw new Error('Failed to load exercise details');
      return response.body;
    },
    enabled: !!selectedExercise,
  });

  if (exercisesLoading) return <div>Loading...</div>;
  if (!exercises) return <div>No exercises found</div>;

  const handleCreationSuccess = () => {
    setCreateExerciseModalOpen(false);
    queryClient.invalidateQueries({ queryKey: ['exercises'] });
  };

  return (
    <div className="relative flex-1">
      <div
        className={`transition-all duration-200 ${
          selectedExercise ? 'mr-[400px]' : ''
        }`}
      >
        <DataTable
          columns={columns}
          data={exercises}
          onDialogCreation={setCreateExerciseModalOpen}
          onRowClick={(exerciseId) => setSelectedExercise(exerciseId)}
        />
      </div>

      <DetailsPanel
        open={!!selectedExercise}
        onClose={() => setSelectedExercise(null)}
        title="Détails de l'exercice"
      >
        {exerciseDetails && <ExerciseDetail exercise={exerciseDetails} />}
      </DetailsPanel>

      <DialogCreation
        open={createExerciseModalOpen}
        onOpenChange={setCreateExerciseModalOpen}
        title="Créer un exercice"
        description="Ajoutez un nouvel exercice à votre catalogue."
      >
        <ExerciseCreationForm
          onSuccess={handleCreationSuccess}
          onCancel={() => setCreateExerciseModalOpen(false)}
        />
      </DialogCreation>
    </div>
  );
}
