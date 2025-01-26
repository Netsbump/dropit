import { WorkoutDto } from '@dropit/schemas';

interface WorkoutDetailProps {
  workout: WorkoutDto;
}

export function WorkoutDetail({ workout }: WorkoutDetailProps) {
  console.log('workout', workout);
  return <div>WorkoutDetail</div>;
}
