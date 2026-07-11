import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from '@/components/ui/popover';
import { TrainingSessionDetail } from './training-session-detail';

interface TrainingSessionDetailPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  trainingSessionId?: string;
  anchorElement?: HTMLElement | null;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onViewDetail?: (id: string) => void;
  onAthleteClick?: (athleteId: string) => void;
}

export function TrainingSessionDetailPopover({
  isOpen,
  onClose,
  trainingSessionId,
  anchorElement,
  onEdit,
  onDelete,
  onViewDetail,
  onAthleteClick,
}: TrainingSessionDetailPopoverProps) {
  // Gérer la fermeture du popover
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  if (!trainingSessionId) return null;

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      {anchorElement && (
        <PopoverAnchor asChild virtualRef={{ current: anchorElement }} />
      )}
      <PopoverContent
        className="w-[400px] p-0 shadow-lg border max-h-[80vh]"
        align="start"
        side="right"
        sideOffset={5}
      >
        <div className="bg-white rounded-md overflow-hidden">
          <TrainingSessionDetail
            id={trainingSessionId}
            onClose={onClose}
            onEdit={onEdit}
            onDelete={onDelete}
            onViewDetail={onViewDetail}
            onAthleteClick={onAthleteClick}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
