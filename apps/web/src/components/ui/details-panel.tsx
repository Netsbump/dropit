import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

interface DetailsPanelProps {
  open?: boolean;
  onClose?: () => void;
  title: string;
  children?: React.ReactNode;
  className?: string;
}

export function DetailsPanel({
  open,
  onClose,
  title,
  children,
  className,
}: DetailsPanelProps) {
  return (
    <div
      className={cn(
        'fixed inset-y-0 right-0 z-20 flex bg-card border-l w-[430px] transform transition-transform duration-200 ease-in-out',
        !open && 'translate-x-full',
        className
      )}
    >
      <div className="flex flex-col w-full h-full px-8 py-2">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{title}</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-auto pt-4">{children}</div>
      </div>
    </div>
  );
}
