import { WorkoutDto } from '@dropit/schemas';

interface WorkoutCreationFormProps {
  onSuccess: (workout: WorkoutDto) => void;
  onCancel: () => void;
}

export function WorkoutCreationForm({
  onSuccess,
  onCancel,
}: WorkoutCreationFormProps) {
  console.log('onSuccess', onSuccess);
  console.log('onCancel', onCancel);

  return <div>WorkoutCreationForm</div>;
}
