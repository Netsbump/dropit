import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Steps } from '@/shared/components/ui/steps';
import { useTranslation } from '@dropit/i18n';
import { CreateWorkout } from '@dropit/schemas';
import { format } from 'date-fns';
import { enGB, fr } from 'date-fns/locale';
import { useState } from 'react';
import { WorkoutCreationStepper, workoutCreationSteps } from '../workout/workout-creation-stepper';

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
  const { t, i18n } = useTranslation('planning');
  const locale = i18n.language === 'fr' ? fr : enGB;
  const [currentStep, setCurrentStep] = useState(0);

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
            {selectedDate && `- ${format(selectedDate, 'PPP', { locale })}`}
          </DialogTitle>
        </DialogHeader>
        <div className="mb-4">
          <Steps
            steps={workoutCreationSteps}
            currentStep={currentStep}
            onStepClick={setCurrentStep}
          />
        </div>
        <div className="py-4">
          <WorkoutCreationStepper
            currentStep={currentStep}
            setCurrentStep={setCurrentStep}
            onSuccess={handleSubmitSuccess}
            onCancel={onClose}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
