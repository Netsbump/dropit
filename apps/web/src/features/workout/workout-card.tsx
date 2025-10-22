import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/shared/components/ui/card';
import { WORKOUT_ELEMENT_TYPES, WorkoutDto, TrainingSessionDto } from '@dropit/schemas';

interface WorkoutCardProps {
  workout: WorkoutDto;
  trainingSessions: TrainingSessionDto[];
  onWorkoutClick: (id: string) => void;
}

export function WorkoutCard({ workout, trainingSessions, onWorkoutClick }: WorkoutCardProps) {
  return (
    <Card
      className="rounded-2xl bg-white shadow-none"
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-base font-semibold text-gray-900 line-clamp-2 flex-1">
            {workout.title}
          </h3>
          {workout.workoutCategory && (
            <Badge
              variant="outline"
              className="text-xs font-medium shrink-0 bg-primary/10 text-primary border-primary/20"
            >
              {workout.workoutCategory}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="pb-4">
        <div className="grid grid-cols-2 gap-3">
          {workout.elements.map((element) => {
            const isExercise = element.type === WORKOUT_ELEMENT_TYPES.EXERCISE;

            return (
              <div
                key={element.id}
                className="p-3 rounded-lg border border-gray-200 bg-gray-50"
              >
                {/* Header avec type et sets/reps */}
                <div className="flex items-center justify-between mb-2">
                  <Badge
                    variant="secondary"
                    className={`text-[10px] font-semibold uppercase ${
                      isExercise
                        ? 'bg-tertiary text-tertiary-foreground hover:bg-tertiary'
                        : 'bg-secondary text-secondary-foreground hover:bg-secondary'
                    }`}
                  >
                    {isExercise ? 'exercise' : 'complex'}
                  </Badge>
                  <span className="text-xs font-semibold text-gray-700">
                    {element.sets}x{element.reps}  {('intensity' in element && element.intensity) ? `${element.intensity}%` : ''}
                  </span>
                </div>

                {/* Contenu */}
                {isExercise ? (
                  <div className="text-xs text-gray-600">
                    {element.exercise.name}
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {element.complex.exercises && element.complex.exercises.length > 0 && (
                      <div className="border-l-2 border-gray-300 pl-2 space-y-0.5">
                        {element.complex.exercises.map((ex, idx) => (
                          <div key={`${ex.name}-${idx}`} className="text-xs text-gray-600">
                            {ex.name}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>

      <CardFooter className="pt-3 border-t border-gray-100 flex-col gap-3">
        <div className="flex items-center justify-between w-full text-xs">
          <span className={`font-medium ${
            trainingSessions.length > 0 ? 'text-emerald-600' : 'text-gray-400'
          }`}>
            {trainingSessions.length > 0
              ? `${trainingSessions.length} session${trainingSessions.length > 1 ? 's' : ''} planifiée${trainingSessions.length > 1 ? 's' : ''}`
              : 'Non planifié'
            }
          </span>
        </div>

        <div className='flex gap-2 w-full'>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-xs"
            onClick={(e) => {
              e.stopPropagation();
              onWorkoutClick(workout.id);
            }}
          >
            Voir les détails
          </Button>
          <Button variant="default" size="sm" className="flex-1 text-xs">
            Planifier
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
