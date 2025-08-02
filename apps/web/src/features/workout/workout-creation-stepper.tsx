import { Form } from '@/shared/components/ui/form';
import { Steps } from '@/shared/components/ui/steps';
import { createWorkoutSchema } from '@dropit/schemas';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { WorkoutElementsStep } from './steps/workout-elements-step';
import { WorkoutInfoStep } from './steps/workout-info-step';
import { WorkoutPlanningStep } from './steps/workout-planning-step';

// Définir un schéma étendu pour le formulaire qui inclut le champ session d'entrainement
const extendedWorkoutSchema = createWorkoutSchema.extend({
  trainingSession: z
    .object({
      athleteIds: z.array(z.string()),
      scheduledDate: z.string(),
    })
    .optional(),
});

type ExtendedWorkoutSchema = z.infer<typeof extendedWorkoutSchema>;

const steps = [
  {
    id: 'info',
    name: 'Description',
    description: 'Définir les informations générales',
  },
  {
    id: 'elements',
    name: 'Construction',
    description: 'Assembler les éléments',
  },
  {
    id: 'planning',
    name: 'Planification',
    description: 'Définir les dates et attribuer',
  },
];

interface WorkoutCreationStepperProps {
  onSuccess: (data: z.infer<typeof createWorkoutSchema>) => void;
  onCancel: () => void;
}

export function WorkoutCreationStepper({
  onSuccess,
  onCancel,
}: WorkoutCreationStepperProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const form = useForm<ExtendedWorkoutSchema>({
    resolver: zodResolver(extendedWorkoutSchema),
    defaultValues: {
      title: '',
      description: '',
      workoutCategory: '',
      elements: [],
      trainingSession: {
        athleteIds: [],
        scheduledDate: '',
      },
    },
  });

  const handleSubmit = (data: ExtendedWorkoutSchema) => {
    // Si aucune date ou aucun athlète n'est sélectionné, on supprime la session d'entrainement
    if (
      !data.trainingSession?.scheduledDate ||
      !data.trainingSession?.athleteIds?.length
    ) {
      const { trainingSession, ...rest } = data;
      onSuccess(rest as z.infer<typeof createWorkoutSchema>);
    } else {
      onSuccess(data as z.infer<typeof createWorkoutSchema>);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <Steps
          steps={steps}
          currentStep={currentStep}
          onStepClick={setCurrentStep}
        />

        {currentStep === 0 && (
          <WorkoutInfoStep
            form={form}
            onNext={() => setCurrentStep(1)}
            onCancel={onCancel}
          />
        )}

        {currentStep === 1 && (
          <WorkoutElementsStep
            form={form}
            onBack={() => setCurrentStep(0)}
            onNext={() => setCurrentStep(2)}
            onCancel={onCancel}
          />
        )}

        {currentStep === 2 && (
          <WorkoutPlanningStep
            form={form}
            onBack={() => setCurrentStep(1)}
            onSubmit={handleSubmit}
            onCancel={onCancel}
          />
        )}
      </form>
    </Form>
  );
}
