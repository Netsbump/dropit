import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { WORKOUT_ELEMENT_TYPES, WorkoutDto } from '@dropit/schemas';
import { MoreHorizontal } from 'lucide-react';

interface WorkoutCardProps {
  workout: WorkoutDto;
  onWorkoutClick: (id: string) => void;
}

export function WorkoutCard({ workout, onWorkoutClick }: WorkoutCardProps) {
  return (
    <Card
      key={workout.id}
      className="cursor-pointer hover:shadow-lg transition-shadow"
      onClick={() => onWorkoutClick(workout.id)}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <CardTitle className="text-sm font-medium">{workout.title}</CardTitle>
          <Badge variant="outline" className="h-6">
            {workout.workoutCategory}
          </Badge>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem>Voir les détails</DropdownMenuItem>
            <DropdownMenuItem>Modifier</DropdownMenuItem>
            <DropdownMenuItem>Supprimer</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
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
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="secondary"
                      className="h-6 min-w-[24px] flex items-center justify-center"
                    >
                      {element.sets}
                    </Badge>
                    <span className="font-medium">{element.exercise.name}</span>
                  </div>
                  <p className="text-xs text-muted-foreground ml-9">
                    {element.sets} séries à {element.startWeight_percent}%
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-2 w-full">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="secondary"
                      className="h-6 min-w-[24px] flex items-center justify-center"
                    >
                      {element.sets}
                    </Badge>
                    <span className="font-medium">{element.complex.complexCategory?.name || 'Complex'}</span>
                  </div>
                  <p className="text-xs text-muted-foreground ml-9">
                    {element.sets} séries à {element.startWeight_percent}%
                  </p>
                  <div className="ml-9 space-y-2">
                    {element.complex.exercises.map((ex) => (
                      <div
                        key={ex.id}
                        className="flex items-center gap-2 bg-muted/50 rounded-md p-2"
                      >
                        <Badge
                          variant="outline"
                          className="h-5 min-w-[20px] flex items-center justify-center bg-background"
                        >
                          {ex.reps}
                        </Badge>
                        <div className="text-xs">{ex.name}</div>
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
  );
}
