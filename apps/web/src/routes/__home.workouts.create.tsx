import { WorkoutCreationStepper } from '@/features/workout/workout-creation-stepper';
import { api } from '@/lib/api';
import { Button } from '@/shared/components/ui/button';
import { useToast } from '@/shared/hooks/use-toast';
import { useTranslation } from '@dropit/i18n';
import { CreateWorkout } from '@dropit/schemas';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { format } from 'date-fns';
import { enGB, fr } from 'date-fns/locale';
import { ArrowLeft } from 'lucide-react';
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
  const { date } = Route.useSearch();
  const queryClient = useQueryClient();
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const locale = i18n.language === 'fr' ? fr : enGB;

  const selectedDate = date ? new Date(date) : undefined;

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
  };

  const handleCancel = () => {
    navigate({ to: '/programs/workouts' });
  };

  return (
    <div className="h-full flex flex-col">
      {/* Navigation Bar */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center h-14 gap-4">
          <Button variant="outline" size="icon" onClick={handleCancel}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-semibold">
              {t('workout.creation.title')}
              {selectedDate && ` - ${format(selectedDate, 'PPP', { locale })}`}
            </h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <WorkoutCreationStepper
            onSuccess={handleCreationSuccess}
            onCancel={handleCancel}
          />
        </div>
      </div>
    </div>
  );
}