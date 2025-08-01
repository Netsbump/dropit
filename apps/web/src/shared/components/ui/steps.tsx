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
    <nav aria-label="Progress" className="w-full py-6">
      <div className="flex items-center justify-center">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            {/* Cercle numéroté */}
            <div className="flex flex-col items-center">
              <button
                type="button"
                onClick={() => onStepClick?.(index)}
                disabled={!onStepClick}
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold transition-all duration-200',
                  {
                    'bg-primary text-primary-foreground': currentStep >= index,
                    'bg-muted text-muted-foreground border border-border': currentStep < index,
                    'cursor-pointer hover:bg-primary/90': onStepClick && currentStep < index,
                    'cursor-default': !onStepClick,
                  }
                )}
              >
                {currentStep > index ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </button>
              
              <div className="mt-2 text-center">
                <div className={cn(
                  'text-sm font-medium',
                  {
                    'text-primary': currentStep === index,
                    'text-foreground': currentStep > index,
                    'text-muted-foreground': currentStep < index,
                  }
                )}>
                  {step.name}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {step.description}
                </div>
              </div>
            </div>
            
            {/* Trait de liaison */}
            {index < steps.length - 1 && (
              <div className={cn(
                'w-16 h-0.5 mx-4 transition-colors duration-200',
                {
                  'bg-primary': currentStep > index,
                  'bg-border': currentStep <= index,
                }
              )} />
            )}
          </div>
        ))}
      </div>
    </nav>
  );
}
