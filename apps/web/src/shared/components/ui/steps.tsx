import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface Step {
  id: string;
  name: string;
  description: string;
}

interface StepsProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (step: number) => void;
}

export function Steps({ steps, currentStep, onStepClick }: StepsProps) {
  return (
    <nav aria-label="Progress">
      <ol className="space-y-4 md:flex md:space-y-0 md:space-x-8">
        {steps.map((step, index) => (
          <li key={step.id} className="md:flex-1">
            <button
              type="button"
              onClick={() => onStepClick?.(index)}
              className={cn(
                'group flex w-full flex-col border-l-4 py-2 pl-4 md:border-l-0 md:border-t-4 md:pl-0 md:pt-4 md:pb-0',
                {
                  'border-primary hover:border-primary/80':
                    currentStep === index,
                  'border-muted-foreground/20 hover:border-muted-foreground/40':
                    currentStep !== index,
                  'cursor-pointer': !!onStepClick,
                }
              )}
            >
              <span className="text-sm font-medium">
                <span className="flex items-center gap-2">
                  {currentStep > index ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <span
                      className={cn(
                        'flex h-5 w-5 items-center justify-center rounded-full text-xs',
                        {
                          'bg-primary text-primary-foreground':
                            currentStep === index,
                          'border border-muted-foreground/20 text-muted-foreground':
                            currentStep !== index,
                        }
                      )}
                    >
                      {index + 1}
                    </span>
                  )}
                  {step.name}
                </span>
              </span>
              <span
                className={cn('text-sm', {
                  'text-muted-foreground': currentStep !== index,
                })}
              >
                {step.description}
              </span>
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );
}
