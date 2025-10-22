import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface Step {
  id: string;
  name: string;
  description?: string;
}

interface StepsProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (step: number) => void;
}

export function Steps({ steps, currentStep, onStepClick }: StepsProps) {
  return (
    <div className="bg-sidebar rounded-lg border shadow-sm">
      <nav aria-label="Progress" className="w-full p-6">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <>
              <div key={step.id} className="flex items-center">
                <button
                  type="button"
                  onClick={() => onStepClick?.(index)}
                  disabled={!onStepClick}
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-all duration-200 shrink-0',
                    {
                      'bg-primary text-primary-foreground': currentStep >= index,
                      'bg-gray-100 text-gray-600 border': currentStep < index,
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
                
                <div className="ml-3">
                  <div className={cn(
                    'text-sm font-medium whitespace-nowrap',
                    {
                      'text-gray-900': currentStep >= index,
                      'text-gray-500': currentStep < index,
                    }
                  )}>
                    {step.name}
                  </div>
                </div>
              </div>
              
              {/* Trait de liaison */}
              {index < steps.length - 1 && (
                <div key={`line-${step.id}-${steps[index + 1].id}`} className="flex-1 mx-4">
                  <div className={cn(
                    'h-0.5 w-full transition-colors duration-200',
                    {
                      'bg-primary': currentStep > index,
                      'bg-gray-300': currentStep <= index,
                    }
                  )} />
                </div>
              )}
            </>
          ))}
        </div>
      </nav>
    </div>
  );
}
