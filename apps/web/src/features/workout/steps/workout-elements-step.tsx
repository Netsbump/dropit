import { api } from '@/lib/api';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
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
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Search } from 'lucide-react';
import { UseFormReturn, useFieldArray } from 'react-hook-form';
import { useState } from 'react';
import { z } from 'zod';
import { SortableWorkoutElement } from '../sortable-workout-element';
import { DialogCreation } from '../../exercises/dialog-creation';
import { ExerciseCreationForm } from '../../exercises/exercise-creation-form';
import { ComplexCreationForm } from '../../complex/complex-creation-form';

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
  const [activeTab, setActiveTab] = useState<'exercise' | 'complex'>('exercise');
  const [createExerciseModalOpen, setCreateExerciseModalOpen] = useState(false);
  const [createComplexModalOpen, setCreateComplexModalOpen] = useState(false);
  const queryClient = useQueryClient();

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

  const handleExerciseCreationSuccess = async () => {
    // Rafraîchir la liste des exercices
    await queryClient.invalidateQueries({ queryKey: ['exercises'] });
    setCreateExerciseModalOpen(false);
  };

  const handleComplexCreationSuccess = async () => {
    // Rafraîchir la liste des complexes
    await queryClient.invalidateQueries({ queryKey: ['complexes'] });
    setCreateComplexModalOpen(false);
  };

  // Filtrer les exercices et complexes selon la recherche
  const filteredExercises = exercises?.filter(exercise =>
    exercise.name.toLowerCase().includes(exerciseSearch.toLowerCase())
  ) || [];

  const filteredComplexes = complexes?.filter(complex =>
    complex.complexCategory?.name?.toLowerCase().includes(complexSearch.toLowerCase())
  ) || [];

  return (
    <div className="h-full flex flex-col">

      {/* Layout principal : 2 colonnes */}
      <div className="flex-1 grid grid-cols-4 gap-6 min-h-0 mt-6">

        {/* Colonne gauche : Liste des éléments disponibles */}
        <div className="col-span-1 flex flex-col min-h-0">
          <div className="mb-4">
            <h4 className="text-md font-medium">Éléments disponibles</h4>
            <p className="text-sm text-muted-foreground">
              Cliquez pour ajouter à votre entraînement
            </p>
          </div>

          <Card className="flex-1 flex flex-col min-h-0">
            <CardContent className="p-4 flex-1 flex flex-col min-h-0">
              <div className="flex-1 flex flex-col min-h-0">
                {/* Tabs List */}
                <div className="grid w-full grid-cols-2 flex-shrink-0 mb-4">
                  <button
                    type="button"
                    onClick={() => setActiveTab('exercise')}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                      activeTab === 'exercise'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    Exercices
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('complex')}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                      activeTab === 'complex'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    Complexes
                  </button>
                </div>
                
                {/* Tab Content */}
                <div className="flex-1 flex flex-col min-h-0">
                  {activeTab === 'exercise' && (
                    <div className="flex-1 flex flex-col min-h-0">
                      <div className="relative mb-3 flex-shrink-0 bg-sidebar">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Rechercher un exercice..."
                          value={exerciseSearch}
                          onChange={(e) => setExerciseSearch(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      
                      <div className="mb-3 flex-shrink-0">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setCreateExerciseModalOpen(true);
                          }}
                          className="w-full bg-orange-100"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Créer un nouvel exercice
                        </Button>
                      </div>
                      
                      <div className="flex-1 overflow-y-auto space-y-2 min-h-0">
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
                                type="button"
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
                    </div>
                  )}
                  
                  {activeTab === 'complex' && (
                    <div className="flex-1 flex flex-col min-h-0">
                      <div className="relative mb-3 flex-shrink-0 bg-sidebar">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Rechercher un complexe..."
                          value={complexSearch}
                          onChange={(e) => setComplexSearch(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      
                      <div className="mb-3 flex-shrink-0">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setCreateComplexModalOpen(true);
                          }}
                          className="w-full bg-orange-100"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Créer un nouveau complexe
                        </Button>
                      </div>
                      
                      <div className="flex-1 overflow-y-auto space-y-2 min-h-0">
                        {filteredComplexes.map((complex) => (
                          <div 
                            key={complex.id} 
                            className="border rounded-lg p-3 cursor-pointer hover:bg-muted/50 transition-colors bg-background"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <h5 className="font-medium text-sm">{complex.complexCategory?.name || 'Complex'}</h5>
                                <p className="text-xs text-muted-foreground">
                                  {complex.exercises.length} exercices
                                </p>
                              </div>
                              <Button
                                type="button"
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
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Colonne droite : Éléments sélectionnés */}
        <div className="col-span-3 flex flex-col min-h-0">
          <div className="mb-4">
            <h4 className="text-md font-medium">Éléments sélectionnés</h4>
            <p className="text-sm text-muted-foreground">
              Glissez-déposez pour réorganiser l'ordre
            </p>
          </div>
          
          <Card className="flex-1 flex flex-col min-h-0 relative">
            <CardContent className="p-4 flex-1 flex flex-col min-h-0">
              {fields.length === 0 ? (
                <div className="flex items-center justify-center h-32 border-2 border-dashed rounded-lg">
                  <div className="text-center text-muted-foreground">
                    <p>Aucun élément sélectionné</p>
                    <p className="text-sm">Ajoutez des exercices ou complexes depuis le panneau de gauche</p>
                  </div>
                </div>
              ) : (
                <div className="flex-1 overflow-x-auto min-h-0">
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={fields.map((field) => field.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div
                        className="flex flex-col flex-wrap gap-4 h-full"
                      >
                        {fields.map((field, index) => (
                          <div
                          key={field.id}
                          className="w-[49%]"
                        >
                            <SortableWorkoutElement
                              id={field.id}
                              index={index}
                              control={form.control}
                              onRemove={remove}
                              exercises={exercises}
                              complexes={complexes}
                            />
                          </div>
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
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
          <Button onClick={onNext}>Suivant</Button>
        </div>
      </div>

      {/* Modales de création */}
      <DialogCreation
        open={createExerciseModalOpen}
        onOpenChange={setCreateExerciseModalOpen}
        title="Créer un exercice"
        description="Ajoutez un nouvel exercice à votre catalogue."
      >
        <ExerciseCreationForm
          onSuccess={handleExerciseCreationSuccess}
          onCancel={() => setCreateExerciseModalOpen(false)}
        />
      </DialogCreation>

      <DialogCreation
        open={createComplexModalOpen}
        onOpenChange={setCreateComplexModalOpen}
        title="Créer un complexe"
        description="Ajoutez un nouveau complexe à votre catalogue."
        maxWidth="lg"
      >
        <ComplexCreationForm
          onSuccess={handleComplexCreationSuccess}
          onCancel={() => setCreateComplexModalOpen(false)}
        />
      </DialogCreation>
    </div>
  );
}
