import { api } from '@/lib/api';
import { Button } from '@/shared/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/components/ui/form';
import { Input } from '@/shared/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/shared/components/ui/tabs';
import { Textarea } from '@/shared/components/ui/textarea';
import { useToast } from '@/shared/hooks/use-toast';
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  CreateWorkout,
  WORKOUT_ELEMENT_TYPES,
  createWorkoutSchema,
} from '@dropit/schemas';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { PlusCircle } from 'lucide-react';
import { useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { z } from 'zod';
import { SortableWorkoutElement } from './sortable-workout-element';

// Définir le schéma étendu pour le formulaire qui inclut le champ session
const extendedWorkoutSchema = createWorkoutSchema.extend({
  session: z
    .object({
      athleteIds: z.array(z.string()),
      scheduledDate: z.string(),
    })
    .optional(),
});

type ExtendedWorkoutSchema = z.infer<typeof extendedWorkoutSchema>;

interface WorkoutCreationFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function WorkoutCreationForm({
  onSuccess,
  onCancel,
}: WorkoutCreationFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

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

  const { data: categories } = useQuery({
    queryKey: ['workoutCategories'],
    queryFn: async () => {
      const response = await api.workoutCategory.getWorkoutCategories();
      if (response.status !== 200) throw new Error('Failed to load categories');
      return response.body;
    },
  });

  const { mutate: createWorkoutMutation } = useMutation({
    mutationFn: async (data: CreateWorkout) => {
      const response = await api.workout.createWorkout({ body: data });
      if (response.status !== 201) {
        throw new Error('Erreur lors de la création du workout');
      }
      return response.body;
    },
    onSuccess: () => {
      toast({
        title: 'Workout créé avec succès',
        description: 'Le workout a été créé avec succès',
      });
      onSuccess?.();
    },
    onError: (error) => {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const form = useForm<ExtendedWorkoutSchema>({
    resolver: zodResolver(extendedWorkoutSchema),
    defaultValues: {
      title: '',
      description: '',
      workoutCategory: '',
      elements: [],
      session: {
        athleteIds: [],
        scheduledDate: '',
      },
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
      reps: 1,
      sets: 1,
      rest: 60,
      startWeight_percent: 70,
    });
  };

  const handleSubmit = (values: ExtendedWorkoutSchema) => {
    setIsLoading(true);
    try {
      // Si le formulaire contient des données de session, on les supprime avant de soumettre
      // car l'API createWorkout n'accepte pas encore ce champ
      const { session, ...workoutData } = values;
      createWorkoutMutation(workoutData as CreateWorkout);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="grid grid-cols-2 gap-8"
      >
        {/* Colonne de gauche : Informations générales */}
        <div className="space-y-6">
          <div className="grid gap-4">
            <h3 className="text-lg font-semibold">Informations générales</h3>
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Titre</FormLabel>
                  <FormControl className="bg-white">
                    <Input placeholder="Titre de l'entraînement" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl className="bg-white">
                    <Textarea
                      placeholder="Description, commentaires de l'entraînement"
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="workoutCategory"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Catégorie</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl className="bg-white">
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une catégorie" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories?.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Création...' : 'Créer'}
            </Button>
          </div>
        </div>

        {/* Colonne de droite : Éléments du workout */}
        <div className="space-y-6">
          <div className="flex justify-between flex-col gap-2">
            <h3 className="text-lg font-semibold">
              Éléments de l'entraînement
            </h3>
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
                <div className="space-y-2">
                  {fields.map((field, index) => (
                    <SortableWorkoutElement
                      key={field.id}
                      id={field.id}
                      index={index}
                      control={form.control}
                      onRemove={remove}
                      exercises={exercises}
                      complexes={complexes}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </div>
        </div>
      </form>
    </Form>
  );
}
