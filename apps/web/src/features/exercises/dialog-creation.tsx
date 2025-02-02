import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { ReactNode } from 'react';

interface DialogCreationProps {
  title: string;
  description?: string;
  children: ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export function DialogCreation({
  title,
  description,
  children,
  open,
  onOpenChange,
  maxWidth = 'sm',
}: DialogCreationProps) {
  const maxWidthClasses = {
    sm: 'sm:max-w-[500px]',
    md: 'sm:max-w-[600px]',
    lg: 'sm:max-w-[800px]',
    xl: 'sm:max-w-[1000px]',
    '2xl': 'sm:max-w-[1200px]',
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={maxWidthClasses[maxWidth]}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}
