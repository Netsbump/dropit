import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from '@/shared/components/ui/popover';
import { useEffect, useState } from 'react';
import { SessionDetail } from './session-detail';

interface SessionDetailPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId?: string;
  anchorElement?: HTMLElement | null;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onViewDetail?: (id: string) => void;
  onAthleteClick?: (athleteId: string) => void;
}

export function SessionDetailPopover({
  isOpen,
  onClose,
  sessionId,
  anchorElement,
  onEdit,
  onDelete,
  onViewDetail,
  onAthleteClick,
}: SessionDetailPopoverProps) {
  const [open, setOpen] = useState(isOpen);

  // Synchroniser l'état ouvert/fermé avec la prop isOpen
  useEffect(() => {
    setOpen(isOpen);
  }, [isOpen]);

  // Gérer la fermeture du popover
  const handleOpenChange = (open: boolean) => {
    setOpen(open);
    if (!open) {
      onClose();
    }
  };

  if (!sessionId) return null;

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      {anchorElement && (
        <PopoverAnchor asChild virtualRef={{ current: anchorElement }} />
      )}
      <PopoverContent
        className="w-[400px] p-0 shadow-lg border-gray-200 max-h-[80vh]"
        align="start"
        side="right"
        sideOffset={5}
      >
        <div className="bg-white rounded-md overflow-hidden">
          <SessionDetail
            id={sessionId}
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
