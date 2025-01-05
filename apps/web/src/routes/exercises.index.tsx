import { useQueryClient } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { columns } from '../components/exercises/columns';
import { DataTable } from '../components/exercises/data-table';
import { DialogCreation } from '../components/exercises/dialog-creation';
import { ExerciseCreationForm } from '../components/exercises/exercise-creation-form';

export const Route = createFileRoute('/exercises/')({
  component: ExercisesPage,
});

function ExercisesPage() {
  const [createExerciseModalOpen, setCreateExerciseModalOpen] = useState(false);
  const queryClient = useQueryClient();
  const data = [
    {
      id: '1',
      name: 'Squat',
      description: 'Exercise de jambes',
      category: {
        id: '1',
        name: 'Haltérophilie',
      },
      englishName: 'Squat',
    },
    {
      id: '2',
      name: 'Soulevé de terre',
      description: 'Exercise de jambes',
      category: {
        id: '1',
        name: 'Haltérophilie',
      },
      englishName: 'Deadlift',
    },
    {
      id: '3',
      name: 'Développé couché',
      description: 'Exercise de pectoraux',
      category: {
        id: '1',
        name: 'Musculation',
      },
      englishName: 'Bench Press',
    },
  ];

  const handleCreationSuccess = () => {
    setCreateExerciseModalOpen(false);
    // Rafraîchir la liste des exercices
    queryClient.invalidateQueries({ queryKey: ['exercises'] });
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-4">Exercices</h1>
      <p className="text-sm text-muted-foreground">
        Retrouvez et gérez tous vos exercices ici
      </p>
      <DataTable
        columns={columns}
        data={data}
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
