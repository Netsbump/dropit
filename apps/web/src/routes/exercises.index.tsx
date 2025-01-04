import { createFileRoute } from '@tanstack/react-router';
import { columns } from '../components/exercises/columns';
import { DataTable } from '../components/exercises/data-table';

export const Route = createFileRoute('/exercises/')({
  component: ExercisesPage,
});

function ExercisesPage() {
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

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-4">Exercices</h1>
      <p className="text-sm text-muted-foreground">Gérer vos exercices</p>
      <div className="flex justify-between items-center mb-6">
        <button
          type="button"
          className="px-4 py-2 bg-primary text-white rounded-md"
        >
          Ajouter un exercice
        </button>
      </div>
      <DataTable columns={columns} data={data} />
    </div>
  );
}
