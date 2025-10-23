import { cn } from '@/lib/utils';
import { Badge } from '@/shared/components/ui/badge';
import { useTranslation } from '@dropit/i18n';
import { WORKOUT_ELEMENT_TYPES, TrainingSessionDto } from '@dropit/schemas';
import { User } from 'lucide-react';

interface TrainingSessionWeekViewProps {
  trainingSession: TrainingSessionDto;
}

export function TrainingSessionWeekView({ trainingSession }: TrainingSessionWeekViewProps) {
  const { t } = useTranslation('planning');

  return (
    <div className="p-2 text-xs space-y-2 h-full overflow-hidden">
      {/* Titre */}
      <div className="font-semibold text-sm line-clamp-1">
        {trainingSession.workout.title}
      </div>

      {/* Athlètes */}
      {trainingSession.athletes && trainingSession.athletes.length > 0 && (
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <User className="h-3 w-3" />
          <span className="line-clamp-1">
            {trainingSession.athletes.length} {t('athletes').toLowerCase()}
          </span>
        </div>
      )}

      {/* Éléments de l'entraînement - version compacte */}
      <div className="space-y-1">
        {trainingSession.workout.elements.slice(0, 3).map((element) => (
          <div
            key={element.id}
            className="flex items-center justify-between gap-1 py-0.5"
          >
            <span className="text-[10px] line-clamp-1 flex-1">
              {element.type === WORKOUT_ELEMENT_TYPES.EXERCISE
                ? element.exercise.name
                : element.complex.complexCategory?.name || 'Complex'}
            </span>
            <div className="flex items-center gap-1 shrink-0">
              <Badge
                variant="secondary"
                className={cn(
                  'text-[9px] px-1 py-0 h-4',
                  element.type === WORKOUT_ELEMENT_TYPES.EXERCISE
                    ? 'bg-tertiary text-tertiary-foreground'
                    : 'bg-secondary text-secondary-foreground'
                )}
              >
                {element.sets}x{element.reps}
              </Badge>
            </div>
          </div>
        ))}
        {trainingSession.workout.elements.length > 3 && (
          <div className="text-[10px] text-muted-foreground text-center pt-1">
            +{trainingSession.workout.elements.length - 3} {t('others')}
          </div>
        )}
      </div>
    </div>
  );
}
