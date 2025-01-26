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
import { Dumbbell, ListTree, MoreHorizontal } from 'lucide-react';

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
        <CardTitle className="text-sm font-medium">{workout.title}</CardTitle>
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
        {workout.description && (
          <p className="text-sm text-muted-foreground mb-4">
            {workout.description}
          </p>
        )}
        <div className="space-y-2">
          {workout.elements.map((element, index) => (
            <div key={element.id} className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">{index + 1}.</span>
              {element.type === WORKOUT_ELEMENT_TYPES.EXERCISE ? (
                <div className="flex items-center gap-2">
                  <Dumbbell className="h-4 w-4" />
                  <span>{element.exercise.name}</span>
                </div>
              ) : (
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <ListTree className="h-4 w-4" />
                    <span className="font-medium">{element.complex.name}</span>
                  </div>
                  <div className="text-xs text-muted-foreground pl-6 space-y-1">
                    {element.complex.exercises.map((ex, i) => (
                      <div key={ex.id} className="flex items-center gap-1">
                        <span>{i + 1}.</span>
                        <span>{ex.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between">
          <Badge variant="outline">{workout.workoutCategory}</Badge>
          <span className="text-xs text-muted-foreground">
            {workout.elements?.length || 0} éléments
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
