import { api } from '@/lib/api';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader } from '@/shared/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/components/ui/form';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Separator } from '@/shared/components/ui/separator';
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
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  ComplexDto,
  UpdateComplex,
  updateComplexSchema,
} from '@dropit/schemas';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { GripVertical, PlusCircle, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { z } from 'zod';
import { DialogCreation } from '../exercises/dialog-creation';
import { ExerciseCreationForm } from '../exercises/exercise-creation-form';
import { ComplexCategoryCreationForm } from './complex-category-creation-form';

interface ComplexDetailProps {
  complex: ComplexDto;
}

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

export function ComplexDetail({ complex }: ComplexDetailProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [createExerciseModalOpen, setCreateExerciseModalOpen] = useState(false);
  const [currentEditingIndex, setCurrentEditingIndex] = useState<number | null>(
    null
  );
  const [createCategoryModalOpen, setCreateCategoryModalOpen] = useState(false);

  const { data: categories } = useQuery({
    queryKey: ['complexCategories'],
    queryFn: async () => {
      const response = await api.complexCategory.getComplexCategories();
      if (response.status !== 200) throw new Error('Failed to load categories');
      return response.body;
    },
  });

  const { data: exercises } = useQuery({
    queryKey: ['exercises'],
    queryFn: async () => {
      const response = await api.exercise.getExercises();
      if (response.status !== 200) throw new Error('Failed to load exercises');
      return response.body;
    },
  });

  const { mutate: updateComplexMutation } = useMutation({
    mutationFn: async (data: UpdateComplex) => {
      const response = await api.complex.updateComplex({
        params: { id: complex.id },
        body: data,
      });
      if (response.status !== 200) {
        throw new Error('Erreur lors de la modification du complex');
      }
      return response.body;
    },
    onSuccess: () => {
      toast({
        title: 'Complex modifié avec succès',
        description: 'Le complex a été modifié avec succès',
      });
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ['complexes'] });
      queryClient.invalidateQueries({ queryKey: ['complex'] });
    },
    onError: (error) => {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const form = useForm<z.infer<typeof updateComplexSchema>>({
    resolver: zodResolver(updateComplexSchema),
    defaultValues: {
      name: complex.name,
      description: complex.description ?? '',
      complexCategory: complex.complexCategory.id,
      exercises: complex.exercises.map((e, index) => ({
        exerciseId: e.id,
        order: index,
        reps: e.reps,
      })),
    },
    mode: 'onSubmit',
  });

  const { fields, remove, move, append } = useFieldArray({
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

  const selectedExerciseIds = fields.map((field) => field.exerciseId);

  const handleExerciseCreationSuccess = async (exerciseId: string) => {
    await queryClient.invalidateQueries({ queryKey: ['exercises'] });

    if (currentEditingIndex !== null) {
      form.setValue(`exercises.${currentEditingIndex}.exerciseId`, exerciseId, {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true,
      });
    }

    setCreateExerciseModalOpen(false);
    setCurrentEditingIndex(null);
  };

  const handleCategoryCreationSuccess = async (categoryId: string) => {
    await queryClient.invalidateQueries({ queryKey: ['complexCategories'] });

    form.setValue('complexCategory', categoryId, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });

    setCreateCategoryModalOpen(false);
  };

  const handleSubmit = async (
    formValues: z.infer<typeof updateComplexSchema>
  ) => {
    const exercisesLength = formValues.exercises?.length ?? 0;
    if (exercisesLength < 2) {
      toast({
        title: 'Erreur',
        description: 'Un complex doit contenir au moins 2 exercices',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      updateComplexMutation(formValues);
    } catch (error) {
      console.error('Mutation error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isEditing) {
    return (
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(
            async (data) => {
              await handleSubmit(data);
            },
            (errors) => {
              console.error('Form validation errors:', errors);
            }
          )}
          className="space-y-6"
        >
          {/* Informations principales */}
          <Card className="bg-background rounded-md shadow-none">
            <CardContent className="space-y-4 pt-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom</FormLabel>
                    <FormControl>
                      <Input {...field} />
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
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Catégorie dans une Card séparée */}
          <Card className="bg-background rounded-md shadow-none">
            <CardContent className="pt-6">
              <FormField
                control={form.control}
                name="complexCategory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Catégorie</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        if (value === 'new') {
                          setCreateCategoryModalOpen(true);
                        } else {
                          field.onChange(value);
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
            </CardContent>
          </Card>

          {/* Liste des exercices avec drag & drop */}
          <Card className="bg-background rounded-md shadow-none">
            <CardHeader className="flex flex-row items-center justify-between">
              <Label>Exercices ({fields.length})</Label>
              <Button
                type="button"
                size="sm"
                onClick={() =>
                  append({
                    exerciseId: '',
                    order: fields.length,
                    reps: 1,
                  })
                }
                disabled={!exercises?.length}
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Ajouter un exercice
              </Button>
            </CardHeader>

            <CardContent>
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
                                value={formField.value}
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
                                        selectedExerciseIds.includes(
                                          exercise.id
                                        ) && formField.value !== exercise.id
                                      }
                                    >
                                      {exercise.name}
                                      {selectedExerciseIds.includes(
                                        exercise.id
                                      ) &&
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
            </CardContent>
          </Card>

          <Separator />

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsEditing(false)}
              disabled={isLoading}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Mise à jour...' : 'Mettre à jour'}
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

  return (
    <div className="space-y-6">
      {/* Informations principales */}
      <Card className="bg-background rounded-md shadow-none">
        <CardContent className="space-y-4 pt-6">
          <div className="space-y-2">
            <Label>Nom</Label>
            <p className="text-sm">{complex.name}</p>
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <p className="text-sm text-muted-foreground">
              {complex.description || 'Pas de description'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Catégorie dans une Card séparée */}
      <Card className="bg-background rounded-md shadow-none">
        <CardContent className="pt-6">
          <div className="space-y-2">
            <Label>Catégorie</Label>
            <Badge variant="secondary">{complex.complexCategory.name}</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Liste des exercices */}
      <Card className="bg-background rounded-md shadow-none">
        <CardHeader>
          <Label>Exercices ({complex.exercises?.length || 0})</Label>
        </CardHeader>
        <CardContent className="space-y-2">
          {complex.exercises?.map((exercise, index) => (
            <div
              key={exercise.id}
              className="flex items-center gap-4 p-2 rounded-md bg-muted"
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-md bg-background text-foreground">
                {index + 1}
              </div>
              <span className="text-sm">{exercise.name}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Métadonnées */}
      <Card className="bg-background rounded-md shadow-none">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Créé le</Label>
                <p className="text-sm">
                  {format(new Date(), 'Pp', { locale: fr })}
                </p>
              </div>
              <div className="space-y-2">
                <Label>Dernière modification</Label>
                <p className="text-sm">
                  {format(new Date(), 'Pp', { locale: fr })}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator />

      <div className="flex justify-end">
        <Button onClick={() => setIsEditing(true)}>Modifier</Button>
      </div>
    </div>
  );
}
