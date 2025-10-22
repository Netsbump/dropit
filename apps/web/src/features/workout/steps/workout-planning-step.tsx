import { api } from '@/lib/api';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Checkbox } from '@/shared/components/ui/checkbox';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/components/ui/form';
import { Input } from '@/shared/components/ui/input';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { Switch } from '@/shared/components/ui/switch';
import { createWorkoutSchema } from '@dropit/schemas';
import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { z } from 'zod';

// Définir un schéma étendu pour le formulaire qui inclut le champ session d'entrainement
const extendedWorkoutSchema = createWorkoutSchema.extend({
  trainingSession: z
    .object({
      athleteIds: z
        .array(z.string())
        .min(1, 'Au moins un athlète doit être sélectionné'),
      scheduledDate: z.string().min(1, 'La date est requise'),
    })
    .optional(),
});

type ExtendedWorkoutSchema = z.infer<typeof extendedWorkoutSchema>;

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
  const [isScheduled, setIsScheduled] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAthletes, setSelectedAthletes] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  // Fetch athletes from API
  const { data: athletes = [], isLoading } = useQuery({
    queryKey: ['athletes'],
    queryFn: async () => {
      try {
        const response = await api.athlete.getAthletes();
        if (response.status !== 200) throw new Error('Failed to load athletes');
        return response.body.map((athlete) => ({
          id: athlete.id,
          firstName: athlete.firstName,
          lastName: athlete.lastName,
        }));
      } catch (error) {
        console.error('Erreur lors du chargement des athlètes:', error);
        return [];
      }
    },
    enabled: isScheduled, // Only fetch when scheduling is enabled
  });

  // Filter athletes based on search query
  const filteredAthletes = athletes.filter((athlete) =>
    `${athlete.firstName} ${athlete.lastName}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  // Toggle scheduling option
  const toggleScheduling = (enabled: boolean) => {
    setIsScheduled(enabled);
    if (!enabled) {
      // Clear scheduling data when disabled
      form.setValue('trainingSession', undefined);
      setSelectedAthletes([]);
      setSelectAll(false);
    } else {
      // Initialize with empty values
      form.setValue('trainingSession', { athleteIds: [], scheduledDate: '' });
    }
  };

  // Initialize planning on mount
  useEffect(() => {
    if (isScheduled && !form.watch('trainingSession')) {
      form.setValue('trainingSession', { athleteIds: [], scheduledDate: '' });
    }
  }, [isScheduled, form]);

  // Toggle select all athletes
  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedAthletes([]);
      setSelectAll(false);
    } else {
      const allIds = athletes.map((athlete) => athlete.id);
      setSelectedAthletes(allIds);
      setSelectAll(true);
    }
  };

  // Toggle individual athlete selection
  const handleAthleteToggle = (athleteId: string) => {
    setSelectedAthletes((prev) => {
      if (prev.includes(athleteId)) {
        const newSelection = prev.filter((id) => id !== athleteId);
        setSelectAll(false);
        return newSelection;
      }
      const newSelection = [...prev, athleteId];
      setSelectAll(newSelection.length === athletes.length);
      return newSelection;
    });
  };

  // Update form when athlete selection changes
  useEffect(() => {
    if (isScheduled) {
      form.setValue('trainingSession.athleteIds', selectedAthletes);
    }
  }, [selectedAthletes, form, isScheduled]);

  return (
    <div className="h-full flex flex-col">
      {/* Layout principal : une seule colonne centrée */}
      <div className="flex-1 flex justify-center min-h-0">
        <div className="w-full max-w-2xl flex flex-col min-h-0">
          <div className="mb-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-md font-medium">Planifier l'entraînement</h4>
                <p className="text-sm text-muted-foreground">
                  Programmer une session avec vos athlètes
                </p>
              </div>
              <Switch
                checked={isScheduled}
                onCheckedChange={toggleScheduling}
                id="schedule-workout"
              />
            </div>
          </div>

          <Card className={`flex-1 flex flex-col min-h-0 ${!isScheduled ? 'opacity-50 pointer-events-none' : ''}`}>
            <CardContent className="p-6 flex-1 flex flex-col min-h-0">
              {!isScheduled ? (
                <div className="flex items-center justify-center h-32 text-center text-muted-foreground">
                  <p className="text-sm">Activez le switch pour planifier l'entraînement</p>
                </div>
              ) : (
                <div className="space-y-6 flex-1 flex flex-col">
                  <FormField
                    control={form.control}
                    name="trainingSession.scheduledDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date de programmation</FormLabel>
                        <FormControl className="bg-sidebar">
                          <Input
                            type="date"
                            placeholder="Sélectionner une date"
                            {...field}
                            onChange={(e) => {
                              field.onChange(e.target.value);
                            }}
                            disabled={!isScheduled}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormItem className="flex-1 flex flex-col min-h-0">
                    <div className="flex justify-between items-center mb-2">
                      <FormLabel>Athlètes</FormLabel>
                      <Badge variant="outline" className="ml-2">
                        {selectedAthletes.length} sélectionné
                        {selectedAthletes.length !== 1 ? 's' : ''}
                      </Badge>
                    </div>

                    <div className="relative mb-3 flex-shrink-0 bg-sidebar">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Rechercher un athlète..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                        disabled={!isScheduled}
                      />
                    </div>

                    <div className="border rounded-md">
                      <div className="border-b px-3 py-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="select-all"
                            checked={selectAll}
                            onCheckedChange={() => toggleSelectAll()}
                            disabled={!isScheduled}
                          />
                          <label
                            htmlFor="select-all"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Tous les athlètes
                          </label>
                        </div>
                      </div>

                      <ScrollArea className="h-80">
                        <div className="p-2 space-y-1">
                          {isLoading ? (
                            <div className="flex items-center justify-center h-full py-4">
                              Chargement des athlètes...
                            </div>
                          ) : filteredAthletes.length === 0 ? (
                            <div className="text-center py-4 text-muted-foreground">
                              {searchQuery
                                ? 'Aucun athlète trouvé'
                                : 'Aucun athlète disponible'}
                            </div>
                          ) : (
                            filteredAthletes.map((athlete) => (
                              <div
                                key={athlete.id}
                                className="flex items-center space-x-2 px-2 py-1.5 rounded-md hover:bg-muted/50"
                              >
                                <Checkbox
                                  id={`athlete-${athlete.id}`}
                                  checked={selectedAthletes.includes(athlete.id)}
                                  onCheckedChange={() =>
                                    handleAthleteToggle(athlete.id)
                                  }
                                  disabled={!isScheduled}
                                />
                                <label
                                  htmlFor={`athlete-${athlete.id}`}
                                  className="flex-1 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                  {athlete.firstName} {athlete.lastName}
                                </label>
                              </div>
                            ))
                          )}
                        </div>
                      </ScrollArea>

                      {form.formState.errors.trainingSession?.athleteIds && (
                        <div className="px-3 py-2 text-sm text-destructive">
                          {form.formState.errors.trainingSession.athleteIds.message}
                        </div>
                      )}
                    </div>
                  </FormItem>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Boutons de navigation */}
      <div className="flex justify-between mt-6 flex-shrink-0">
        <Button variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onBack}>
            Retour
          </Button>
          <Button
            onClick={form.handleSubmit(onSubmit)}
            disabled={
              isScheduled &&
              (!form.watch('trainingSession.scheduledDate') ||
                selectedAthletes.length === 0)
            }
          >
            Créer l'entraînement
          </Button>
        </div>
      </div>
    </div>
  );
}
