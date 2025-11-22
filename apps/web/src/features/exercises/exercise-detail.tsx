import { api } from '@/lib/api';
import { Button } from '@/shared/components/ui/button';
import { CardContent, CardHeader } from '@/shared/components/ui/card';
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
import { toast } from '@/shared/hooks/use-toast';
import { UpdateExercise, updateExerciseSchema } from '@dropit/schemas';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Badge } from '@/shared/components/ui/badge';
import { getCategoryBadgeVariant } from '@/shared/utils';
import { Separator } from '@/shared/components/ui/separator';

interface ExerciseDetailProps {
  exercise: {
    name: string;
    exerciseCategory: {
      name: string;
      id: string;
    };
    id: string;
    description?: string;
    video?: string;
    englishName?: string;
    shortName?: string;
  };
}

export function ExerciseDetail({ exercise }: ExerciseDetailProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const queryClient = useQueryClient();

  const { data: exerciseCategories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['exercise-categories'],
    queryFn: async () => {
      const response = await api.exerciseCategory.getExerciseCategories();
      if (response.status !== 200) throw new Error('Failed to load categories');
      return response.body;
    },
  });

  const { mutate: updateExerciseMutation } = useMutation({
    mutationFn: async (data: UpdateExercise) => {
      const response = await api.exercise.updateExercise({
        params: { id: exercise.id },
        body: data,
      });
      if (response.status !== 200) {
        throw new Error("Erreur lors de la modification de l'exercice");
      }
      return response.body;
    },
    onSuccess: () => {
      toast({
        title: 'Exercice modifié avec succès',
        description: "L'exercice a été modifié avec succès",
      });
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ['exercises'] });
      queryClient.invalidateQueries({ queryKey: ['exercise'] });
    },
    onError: (error) => {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (formValues: z.infer<typeof formExerciseSchema>) => {
    setIsLoading(true);

    try {
      updateExerciseMutation(formValues);
    } finally {
      setIsLoading(false);
    }
  };

  const formExerciseSchema = updateExerciseSchema;
  const form = useForm<z.infer<typeof formExerciseSchema>>({
    resolver: zodResolver(formExerciseSchema),
    defaultValues: {
      name: exercise.name,
      exerciseCategory: exercise.exerciseCategory.id,
      video: exercise.video ?? undefined,
      englishName: exercise.englishName ?? '',
      shortName: exercise.shortName ?? '',
    },
  });

  if (isEditing) {
    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <div className="space-y-6">

            {/* Premier bloc - Vidéo */}
            <CardHeader className="space-y-4 p-0">
              <Label className='text-gray-500' >Vidéo</Label>
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center text-muted-foreground">
                Aucune vidéo (placeholder)
              </div>
            </CardHeader>

            {/* Second bloc - Nom et description */}
            <CardContent className="space-y-4 p-0">
              <FormField
                control={form.control}
                name="name"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel className='text-gray-500' >Nom</FormLabel>
                    <FormControl className="bg-white">
                      <Input placeholder="Nom de l'exercice" {...field} />
                    </FormControl>
                    {fieldState.error && (
                      <FormMessage>{fieldState.error.message}</FormMessage>
                    )}
                  </FormItem>
                )}
              />
            </CardContent>

            <Separator />
            {/* Troisième bloc - Catégorie et noms alternatifs */}
            <CardContent className="p-0">
              <div className="space-y-4">
                <div className="space-y-2">
                  <FormField
                    control={form.control}
                    name="exerciseCategory"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className='text-gray-500' >Catégorie</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl className="bg-white">
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner une catégorie" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categoriesLoading ? (
                              <SelectItem value="loading">
                                Chargement...
                              </SelectItem>
                            ) : (
                              exerciseCategories?.map((category) => (
                                <SelectItem
                                  key={category.id}
                                  value={category.id}
                                >
                                  {category.name}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <FormField
                      control={form.control}
                      name="shortName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className='text-gray-500' >Abbréviation</FormLabel>
                          <FormControl className="bg-white">
                            <Input placeholder="Abbréviation" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <FormField
                      control={form.control}
                      name="englishName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className='text-gray-500' >Nom en anglais</FormLabel>
                          <FormControl className="bg-white">
                            <Input {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
     
            <Separator />
            {/* Quatrième bloc - Métadonnées */}
            <CardContent className="p-0">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className='text-gray-500'>Créé le</Label>
                    <p className="text-sm font-semibold text-gray-600">
                      {format(new Date(), 'Pp', { locale: fr })}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className='text-gray-500'>Dernière modification</Label>
                    <p className="text-sm font-semibold text-gray-600">
                      {format(new Date(), 'Pp', { locale: fr })}
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className='text-gray-500'>Auteur</Label>
                  <p className="text-sm font-semibold text-gray-600">John Doe</p>
                </div>
              </div>
            </CardContent>

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
                Mettre à jour
              </Button>
            </div>
          </div>
        </form>
      </Form>
    );
  }

  return (
    <div className="space-y-6">
      {/* Premier bloc - Vidéo */}
      <CardHeader className="space-y-4 p-0">
        <Label className='text-gray-500' >Vidéo</Label>
        <div className="aspect-video bg-muted rounded-lg flex items-center justify-center text-muted-foreground">
          Aucune vidéo (placeholder)
        </div>
      </CardHeader>

       {/* Second bloc - Informations principales */}
      <CardContent className="space-y-4 p-0">
        <div className="space-y-2">
          <Label className='text-gray-500' >Nom</Label>
          <p className="text-sm font-semibold text-gray-600">{exercise.name}</p>
        </div>

        <div className="space-y-2">
          <Label className='text-gray-500' >Description</Label>
          <p className="text-sm font-semibold text-gray-600">
            {exercise.description || 'pas de description'}
          </p>
        </div>
      </CardContent>

      <Separator />
      {/* Troisième bloc - Catégorie et noms alternatifs */}
      <CardContent className="p-0">
        <div className="space-y-4">
          <div className="space-y-2 space-x-2">
            <Label className='text-gray-500' >Catégorie</Label>
            <Badge 
              className={`text-xs border-0 ${getCategoryBadgeVariant(exercise.exerciseCategory.name)}`}
            >
              {exercise.exerciseCategory.name}
            </Badge>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className='text-gray-500' >Nom court</Label>
              <p className="text-sm font-semibold text-gray-600">{exercise.shortName || '-'}</p>
            </div>
            <div className="space-y-2">
              <Label className='text-gray-500' >Nom anglais</Label>
              <p className="text-sm font-semibold text-gray-600">{exercise.englishName || '-'}</p>
            </div>
          </div>
        </div>
      </CardContent>

      <Separator />
      {/* Quatrième bloc - Métadonnées */}
      <CardContent className="p-0">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className='text-gray-500' >Créé le</Label>
              <p className="text-sm font-semibold text-gray-600">
                {format(new Date(), 'Pp', { locale: fr })}
              </p>
            </div>
            <div className="space-y-2">
              <Label className='text-gray-500' >Dernière modification</Label>
              <p className="text-sm font-semibold text-gray-600">
                {format(new Date(), 'Pp', { locale: fr })}
              </p>
            </div>
          </div>
          <div className="space-y-2">
            <Label className='text-gray-500' >Auteur</Label>
            <p className="text-sm font-semibold text-gray-600">John Doe</p>
          </div>
        </div>
      </CardContent>

      <div className="flex justify-end">
        <Button variant="default" onClick={() => setIsEditing(true)}>
          Modifier
        </Button>
      </div>
    </div>
  );
}
