import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ReactNode } from 'react';

interface CreationDialogProps {
  title: string;
  description?: string;
  children: ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  cancelLabel?: string;
  submitLabel?: string;
  onCancel?: () => void;
  onSubmit?: () => void;
  submitFormId?: string;
  submitDisabled?: boolean;
  isSubmitting?: boolean;
}

const MAX_WIDTH_CLASSES = {
  sm: 'sm:max-w-[500px]',
  md: 'sm:max-w-[600px]',
  lg: 'sm:max-w-[800px]',
  xl: 'sm:max-w-[1000px]',
  '2xl': 'sm:max-w-[1200px]',
};

export function CreationDialog({
  title,
  description,
  children,
  open,
  onOpenChange,
  maxWidth = 'sm',
  cancelLabel,
  submitLabel,
  onCancel,
  onSubmit,
  submitFormId,
  submitDisabled,
  isSubmitting,
}: CreationDialogProps) {
  const showFooter = Boolean(cancelLabel || submitLabel);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={MAX_WIDTH_CLASSES[maxWidth]}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? (
            <DialogDescription>{description}</DialogDescription>
          ) : null}
        </DialogHeader>
        {children}
        {showFooter ? (
          <DialogFooter>
            {cancelLabel ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  onCancel?.();
                  onOpenChange(false);
                }}
              >
                {cancelLabel}
              </Button>
            ) : null}
            {submitLabel ? (
              <Button
                type={submitFormId ? 'submit' : 'button'}
                form={submitFormId}
                disabled={submitDisabled || isSubmitting}
                onClick={submitFormId ? undefined : onSubmit}
              >
                {submitLabel}
              </Button>
            ) : null}
          </DialogFooter>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
