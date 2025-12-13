import { api } from '@/lib/api';
import { Button } from '@/shared/components/ui/button';
import { FileUpload } from '@/shared/components/ui/file-upload';
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
import { useToast } from '@/shared/hooks/use-toast';
import { CreateExercise, createExerciseSchema } from '@dropit/schemas';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

type ExerciseCreationFormProps = {
  onSuccess?: (exerciseId: string) => void;
  onCancel?: () => void;
};

export function ExerciseCreationForm({
  onSuccess,
  onCancel,
}: ExerciseCreationFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const { data: exerciseCategories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['exercise-categories'],
    queryFn: async () => {
      const response = await api.exerciseCategory.getExerciseCategories();
      if (response.status !== 200) throw new Error('Failed to load categories');
      return response.body;
    },
  });

  const { mutateAsync: createExerciseMutation } = useMutation({
    mutationFn: async (data: CreateExercise) => {
      const response = await api.exercise.createExercise({ body: data });
      if (response.status !== 201) {
        throw new Error("Erreur lors de la création de l'exercice");
      }
      return response.body;
    },
    onSuccess: (data) => {
      console.log('Exercice créé avec succès:', data);
      toast({
        title: 'Exercice créé avec succès',
        description: "L'exercice a été créé avec succès",
      });
      onSuccess?.(data.id);
    },
    onError: (error) => {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = async (formValues: z.infer<typeof formExerciseSchema>) => {
    setIsLoading(true);

    try {
      await createExerciseMutation(formValues);
    } finally {
      setIsLoading(false);
    }
  };

  const formExerciseSchema = createExerciseSchema;
  const form = useForm<z.infer<typeof formExerciseSchema>>({
    resolver: zodResolver(formExerciseSchema),
    defaultValues: {
      name: '',
      exerciseCategory: undefined,
      englishName: '',
      shortName: '',
      video: undefined,
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="grid gap-4 py-4"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel>Nom</FormLabel>
              <FormControl>
                <Input placeholder="Nom de l'exercice" {...field} />
              </FormControl>
              {fieldState.error && (
                <FormMessage>{fieldState.error.message}</FormMessage>
              )}
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="exerciseCategory"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Catégorie</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une catégorie" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categoriesLoading ? (
                    <SelectItem value="loading">Chargement...</SelectItem>
                  ) : (
                    exerciseCategories?.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="englishName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nom en anglais</FormLabel>
              <FormControl>
                <Input placeholder="Nom en anglais" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="shortName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Abbréviation</FormLabel>
              <FormControl>
                <Input placeholder="Abbréviation" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="video"
          render={({ field: { value, onChange, ...field } }) => (
            <FormItem>
              <FormLabel>Vidéo</FormLabel>
              <FormControl>
                <FileUpload
                  accept="video/mp4,video/webm,video/ogg"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    onChange(file);
                  }}
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />

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
    </Form>
  );
}
