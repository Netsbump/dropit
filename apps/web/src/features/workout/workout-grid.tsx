import { WorkoutDto } from '@dropit/schemas';
import { WorkoutCard } from './workout-card';

interface WorkoutGridProps {
  workouts: WorkoutDto[];
  onWorkoutClick: (id: string) => void;
}

export function WorkoutGrid({ workouts, onWorkoutClick }: WorkoutGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {workouts.map((workout) => (
        <WorkoutCard
          key={workout.id}
          workout={workout}
          onWorkoutClick={() => onWorkoutClick(workout.id)}
        />
      ))}
    </div>
  );
}
