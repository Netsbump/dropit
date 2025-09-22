import { cn } from '@/lib/utils';
import { Button } from '@/shared/components/ui/button';
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
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-10 lg:hidden"
          onClick={onClose}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onClose?.();
            }
          }}
          role="button"
          tabIndex={0}
          aria-label="Fermer le panneau"
        />
      )}
      
      {/* Panel */}
      <div
        className={cn(
          // Desktop: side panel
          'fixed inset-y-0 right-0 z-20 flex bg-sidebar border-l transform transition-transform duration-200 ease-in-out',
          'lg:w-[430px]',
          !open && 'translate-x-full',
          // Mobile: full width drawer from bottom
          'lg:translate-y-0 w-full lg:inset-y-0 lg:right-0',
          'max-lg:inset-x-0 max-lg:bottom-0 max-lg:top-16 max-lg:rounded-t-xl max-lg:border-t max-lg:border-l-0',
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
    </>
  );
}
