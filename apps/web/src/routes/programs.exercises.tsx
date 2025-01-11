import { api } from '@/lib/api';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { columns } from '../components/exercises/columns';
import { DataTable } from '../components/exercises/data-table';
import { DialogCreation } from '../components/exercises/dialog-creation';
import { ExerciseCreationForm } from '../components/exercises/exercise-creation-form';

export const Route = createFileRoute('/programs/exercises')({
  component: ExercisesPage,
});

function ExercisesPage() {
  const [createExerciseModalOpen, setCreateExerciseModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: exercises, isLoading: exercisesLoading } = useQuery({
    queryKey: ['exercises'],
    queryFn: async () => {
      const response = await api.exercise.getExercises();
      if (response.status !== 200) throw new Error('Failed to load exercises');
      return response.body;
    },
  });

  if (exercisesLoading) return <div>Loading...</div>;

  if (!exercises) return <div>No exercises found</div>;

  const handleCreationSuccess = () => {
    setCreateExerciseModalOpen(false);
    // Rafraîchir la liste des exercices
    queryClient.invalidateQueries({ queryKey: ['exercises'] });
  };

  return (
    <div className="container mx-auto py-2">
      <DataTable
        columns={columns}
        data={exercises}
        onDialogCreation={setCreateExerciseModalOpen}
      />
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
