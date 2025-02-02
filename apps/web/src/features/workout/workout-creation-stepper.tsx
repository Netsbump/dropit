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
    description: 'Programmer et attribuer',
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
  const form = useForm<z.infer<typeof createWorkoutSchema>>({
    resolver: zodResolver(createWorkoutSchema),
    defaultValues: {
      title: '',
      description: '',
      workoutCategory: '',
      elements: [],
    },
  });

  const handleSubmit = (data: z.infer<typeof createWorkoutSchema>) => {
    onSuccess(data);
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
