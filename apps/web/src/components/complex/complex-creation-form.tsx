import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
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
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { CreateComplex, createComplexSchema } from '@dropit/schemas';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { GripVertical, PlusCircle, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { z } from 'zod';
import { DialogCreation } from '../exercises/dialog-creation';
import { ExerciseCreationForm } from '../exercises/exercise-creation-form';
import { Button } from '../ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import { Input } from '../ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Textarea } from '../ui/textarea';
import { ComplexCategoryCreationForm } from './complex-category-creation-form';

type ComplexCreationFormProps = {
  onSuccess?: () => void;
  onCancel?: () => void;
};

// Composant pour chaque item sortable
function SortableExerciseItem({
  id,
  index,
  children,
}: {
  id: string;
  index: number;
  children: React.ReactNode;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex gap-2 items-start bg-background rounded-md p-2"
    >
      <div
        {...attributes}
        {...listeners}
        className="flex items-center justify-center w-8 h-8 rounded-md bg-muted text-muted-foreground cursor-grab active:cursor-grabbing"
      >
        <GripVertical className="h-4 w-4" />
      </div>
      <div className="flex items-center justify-center w-8 h-8 rounded-md bg-muted text-muted-foreground">
        {index + 1}
      </div>
      {children}
    </div>
  );
}

export function ComplexCreationForm({
  onSuccess,
  onCancel,
}: ComplexCreationFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [createExerciseModalOpen, setCreateExerciseModalOpen] = useState(false);
  const [createCategoryModalOpen, setCreateCategoryModalOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Récupération des exercices existants
  const { data: exercises } = useQuery({
    queryKey: ['exercises'],
    queryFn: async () => {
      const response = await api.exercise.getExercises();
      if (response.status !== 200) throw new Error('Failed to load exercises');
      return response.body;
    },
  });

  // Récupération des catégories
  const { data: categories } = useQuery({
    queryKey: ['complexCategories'],
    queryFn: async () => {
      const response = await api.complexCategory.getComplexCategories();
      if (response.status !== 200) throw new Error('Failed to load categories');
      return response.body;
    },
  });

  const { mutate: createComplexMutation } = useMutation({
    mutationFn: async (data: CreateComplex) => {
      const response = await api.complex.createComplex({ body: data });
      if (response.status !== 201) {
        throw new Error('Erreur lors de la création du complex');
      }
      return response.body;
    },
    onSuccess: () => {
      toast({
        title: 'Complex créé avec succès',
        description: 'Le complex a été créé avec succès',
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

  // Ajouter un state pour garder une trace de l'index en cours d'édition
  const [currentEditingIndex, setCurrentEditingIndex] = useState<number | null>(
    null
  );

  // Modifier le handler de création d'exercice
  const handleExerciseCreationSuccess = async (exerciseId: string) => {
    console.log('id de exercice créé', exerciseId);

    // D'abord rafraîchir la liste des exercices
    await queryClient.invalidateQueries({ queryKey: ['exercises'] });

    // Ensuite mettre à jour la sélection
    if (currentEditingIndex !== null) {
      form.setValue(`exercises.${currentEditingIndex}.exerciseId`, exerciseId, {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true,
      });
    }

    // Enfin fermer la modal
    setCreateExerciseModalOpen(false);
    setCurrentEditingIndex(null);
  };

  // Modifier le handler de création de catégorie
  const handleCategoryCreationSuccess = async (categoryId: string) => {
    // D'abord rafraîchir la liste des catégories
    await queryClient.invalidateQueries({ queryKey: ['complexCategories'] });

    // Mettre à jour la sélection de la catégorie
    form.setValue('complexCategory', categoryId, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });

    // Fermer la modal
    setCreateCategoryModalOpen(false);
  };

  const form = useForm<z.infer<typeof createComplexSchema>>({
    resolver: zodResolver(createComplexSchema),
    defaultValues: {
      name: '',
      description: '',
      complexCategory: '',
      exercises: [
        { exerciseId: '', order: 0 },
        { exerciseId: '', order: 1 },
      ],
    },
    mode: 'onSubmit',
  });

  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: 'exercises',
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

      // Mettre à jour l'ordre de tous les exercices
      fields.forEach((_, index) => {
        form.setValue(`exercises.${index}.order`, index);
      });
    }
  };

  const handleAddExercise = () => {
    append({ exerciseId: '', order: fields.length });
  };

  const handleSubmit = (formValues: z.infer<typeof createComplexSchema>) => {
    if (formValues.exercises.length < 2) {
      toast({
        title: 'Erreur',
        description: 'Un complex doit contenir au moins 2 exercices',
        variant: 'destructive',
      });
      return;
    }
    setIsLoading(true);
    try {
      createComplexMutation(formValues);
    } finally {
      setIsLoading(false);
    }
  };

  // Récupérer les exercices déjà sélectionnés (y compris les deux premiers)
  const selectedExerciseIds = fields
    .map((field) => field.exerciseId)
    .filter(Boolean);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(
          (data) => {
            console.log('Form submitted successfully:', data);
            handleSubmit(data);
          },
          (errors) => {
            console.log('Form validation errors:', errors);
          }
        )}
        className="grid gap-4 py-4"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nom</FormLabel>
              <FormControl>
                <Input placeholder="Nom du complex" {...field} />
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
              <FormControl>
                <Textarea placeholder="Description du complex" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="complexCategory"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Catégorie</FormLabel>
              <Select
                onValueChange={(value) => {
                  field.onChange(value);
                  if (value === 'new') {
                    setCreateCategoryModalOpen(true);
                  }
                }}
                value={field.value}
              >
                <FormControl>
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
                  <SelectItem value="new">
                    + Créer une nouvelle catégorie
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <FormLabel>Exercices</FormLabel>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddExercise}
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Ajouter un exercice
            </Button>
          </div>

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
                  <SortableExerciseItem
                    key={field.id}
                    id={field.id}
                    index={index}
                  >
                    <FormField
                      control={form.control}
                      name={`exercises.${index}.exerciseId`}
                      render={({ field: formField }) => (
                        <FormItem className="flex-1">
                          <Select
                            onValueChange={(value) => {
                              formField.onChange(value);
                              if (value === 'new') {
                                setCurrentEditingIndex(index);
                                setCreateExerciseModalOpen(true);
                              }
                            }}
                            value={formField.value || ''}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionner un exercice" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {exercises?.map((exercise) => (
                                <SelectItem
                                  key={exercise.id}
                                  value={exercise.id}
                                  disabled={
                                    selectedExerciseIds.includes(exercise.id) &&
                                    formField.value !== exercise.id
                                  }
                                >
                                  {exercise.name}
                                  {selectedExerciseIds.includes(exercise.id) &&
                                    formField.value !== exercise.id &&
                                    ' (déjà sélectionné)'}
                                </SelectItem>
                              ))}
                              <SelectItem value="new">
                                + Créer un nouvel exercice
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Ne permettre la suppression que pour les exercices au-delà des deux premiers */}
                    {index >= 2 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(index)}
                        className="h-8 w-8"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </SortableExerciseItem>
                ))}
              </div>
            </SortableContext>
          </DndContext>
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
      </form>

      <DialogCreation
        open={createExerciseModalOpen}
        onOpenChange={(open) => {
          setCreateExerciseModalOpen(open);
          if (!open) setCurrentEditingIndex(null);
        }}
        title="Créer un exercice"
        description="Ajoutez un nouvel exercice à votre catalogue."
      >
        <ExerciseCreationForm
          onSuccess={handleExerciseCreationSuccess}
          onCancel={() => {
            setCreateExerciseModalOpen(false);
            setCurrentEditingIndex(null);
          }}
        />
      </DialogCreation>

      <DialogCreation
        open={createCategoryModalOpen}
        onOpenChange={setCreateCategoryModalOpen}
        title="Créer une catégorie"
        description="Ajoutez une nouvelle catégorie de complex."
      >
        <ComplexCategoryCreationForm
          onSuccess={handleCategoryCreationSuccess}
          onCancel={() => setCreateCategoryModalOpen(false)}
        />
      </DialogCreation>
    </Form>
  );
}
