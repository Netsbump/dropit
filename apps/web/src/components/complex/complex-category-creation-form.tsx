import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import {
  CreateComplexCategory,
  createComplexCategorySchema,
} from '@dropit/schemas';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
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

type ComplexCategoryCreationFormProps = {
  onSuccess?: (categoryId: string) => void;
  onCancel?: () => void;
};

export function ComplexCategoryCreationForm({
  onSuccess,
  onCancel,
}: ComplexCategoryCreationFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const { mutate: createCategoryMutation } = useMutation({
    mutationFn: async (data: CreateComplexCategory) => {
      const response = await api.complexCategory.createComplexCategory({
        body: data,
      });
      if (response.status !== 201) {
        throw new Error('Erreur lors de la création de la catégorie');
      }
      return response.body;
    },
    onSuccess: (data) => {
      toast({
        title: 'Catégorie créée avec succès',
        description: 'La catégorie a été créée avec succès',
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

  const form = useForm<z.infer<typeof createComplexCategorySchema>>({
    resolver: zodResolver(createComplexCategorySchema),
    defaultValues: {
      name: '',
    },
  });

  const handleSubmit = (
    values: z.infer<typeof createComplexCategorySchema>
  ) => {
    setIsLoading(true);
    try {
      createCategoryMutation(values);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nom</FormLabel>
              <FormControl>
                <Input placeholder="Nom de la catégorie" {...field} />
              </FormControl>
              <FormMessage />
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
