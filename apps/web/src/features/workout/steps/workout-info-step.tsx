import { api } from '@/lib/api';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import {
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
import { Textarea } from '@/shared/components/ui/textarea';
import { createWorkoutSchema, WorkoutDto } from '@dropit/schemas';
import { useQuery } from '@tanstack/react-query';
import { UseFormReturn } from 'react-hook-form';
import { Copy, Search } from 'lucide-react';
import { Switch } from '@/shared/components/ui/switch';
import { z } from 'zod';
import { useState } from 'react';

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

interface WorkoutInfoStepProps {
  form: UseFormReturn<ExtendedWorkoutSchema>;
  onNext: () => void;
  onCancel: () => void;
}

export function WorkoutInfoStep({
  form,
  onNext,
  onCancel,
}: WorkoutInfoStepProps) {
  const [templateSearch, setTemplateSearch] = useState('');
  const [useTemplate, setUseTemplate] = useState(false);
  
  const { data: categories } = useQuery({
    queryKey: ['workoutCategories'],
    queryFn: async () => {
      const response = await api.workoutCategory.getWorkoutCategories();
      if (response.status !== 200) throw new Error('Failed to load categories');
      return response.body;
    },
  });

  const { data: workouts } = useQuery({
    queryKey: ['workouts'],
    queryFn: async () => {
      const response = await api.workout.getWorkouts();
      if (response.status !== 200) throw new Error('Failed to load workouts');
      return response.body;
    },
  });

  const handleUseTemplate = (templateWorkout: WorkoutDto) => {
    form.setValue('title', `${templateWorkout.title} (copie)`);
    form.setValue('description', templateWorkout.description || '');
    
    // Trouver la catégorie correspondante par son nom pour obtenir l'ID
    const category = categories?.find(cat => cat.name === templateWorkout.workoutCategory);
    if (category) {
      form.setValue('workoutCategory', category.id);
    }
    
    if (templateWorkout.elements) {
      form.setValue('elements', templateWorkout.elements);
    }
  };

  const filteredWorkouts = workouts?.filter(workout =>
    workout.title.toLowerCase().includes(templateSearch.toLowerCase())
  ) || [];

  return (
    <div className="h-full flex flex-col">
      {/* Layout principal : 2 colonnes */}
      <div className="flex-1 grid grid-cols-3 gap-6 min-h-0">
        
        {/* Colonne gauche : Formulaire d'informations */}
        <div className="col-span-2 flex flex-col min-h-0">
          <div className="mb-4">
            <h4 className="text-md font-medium">Informations générales</h4>
            <p className="text-sm text-muted-foreground">
              Renseignez les détails de votre entraînement
            </p>
          </div>

          <Card className="flex-1 shadow-none">
            <CardContent className="p-6 space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom</FormLabel>
                    <FormControl>
                      <Input placeholder="Nom de l'entraînement" {...field} />
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
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        </div>

        {/* Colonne droite : Templates disponibles */}
        <div className="col-span-1 flex flex-col min-h-0">
          <div className="mb-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-md font-medium">Utiliser un template</h4>
                <p className="text-sm text-muted-foreground">
                  Partir d'un entraînement existant
                </p>
              </div>
              <Switch 
                checked={useTemplate}
                onCheckedChange={setUseTemplate}
              />
            </div>
          </div>

          <Card className={`flex-1 flex flex-col min-h-0 shadow-none ${!useTemplate ? 'opacity-50 pointer-events-none' : ''}`}>
            <CardContent className="p-4 flex-1 flex flex-col min-h-0">
              <div className="relative mb-3 flex-shrink-0 bg-sidebar">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un entraînement..."
                  value={templateSearch}
                  onChange={(e) => setTemplateSearch(e.target.value)}
                  className="pl-10"
                  disabled={!useTemplate}
                />
              </div>
              
              <div className="flex-1 overflow-y-auto space-y-2 min-h-0">
                {!useTemplate ? (
                  <div className="flex items-center justify-center h-32 text-center text-muted-foreground">
                    <p className="text-sm">Activez le switch pour utiliser un template</p>
                  </div>
                ) : filteredWorkouts.length === 0 ? (
                  <div className="flex items-center justify-center h-32 text-center text-muted-foreground">
                    <p className="text-sm">Aucun entraînement trouvé</p>
                  </div>
                ) : (
                  filteredWorkouts.map((workout) => (
                    <div 
                      key={workout.id} 
                      className="border rounded-lg p-3 cursor-pointer hover:bg-muted/50 transition-colors bg-background"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <h5 className="font-medium text-sm truncate">{workout.title}</h5>
                          <p className="text-xs text-muted-foreground truncate">
                            {typeof workout.workoutCategory === 'string' ? workout.workoutCategory : '-'}
                          </p>
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => handleUseTemplate(workout)}
                          className="flex-shrink-0 ml-2"
                          disabled={!useTemplate}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Boutons de navigation */}
      <div className="flex justify-between mt-6 flex-shrink-0">
        <Button variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button onClick={onNext}>Suivant</Button>
      </div>
    </div>
  );
}
