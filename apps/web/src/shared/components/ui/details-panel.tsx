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
  if (!open) return null;

  return (
    <>
      {/* Mobile overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
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

      <div
        className={cn(
          // Desktop: panel intégré dans le layout
          'hidden lg:flex lg:w-[430px] lg:flex-shrink-0 lg:rounded-3xl lg:flex-col lg:h-full',
          // Mobile: drawer fixe en bas
          'lg:static fixed inset-x-0 bottom-0 top-16 z-50 rounded-t-xl border-t lg:border-t-0',
          'flex flex-col',
          className
        )}
      >
        <div className="flex flex-col w-full h-full px-8 my-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">{title}</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex-1 overflow-auto">{children}</div>
        </div>
      </div>
    </>
  );
}
