import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { useTranslation } from '@dropit/i18n';
import { CreateWorkout } from '@dropit/schemas';
import { format } from 'date-fns';
import { WorkoutCreationStepper } from '../workout/workout-creation-stepper';

interface CreateWorkoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate?: Date;
}

export function CreateWorkoutModal({
  isOpen,
  onClose,
  selectedDate,
}: CreateWorkoutModalProps) {
  const { t } = useTranslation('planning');

  const handleSubmitSuccess = (data: CreateWorkout) => {
    // Ici vous pourriez traiter les données du workout si nécessaire
    console.log(data);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>
            {t('createWorkout')}{' '}
            {selectedDate && `- ${format(selectedDate, 'PPP')}`}
          </DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <WorkoutCreationStepper
            onSuccess={handleSubmitSuccess}
            onCancel={onClose}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
