import { WorkoutEditor } from '@/features/workout/workout-editor';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { WORKOUT_ELEMENT_TYPES } from '@dropit/schemas';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { ArrowLeft, Pencil, Plus, X } from 'lucide-react';
import { useState } from 'react';

export const Route = createFileRoute('/programs/workouts/$workoutId')({
  component: WorkoutDetailPage,
  loader: ({ params }) => {
    return {
      workoutId: params.workoutId,
    };
  },
});

function WorkoutDetailPage() {
  const { workoutId } = Route.useParams();
  const navigate = Route.useNavigate();
  const [isEditing, setIsEditing] = useState(false);

  const { data: workout, isLoading } = useQuery({
    queryKey: ['workout', workoutId],
    queryFn: async () => {
      const response = await api.workout.getWorkout({
        params: { id: workoutId },
      });
      if (response.status !== 200)
        throw new Error('Failed to load workout details');
      return response.body;
    },
  });

  const handleSave = async () => {
    // TODO: Implémenter la sauvegarde
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  if (!workout) {
    return <div>Workout not found</div>;
  }

  if (isEditing) {
    return (
      <WorkoutEditor workout={workout} onCancel={() => setIsEditing(false)} />
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Navigation Bar */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center h-14 gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate({ to: '/programs/workouts' })}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-semibold">{workout.title}</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsEditing(true)}>
              <Pencil className="h-4 w-4 mr-2" />
              Éditer
            </Button>
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
                {isEditing && (
                  <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter un élément
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                <div
                  className="grid grid-cols-2 gap-2"
                  style={{ gridAutoFlow: 'dense' }}
                >
                  {workout.elements.map((element, index) => (
                    <div
                      key={element.id}
                      className={cn(
                        'bg-muted/30 rounded-lg p-4 space-y-2',
                        isEditing && 'relative group'
                      )}
                      style={{
                        gridColumnStart: index % 2 === 0 ? 1 : 2,
                        gridRow: `span ${
                          element.type === WORKOUT_ELEMENT_TYPES.COMPLEX ? 2 : 1
                        }`,
                      }}
                    >
                      {isEditing && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute -right-2 -top-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
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
            {/* Quick Stats */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Statistiques</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Dernière utilisation
                  </div>
                  <div className="text-lg font-semibold">-</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Nombre d'athlètes
                  </div>
                  <div className="text-lg font-semibold">0</div>
                </div>
              </CardContent>
            </Card>

            {/* Recent History */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Historique</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  Aucune séance programmée
                </div>
              </CardContent>
            </Card>

            {/* Athletes */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Athlètes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  Aucun athlète n'a encore réalisé ce workout
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Barre d'édition */}
      {isEditing && (
        <div className="fixed bottom-0 inset-x-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex items-center justify-between">
            <div className="text-sm text-muted-foreground">Mode édition</div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Annuler
              </Button>
              <Button onClick={handleSave}>
                Sauvegarder les modifications
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
