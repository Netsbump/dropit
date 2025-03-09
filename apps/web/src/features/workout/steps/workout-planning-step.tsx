import { Button } from '@/shared/components/ui/button';
import { Checkbox } from '@/shared/components/ui/checkbox';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/shared/components/ui/form';
import { Input } from '@/shared/components/ui/input';
import { createWorkoutSchema } from '@dropit/schemas';
import { useEffect, useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { z } from 'zod';

// Définir un schéma étendu pour le formulaire qui inclut le champ session
const extendedWorkoutSchema = createWorkoutSchema.extend({
  session: z
    .object({
      athleteIds: z.array(z.string()),
      scheduledDate: z.string(),
    })
    .optional(),
});

type ExtendedWorkoutSchema = z.infer<typeof extendedWorkoutSchema>;

interface Athlete {
  id: string;
  firstName: string;
  lastName: string;
}

interface WorkoutPlanningStepProps {
  form: UseFormReturn<ExtendedWorkoutSchema>;
  onBack: () => void;
  onSubmit: (data: ExtendedWorkoutSchema) => void;
  onCancel: () => void;
}

export function WorkoutPlanningStep({
  form,
  onBack,
  onSubmit,
  onCancel,
}: WorkoutPlanningStepProps) {
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedAthletes, setSelectedAthletes] = useState<string[]>([]);

  useEffect(() => {
    async function fetchAthletes() {
      setLoading(true);
      try {
        // Simuler le chargement des athlètes depuis l'API
        // Dans une implémentation réelle, vous utiliseriez votre client API
        setTimeout(() => {
          setAthletes([
            { id: '1', firstName: 'John', lastName: 'Doe' },
            { id: '2', firstName: 'Jane', lastName: 'Smith' },
            { id: '3', firstName: 'Mike', lastName: 'Johnson' },
          ]);
          setLoading(false);
        }, 500);
      } catch (error) {
        console.error('Erreur lors du chargement des athlètes:', error);
        setLoading(false);
      }
    }

    fetchAthletes();
  }, []);

  // Mettre à jour le formulaire lorsque la sélection d'athlètes change
  useEffect(() => {
    form.setValue('session.athleteIds', selectedAthletes);
  }, [selectedAthletes, form]);

  const handleAthleteToggle = (athleteId: string) => {
    setSelectedAthletes((prev) => {
      if (prev.includes(athleteId)) {
        return prev.filter((id) => id !== athleteId);
      }
      return [...prev, athleteId];
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4">
        <FormField
          control={form.control}
          name="session.scheduledDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date de programmation</FormLabel>
              <FormControl>
                <Input
                  type="date"
                  placeholder="Sélectionner une date"
                  {...field}
                  onChange={(e) => {
                    field.onChange(e.target.value);
                  }}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormItem>
          <FormLabel>Athlètes</FormLabel>
          <div className="space-y-2 border rounded p-3">
            {loading ? (
              <div>Chargement des athlètes...</div>
            ) : athletes.length === 0 ? (
              <div>Aucun athlète disponible</div>
            ) : (
              athletes.map((athlete) => (
                <div key={athlete.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`athlete-${athlete.id}`}
                    checked={selectedAthletes.includes(athlete.id)}
                    onCheckedChange={() => handleAthleteToggle(athlete.id)}
                  />
                  <label
                    htmlFor={`athlete-${athlete.id}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {athlete.firstName} {athlete.lastName}
                  </label>
                </div>
              ))
            )}
          </div>
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
