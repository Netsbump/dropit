import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { WORKOUT_ELEMENT_TYPES, WorkoutDto, TrainingSessionDto } from '@dropit/schemas';
import { getCategoryBadgeVariant } from '@/shared/utils';
import { Separator } from '@/shared/components/ui/separator';

interface WorkoutCardProps {
  workout: WorkoutDto;
  trainingSessions: TrainingSessionDto[];
  onWorkoutClick: (id: string) => void;
}

export function WorkoutCard({ workout, trainingSessions, onWorkoutClick }: WorkoutCardProps) {
  return (
    <Card
      className="cursor-pointer shadow-none hover:shadow-md transition-shadow rounded-md flex flex-col" 
      onClick={() => onWorkoutClick(workout.id)}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
        <CardTitle className="text-sm font-bold">{workout.title}</CardTitle>
        <Badge 
            variant="outline"
            className={`text-xs font-medium ${getCategoryBadgeVariant(workout.workoutCategory || '')}`}
          >
            {workout.workoutCategory || 'Sans catégorie'}
          </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        {workout.elements.map((element) => {
          const isExercise = element.type === WORKOUT_ELEMENT_TYPES.EXERCISE;
          const categoryName = isExercise
            ? element.exercise.exerciseCategory?.name
            : element.complex.complexCategory?.name;

          return (
            <div key={element.id} className="space-y-1">
              <div className="flex items-baseline gap-2">
                <span className="text-xs text-foreground">
                  {element.type.toUpperCase()}
                </span>
                {categoryName && (
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">•</span>
                    <span className="text-xs text-foreground">
                      {categoryName}
                    </span>
                  </div>
                )}
              </div>
              {/* Contenu */}
              {isExercise ? (
                <Badge variant="secondary" className="text-xs font-normal">
                  {element.exercise.name}
                </Badge>
              ) : (
                <div className="flex flex-wrap gap-1">
                  {element.complex.exercises?.map((ex) => (
                    <Badge key={ex.name} variant="secondary" className="text-xs font-normal">
                      {ex.name}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
      <CardFooter className="gap-2 flex flex-col justify-end h-full">
        <div className="flex items-center justify-end w-full">
          <span className="text-xs text-muted-foreground">
            {trainingSessions.length > 0 
              ? `${trainingSessions.length} session${trainingSessions.length > 1 ? 's' : ''} planifiée${trainingSessions.length > 1 ? 's' : ''}`
              : 'Non planifié'
            }
          </span>
        </div>
        <Separator className="my-2" />
        <div className='flex gap-2 w-full'>
          <Button variant="outline" size="sm" className="flex-1">
            Voir les détails
          </Button>
          <Button variant="default" size="sm" className="flex-1">
            Planifier
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
