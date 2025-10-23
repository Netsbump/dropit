import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import * as React from 'react';

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
    <nav aria-label="Progress" className="w-full">
      <div className="flex items-center">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <div className="flex items-center">
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
                    'text-[hsl(var(--appheader-foreground))]': currentStep >= index,
                    'text-[hsl(var(--appheader-foreground))]/50': currentStep < index,
                  }
                )}>
                  {step.name}
                </div>
              </div>
            </div>

            {/* Trait de liaison */}
            {index < steps.length - 1 && (
              <div className="mx-3">
                <div className={cn(
                  'h-0.5 w-8 transition-colors duration-200',
                  {
                    'bg-primary': currentStep > index,
                    'bg-gray-300': currentStep <= index,
                  }
                )} />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </nav>
  );
}
