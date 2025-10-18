import { cn } from '@/lib/utils';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { WORKOUT_ELEMENT_TYPES, WorkoutDto } from '@dropit/schemas';
import { ArrowLeft, Pencil } from 'lucide-react';

interface WorkoutDetailProps {
  workout: WorkoutDto;
  onEdit: () => void;
}

export function WorkoutDetail({
  workout,
  onEdit,
}: WorkoutDetailProps) {
  return (
    <div className="space-y-6">
      {/* Actions */}
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onEdit}>
          <Pencil className="h-4 w-4 mr-2" />
          Éditer
        </Button>
        <Button className="text-white border-0" style={{ backgroundColor: '#ed960b' }}>Programmer</Button>
      </div>

      {/* Main Content */}
      <div>
        <div className="grid grid-cols-6 divide-x">
          {/* Left Column - Info */}
          <div className="col-span-1 py-6 pr-6 space-y-4">
            <h2 className="text-lg font-semibold">Informations</h2>

            {/* Catégorie */}
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-md font-medium text-muted-foreground mb-2">
                  Catégorie
                </h3>
                <Badge variant="outline">{workout.workoutCategory}</Badge>
              </CardContent>
            </Card>

            {/* Description */}
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-md font-medium text-muted-foreground mb-2">
                  Description
                </h3>
                <p className="text-sm">
                  {workout.description || 'Aucune description'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Middle Column - Elements */}
          <div className="col-span-4 p-6 space-y-4">
            <h2 className="text-lg font-semibold">Éléments</h2>
            <Card>
              <CardContent className="pt-6">
                <div
                  className="grid grid-cols-2 gap-4"
                  style={{ gridAutoFlow: 'dense' }}
                >
                  {workout.elements.map((element, index) => (
                    <div
                      key={element.id}
                      className={cn('bg-muted/30 rounded-lg p-4 space-y-2')}
                      style={{
                        gridColumnStart: index % 2 === 0 ? 1 : 2,
                        gridRow: `span ${
                          element.type === WORKOUT_ELEMENT_TYPES.COMPLEX ? 2 : 1
                        }`,
                      }}
                    >
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
                              {element.complex.complexCategory?.name || 'Complex'}
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
          <div className="col-span-1 py-6 pl-6 space-y-6">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Statistiques</h2>
              <Card className="flex-1">
                <CardContent className="space-y-4 pt-6">
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
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Historique</h2>
              <Card className="flex-1">
                <CardContent className="pt-6">
                  <div className="text-sm text-muted-foreground">
                    Aucune séance programmée
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Athlètes</h2>
              <Card className="flex-1">
                <CardContent className="pt-6">
                  <div className="text-sm text-muted-foreground">
                    Aucun athlète n'a encore réalisé ce workout
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
