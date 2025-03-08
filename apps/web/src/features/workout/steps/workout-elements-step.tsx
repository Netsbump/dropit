import { api } from '@/lib/api';
import { Button } from '@/shared/components/ui/button';
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
import { PlusCircle } from 'lucide-react';
import { UseFormReturn, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { SortableWorkoutElement } from '../sortable-workout-element';

// Importer le schéma étendu depuis le stepper parent
const extendedWorkoutSchema = createWorkoutSchema.extend({
  session: z
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

  const handleAddElement = (type: 'exercise' | 'complex') => {
    append({
      type:
        type === 'exercise'
          ? WORKOUT_ELEMENT_TYPES.EXERCISE
          : WORKOUT_ELEMENT_TYPES.COMPLEX,
      id: '',
      order: fields.length,
      sets: 1,
      reps: 1,
      rest: 60,
      startWeight_percent: 70,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between flex-col gap-2">
        <h3 className="text-lg font-semibold">Éléments de l'entraînement</h3>
        <Tabs defaultValue="exercise" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="exercise">Exercice</TabsTrigger>
            <TabsTrigger value="complex">Complex</TabsTrigger>
          </TabsList>
          <TabsContent value="exercise">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => handleAddElement('exercise')}
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Ajouter un exercice
            </Button>
          </TabsContent>
          <TabsContent value="complex">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => handleAddElement('complex')}
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Ajouter un complex
            </Button>
          </TabsContent>
        </Tabs>
      </div>

      <div className="max-h-[60vh] overflow-y-auto pr-2">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={fields.map((field) => field.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="columns-1 md:columns-2 gap-4 relative">
              {fields.map((field, index) => (
                <div key={field.id} className="break-inside-avoid mb-4">
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

      <div className="flex justify-between">
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
