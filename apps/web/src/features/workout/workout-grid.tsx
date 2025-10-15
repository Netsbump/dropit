import { WorkoutDto, TrainingSessionDto } from '@dropit/schemas';
import { WorkoutCard } from './workout-card';

interface WorkoutGridProps {
  workouts: WorkoutDto[];
  trainingSessions: TrainingSessionDto[];
  onWorkoutClick: (id: string) => void;
}

export function WorkoutGrid({ workouts, trainingSessions, onWorkoutClick }: WorkoutGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-6xl">
      {workouts.map((workout) => {
        const workoutSessions = trainingSessions.filter(
          session => session.workout.id === workout.id
        );

        return (
          <WorkoutCard
            key={workout.id}
            workout={workout}
            trainingSessions={workoutSessions}
            onWorkoutClick={() => onWorkoutClick(workout.id)}
          />
        );
      })}
    </div>
  );
}
