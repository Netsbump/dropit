import { WorkoutCreationStepper, workoutCreationSteps } from '@/features/workout/workout-creation-stepper';
import { api } from '@/lib/api';
import { Steps } from '@/shared/components/ui/steps';
import { useToast } from '@/shared/hooks/use-toast';
import { usePageMeta } from '@/shared/hooks/use-page-meta';
import { CreateWorkout } from '@dropit/schemas';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { z } from 'zod';

const createWorkoutSearchSchema = z.object({
  date: z.string().optional(),
});

export const Route = createFileRoute('/__home/workouts/create')({
  component: CreateWorkoutPage,
  validateSearch: createWorkoutSearchSchema,
});

function CreateWorkoutPage() {
  const navigate = Route.useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { setPageMeta } = usePageMeta();
  const [currentStep, setCurrentStep] = useState(0);

  // Mutation pour créer un workout
  const { mutate: createWorkoutMutation } = useMutation({
    mutationFn: async (data: CreateWorkout) => {
      const response = await api.workout.createWorkout({ body: data });
      if (response.status !== 201) {
        throw new Error('Erreur lors de la création du workout');
      }
      return response.body;
    },
    onSuccess: (workout) => {
      toast({
        title: 'Succès',
        description: "L'entraînement a été créé avec succès",
      });
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
      // Rediriger vers le détail du workout créé
      navigate({ to: `/workouts/${workout.id}` });
    },
    onError: (error) => {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleCreationSuccess = (data: CreateWorkout) => {
    createWorkoutMutation(data);
    if (data.trainingSession?.scheduledDate) {
      navigate({ to: '/planning', replace: true, search: { date: data.trainingSession.scheduledDate } });
    } else {
      navigate({ to: '/library/workouts', replace: true });
    }
  };

  const handleCancel = () => {
    navigate({ to: '/library/workouts' });
  };

  // Update page meta with title, back button, and steps in the middle
  useEffect(() => {
    setPageMeta({
      title: 'Création entrainement',
      showBackButton: true,
      onBackClick: handleCancel,
      middleContent: (
        <Steps
          steps={workoutCreationSteps}
          currentStep={currentStep}
          onStepClick={setCurrentStep}
        />
      ),
    });

    // Cleanup on unmount
    return () => {
      setPageMeta({
        title: undefined,
        showBackButton: false,
        onBackClick: undefined,
        middleContent: undefined,
      });
    };
  }, [setPageMeta, currentStep, handleCancel]);

  return (
    <div className="h-full flex flex-col p-4">
      <WorkoutCreationStepper
        currentStep={currentStep}
        setCurrentStep={setCurrentStep}
        onSuccess={handleCreationSuccess}
        onCancel={handleCancel}
      />
    </div>
  );
}