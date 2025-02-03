import { api } from '@/lib/api';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { WORKOUT_ELEMENT_TYPES, WorkoutDto } from '@dropit/schemas';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Plus, X } from 'lucide-react';
import { useState } from 'react';

interface WorkoutEditorProps {
  workout: WorkoutDto;
  onCancel: () => void;
}

export function WorkoutEditor({
  workout: initialWorkout,
  onCancel,
}: WorkoutEditorProps) {
  const [workout, setWorkout] = useState(initialWorkout);
  const queryClient = useQueryClient();

  const { mutate: updateWorkout, isPending } = useMutation({
    mutationFn: async () => {
      const response = await api.workout.updateWorkout({
        params: { id: workout.id },
        body: workout,
      });
      if (response.status !== 200) throw new Error('Failed to update workout');
      return response.body;
    },
    onSuccess: (updatedWorkout) => {
      queryClient.setQueryData(['workout', workout.id], updatedWorkout);
      onCancel();
    },
  });

  const handleElementDelete = (elementId: string) => {
    setWorkout({
      ...workout,
      elements: workout.elements.filter((el) => el.id !== elementId),
    });
  };

  const handleAddElement = () => {
    // TODO: Ouvrir un dialog pour choisir entre exercice et complex
  };

  return (
    <div className="h-full flex flex-col">
      {/* Navigation Bar */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center h-14 gap-4">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-semibold">{workout.title}</h1>
          </div>
          <div className="flex gap-2">
            <Button>Programmer</Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="h-full grid grid-cols-6 divide-x">
          {/* Left Column - Info */}
          <div className="col-span-1 py-6 pr-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Informations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">
                    Catégorie
                  </div>
                  <Badge variant="outline">{workout.workoutCategory}</Badge>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">
                    Description
                  </div>
                  <p className="text-sm">
                    {workout.description || 'Aucune description'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Middle Column - Elements */}
          <div className="col-span-4 p-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Éléments</CardTitle>
                <Button variant="outline" size="sm" onClick={handleAddElement}>
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter un élément
                </Button>
              </CardHeader>
              <CardContent>
                <div
                  className="grid grid-cols-2 gap-2"
                  style={{ gridAutoFlow: 'dense' }}
                >
                  {workout.elements.map((element, index) => (
                    <div
                      key={element.id}
                      className="bg-muted/30 rounded-lg p-4 space-y-2 relative group"
                      style={{
                        gridColumnStart: index % 2 === 0 ? 1 : 2,
                        gridRow: `span ${
                          element.type === WORKOUT_ELEMENT_TYPES.COMPLEX ? 2 : 1
                        }`,
                      }}
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute -right-2 -top-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleElementDelete(element.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                      {element.type === WORKOUT_ELEMENT_TYPES.EXERCISE ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">
                              {element.sets} séries
                            </Badge>
                            <span className="font-medium">
                              {element.exercise.name}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Poids initial: {element.startWeight_percent}%
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">
                              {element.sets} séries
                            </Badge>
                            <span className="font-medium">
                              {element.complex.name}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Poids initial: {element.startWeight_percent}%
                          </p>
                          <div className="space-y-2 ml-6">
                            {element.complex.exercises.map((ex) => (
                              <div
                                key={ex.id}
                                className="flex items-center gap-2 bg-muted/50 rounded-md p-2"
                              >
                                <Badge
                                  variant="outline"
                                  className="bg-background"
                                >
                                  {ex.reps} reps
                                </Badge>
                                <span className="text-sm">{ex.name}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Stats & Info */}
          <div className="col-span-1 py-6 pl-6">
            {/* ... Même contenu que la version lecture ... */}
          </div>
        </div>
      </div>

      {/* Barre d'édition */}
      <div className="sticky bottom-0 border-t bg-accent/50 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-accent/30">
        <div className="flex items-center justify-between py-2 px-8">
          <div className="text-sm font-medium text-accent-foreground">
            Mode édition
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onCancel}>
              Annuler
            </Button>
            <Button onClick={() => updateWorkout()} disabled={isPending}>
              {isPending ? 'Sauvegarde...' : 'Sauvegarder les modifications'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
