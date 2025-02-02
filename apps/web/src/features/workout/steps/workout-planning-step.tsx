import { Button } from '@/shared/components/ui/button';
import { FormControl, FormItem, FormLabel } from '@/shared/components/ui/form';
import { Input } from '@/shared/components/ui/input';
import { createWorkoutSchema } from '@dropit/schemas';
import { UseFormReturn } from 'react-hook-form';
import { z } from 'zod';

interface WorkoutPlanningStepProps {
  form: UseFormReturn<z.infer<typeof createWorkoutSchema>>;
  onBack: () => void;
  onSubmit: (data: z.infer<typeof createWorkoutSchema>) => void;
  onCancel: () => void;
}

export function WorkoutPlanningStep({
  form,
  onBack,
  onSubmit,
  onCancel,
}: WorkoutPlanningStepProps) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4">
        {/* Placeholder pour DatePicker */}
        <FormItem>
          <FormLabel>Date de programmation</FormLabel>
          <FormControl>
            <Input type="date" placeholder="Sélectionner une date" />
          </FormControl>
        </FormItem>

        {/* Placeholder pour AthleteSelector */}
        <FormItem>
          <FormLabel>Athlètes</FormLabel>
          <FormControl>
            <Input disabled placeholder="Sélection des athlètes à venir..." />
          </FormControl>
        </FormItem>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onBack}>
            Retour
          </Button>
          <Button onClick={form.handleSubmit(onSubmit)}>
            Créer l'entraînement
          </Button>
        </div>
      </div>
    </div>
  );
}
