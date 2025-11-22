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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
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
import { CreateComplex, createComplexSchema } from '@dropit/schemas';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PlusCircle } from 'lucide-react';
import { useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { z } from 'zod';
import { DialogCreation } from '../exercises/dialog-creation';
import { ExerciseCreationForm } from '../exercises/exercise-creation-form';
import { ComplexCategoryCreationForm } from './complex-category-creation-form';
import { SortableExerciseItem } from './sortable-exercise-item';

type ComplexCreationFormProps = {
  onSuccess?: () => void;
  onCancel?: () => void;
};

export function ComplexCreationForm({
  onSuccess,
  onCancel,
}: ComplexCreationFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [createExerciseModalOpen, setCreateExerciseModalOpen] = useState(false);
  const [createCategoryModalOpen, setCreateCategoryModalOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: exercises } = useQuery({
    queryKey: ['exercises'],
    queryFn: async () => {
      const response = await api.exercise.getExercises();
      if (response.status !== 200) throw new Error('Failed to load exercises');
      return response.body;
    },
  });

  const { data: categories } = useQuery({
    queryKey: ['complexCategories'],
    queryFn: async () => {
      const response = await api.complexCategory.getComplexCategories();
      if (response.status !== 200) throw new Error('Failed to load categories');
      return response.body;
    },
  });

  const { mutateAsync: createComplexMutation } = useMutation({
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

  // state pour garder une trace de l'index en cours d'édition
  const [currentEditingIndex, setCurrentEditingIndex] = useState<number | null>(
    null
  );

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

  const handleCategoryCreationSuccess = async (categoryId: string) => {
    // D'abord rafraîchir la liste des catégories
    await queryClient.invalidateQueries({ queryKey: ['complexCategories'] });

    // Mettre à jour la sélection de la catégorie
    form.setValue('complexCategory', categoryId, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });

    setCreateCategoryModalOpen(false);
  };

  const formComplexSchema = createComplexSchema;
  const form = useForm<z.infer<typeof formComplexSchema>>({
    resolver: zodResolver(formComplexSchema),
    defaultValues: {
      complexCategory: '',
      exercises: [
        {
          exerciseId: '',
          order: 0,
        },
        {
          exerciseId: '',
          order: 1,
        },
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
    append({
      exerciseId: '',
      order: fields.length,
    });
  };

  const handleSubmit = async (formValues: z.infer<typeof formComplexSchema>) => {
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
      await createComplexMutation(formValues);
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

          <div className="max-h-[40vh] overflow-y-auto pr-2">
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
                      control={form.control}
                      onRemove={remove}
                      onCreateExercise={(index) => {
                        setCurrentEditingIndex(index);
                        setCreateExerciseModalOpen(true);
                      }}
                      exercises={exercises}
                      selectedExerciseIds={selectedExerciseIds}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </div>
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
