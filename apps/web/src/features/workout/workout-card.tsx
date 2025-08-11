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
      className="cursor-pointer shadow-none hover:shadow-md transition-shadow rounded-md"
      onClick={() => onWorkoutClick(workout.id)}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
        <CardTitle className="text-sm font-bold">{workout.title}</CardTitle>
        <Badge 
            className={`text-xs border-0 ${getCategoryBadgeVariant(workout.workoutCategory || '')}`}
          >
            {workout.workoutCategory || 'Sans catégorie'}
          </Badge>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {workout.elements.map((element) => (
            <div
              key={element.id}
              className="flex items-center justify-between text-sm"
            >
              {element.type === WORKOUT_ELEMENT_TYPES.EXERCISE ? (
                <div className="flex flex-col justify-between text-sm">
                  <div className="flex items-center gap-2 pb-2">
                    <span className="text-xs text-muted-foreground">
                      {element.type}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {element.exercise.exerciseCategory?.name}
                    </span>
                  </div>
                  <Badge variant="secondary" className="text-xs font-normal">{element.exercise.name}</Badge>
                </div>
              ) : (
                <div className="flex flex-col justify-between text-sm">
                  <div className="flex items-center gap-2 pb-2">
                    <span className="text-xs text-muted-foreground">
                    {element.type}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {element.complex.complexCategory?.name}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                  {element.complex.exercises?.map(ex => (
                    <Badge variant="secondary" className="text-xs font-normal">
                      {ex.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-end">
          <span className="text-xs text-muted-foreground">
            {trainingSessions.length > 0 
              ? `${trainingSessions.length} session${trainingSessions.length > 1 ? 's' : ''} planifiée${trainingSessions.length > 1 ? 's' : ''}`
              : 'Non planifié'
            }
          </span>
        </div>
      </CardContent>

      <CardFooter className="gap-2 flex flex-col">
        <Separator className="my-2" />
        <div className='flex gap-2 w-full'>
          <Button variant="outline" size="sm" className="flex-1">
            Voir les détails
          </Button>
          <Button variant="outline" size="sm" className="flex-1">
            Planifier
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
