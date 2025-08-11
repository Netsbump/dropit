import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { WORKOUT_ELEMENT_TYPES, WorkoutDto } from '@dropit/schemas';

interface WorkoutCardProps {
  workout: WorkoutDto;
  onWorkoutClick: (id: string) => void;
}

export function WorkoutCard({ workout, onWorkoutClick }: WorkoutCardProps) {
  return (
    <Card
      key={workout.id}
      className="cursor-pointer shadow-none hover:shadow-md transition-shadow rounded-md"
      onClick={() => onWorkoutClick(workout.id)}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <CardTitle className="text-md font-bold">{workout.title}</CardTitle>
          <Badge variant="outline" className="h-6 font-normal">
            {workout.workoutCategory}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {workout.elements.map((element) => (
            <div
              key={element.id}
              className="flex items-start gap-2 text-sm bg-muted/30 rounded-lg p-3"
            >
              {element.type === WORKOUT_ELEMENT_TYPES.EXERCISE ? (
                <div className="flex flex-col gap-1 w-full">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{element.exercise.name}</span>
                    <Badge
                      variant="secondary"
                      className="h-6 min-w-[24px] flex items-center justify-center"
                    >
                      {element.type}
                    </Badge> 

                    <div className="text-xs text-muted-foreground">{element.exercise.exerciseCategory?.name}</div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-2 w-full">
                  <div className="flex items-center justify-between">
                    {element.complex.exercises?.map(ex => ex.name).join(' - ') || 'Aucun exercice'}
                    <Badge
                      variant="secondary"
                      className="h-6 min-w-[24px] flex items-center justify-center"
                    >
                      {element.type}
                    </Badge>
                    <div className="text-xs text-muted-foreground">{element.complex.complexCategory?.name}</div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full">
          Voir les détails
        </Button>
        <Button variant="outline" className="w-full">
          Planifier
        </Button>
      </CardFooter>
    </Card>
  );
}
