import { api } from '@/lib/api';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/shared/components/ui/tabs';
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SortableContext } from '@dnd-kit/sortable';
import { WORKOUT_ELEMENT_TYPES } from '@dropit/schemas';
import { createWorkoutSchema } from '@dropit/schemas';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search } from 'lucide-react';
import { UseFormReturn, useFieldArray } from 'react-hook-form';
import { useState } from 'react';
import { z } from 'zod';
import { SortableWorkoutElement } from '../sortable-workout-element';

// Importer le schéma étendu depuis le stepper parent
const extendedWorkoutSchema = createWorkoutSchema.extend({
  trainingSession: z
    .object({
      athleteIds: z.array(z.string()),
      scheduledDate: z.string(),
    })
    .optional(),
});

type ExtendedWorkoutSchema = z.infer<typeof extendedWorkoutSchema>;

interface WorkoutElementsStepProps {
  form: UseFormReturn<ExtendedWorkoutSchema>;
  onBack: () => void;
  onNext: () => void;
  onCancel: () => void;
}

export function WorkoutElementsStep({
  form,
  onBack,
  onNext,
  onCancel,
}: WorkoutElementsStepProps) {
  const [exerciseSearch, setExerciseSearch] = useState('');
  const [complexSearch, setComplexSearch] = useState('');

  // Queries pour récupérer les données nécessaires
  const { data: exercises } = useQuery({
    queryKey: ['exercises'],
    queryFn: async () => {
      const response = await api.exercise.getExercises();
      if (response.status !== 200) throw new Error('Failed to load exercises');
      return response.body;
    },
  });

  const { data: complexes } = useQuery({
    queryKey: ['complexes'],
    queryFn: async () => {
      const response = await api.complex.getComplexes();
      if (response.status !== 200) throw new Error('Failed to load complexes');
      return response.body;
    },
  });

  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: 'elements',
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = fields.findIndex((field) => field.id === active.id);
      const newIndex = fields.findIndex((field) => field.id === over.id);
      move(oldIndex, newIndex);
      fields.forEach((_, index) => {
        form.setValue(`elements.${index}.order`, index);
      });
    }
  };

  const handleAddElement = (type: 'exercise' | 'complex', itemId?: string) => {
    append({
      type:
        type === 'exercise'
          ? WORKOUT_ELEMENT_TYPES.EXERCISE
          : WORKOUT_ELEMENT_TYPES.COMPLEX,
      id: itemId || '',
      order: fields.length,
      sets: 1,
      reps: 1,
      rest: 60,
      startWeight_percent: 70,
    });
  };

  // Filtrer les exercices et complexes selon la recherche
  const filteredExercises = exercises?.filter(exercise =>
    exercise.name.toLowerCase().includes(exerciseSearch.toLowerCase())
  ) || [];

  const filteredComplexes = complexes?.filter(complex =>
    complex.name.toLowerCase().includes(complexSearch.toLowerCase())
  ) || [];

  return (
    <div className="h-full flex flex-col">
      {/* Titre */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold">Éléments de l'entraînement</h3>
      </div>

      {/* Layout principal : 2 colonnes */}
      <div className="flex-1 grid grid-cols-4 gap-6 min-h-0">
        {/* Colonne gauche : Éléments sélectionnés */}
        <div className="col-span-3 flex flex-col">
          <div className="mb-4">
            <h4 className="text-md font-medium">Éléments sélectionnés</h4>
            <p className="text-sm text-muted-foreground">
              Glissez-déposez pour réorganiser l'ordre
            </p>
          </div>
          
          <Card className="flex-1 flex flex-col">
            <CardContent className="p-4 flex-1 flex flex-col">
              {fields.length === 0 ? (
                <div className="flex items-center justify-center h-32 border-2 border-dashed rounded-lg">
                  <div className="text-center text-muted-foreground">
                    <p>Aucun élément sélectionné</p>
                    <p className="text-sm">Ajoutez des exercices ou complexes depuis le panneau de droite</p>
                  </div>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto">
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={fields.map((field) => field.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="flex gap-4">
                        <div className="flex-1 space-y-4">
                          {fields.map((field, index) => 
                            index % 2 === 0 ? (
                              <SortableWorkoutElement
                                key={field.id}
                                id={field.id}
                                index={index}
                                control={form.control}
                                onRemove={remove}
                                exercises={exercises}
                                complexes={complexes}
                              />
                            ) : null
                          )}
                        </div>
                        <div className="flex-1 space-y-4">
                          {fields.map((field, index) => 
                            index % 2 === 1 ? (
                              <SortableWorkoutElement
                                key={field.id}
                                id={field.id}
                                index={index}
                                control={form.control}
                                onRemove={remove}
                                exercises={exercises}
                                complexes={complexes}
                              />
                            ) : null
                          )}
                        </div>
                      </div>
                    </SortableContext>
                  </DndContext>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Colonne droite : Liste des éléments disponibles */}
        <div className="col-span-1 flex flex-col">
          <div className="mb-4">
            <h4 className="text-md font-medium">Éléments disponibles</h4>
            <p className="text-sm text-muted-foreground">
              Cliquez pour ajouter à votre entraînement
            </p>
          </div>

          <Card className="flex-1 flex flex-col">
            <CardContent className="p-4 flex-1 flex flex-col">
              <Tabs defaultValue="exercise" className="flex-1 flex flex-col">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="exercise">Exercices</TabsTrigger>
                  <TabsTrigger value="complex">Complexes</TabsTrigger>
                </TabsList>
                
                <TabsContent value="exercise" className="flex-1 flex flex-col mt-4">
                  <div className="relative mb-3">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Rechercher un exercice..."
                      value={exerciseSearch}
                      onChange={(e) => setExerciseSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <div className="flex-1 overflow-y-auto space-y-2 flex flex-col justify-start">
                    {filteredExercises.map((exercise) => (
                      <div 
                        key={exercise.id} 
                        className="border rounded-lg p-3 cursor-pointer hover:bg-muted/50 transition-colors bg-background"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h5 className="font-medium text-sm">{exercise.name}</h5>
                            <p className="text-xs text-muted-foreground">
                              {exercise.exerciseCategory.name}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleAddElement('exercise', exercise.id)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="complex" className="flex-1 flex flex-col mt-4">
                  <div className="relative mb-3">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Rechercher un complexe..."
                      value={complexSearch}
                      onChange={(e) => setComplexSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <div className="flex-1 overflow-y-auto space-y-2 flex flex-col justify-start">
                    {filteredComplexes.map((complex) => (
                      <div 
                        key={complex.id} 
                        className="border rounded-lg p-3 cursor-pointer hover:bg-muted/50 transition-colors bg-background"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h5 className="font-medium text-sm">{complex.name}</h5>
                            <p className="text-xs text-muted-foreground">
                              {complex.exercises.length} exercices
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleAddElement('complex', complex.id)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Boutons de navigation */}
      <div className="flex justify-between mt-6">
        <Button variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onBack}>
            Retour
          </Button>
          <Button onClick={onNext}>Suivant</Button>
        </div>
      </div>
    </div>
  );
}
