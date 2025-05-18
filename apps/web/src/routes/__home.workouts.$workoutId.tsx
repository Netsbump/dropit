import { WorkoutDetail } from '@/features/workout/workout-detail';
import { WorkoutEditor } from '@/features/workout/workout-editor';
import { api } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';

export const Route = createFileRoute('/__home/workouts/$workoutId')({
  component: WorkoutDetailPage,
  loader: ({ params }) => {
    return {
      workoutId: params.workoutId,
    };
  },
});

function WorkoutDetailPage() {
  const { workoutId } = Route.useParams();
  const navigate = Route.useNavigate();
  const [isEditing, setIsEditing] = useState(false);

  const { data: workout, isLoading } = useQuery({
    queryKey: ['workout', workoutId],
    queryFn: async () => {
      const response = await api.workout.getWorkout({
        params: { id: workoutId },
      });
      if (response.status !== 200)
        throw new Error('Failed to load workout details');
      return response.body;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Chargement...
      </div>
    );
  }

  if (!workout) {
    return <div>Entrainement non trouvé</div>;
  }

  if (isEditing) {
    return (
      <WorkoutEditor workout={workout} onCancel={() => setIsEditing(false)} />
    );
  }

  return (
    <WorkoutDetail
      workout={workout}
      onNavigate={() => navigate({ to: '/programs/workouts' })}
      onEdit={() => setIsEditing(true)}
    />
  );
}
