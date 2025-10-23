import { WorkoutDetail } from '@/features/workout/workout-detail';
import { WorkoutEditor } from '@/features/workout/workout-editor';
import { api } from '@/lib/api';
import { usePageMeta } from '@/shared/hooks/use-page-meta';
import { useTranslation } from '@dropit/i18n';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect } from 'react';

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
  const { setPageMeta } = usePageMeta();
  const { t } = useTranslation();
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

  // Update page meta with title and back button
  useEffect(() => {
    setPageMeta({
      title: t('workout.detail.title'),
      showBackButton: true,
      onBackClick: () => navigate({ to: '/library/workouts' })
    });

    // Cleanup: reset to default when leaving the page
    return () => {
      setPageMeta({
        title: t('library.title'),
        showBackButton: false,
        onBackClick: undefined
      });
    };
  }, [setPageMeta, navigate, t]);

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
    <div className="p-4">
      <WorkoutDetail
        workout={workout}
        onEdit={() => setIsEditing(true)}
      />
    </div>
  );
}
