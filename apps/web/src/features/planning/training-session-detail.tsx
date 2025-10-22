import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { useTranslation } from '@dropit/i18n';
import { WORKOUT_ELEMENT_TYPES } from '@dropit/schemas';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { enGB, fr } from 'date-fns/locale';
import {
  Calendar,
  Edit,
  ExternalLink,
  MoreHorizontal,
  Printer,
  Share2,
  Trash2,
  User,
  X,
} from 'lucide-react';

interface TrainingSessionDetailProps {
  id: string;
  onClose?: () => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onViewDetail?: (id: string) => void;
  onAthleteClick?: (athleteId: string) => void;
}

export function TrainingSessionDetail({
  id,
  onClose,
  onEdit,
  onDelete,
  onViewDetail,
  onAthleteClick,
}: TrainingSessionDetailProps) {
  const { t, i18n } = useTranslation('planning');
  const locale = i18n.language === 'fr' ? fr : enGB;

  const { data, isLoading } = useQuery({
    queryKey: ['trainingSession', id],
    queryFn: async () => {
      const response = await api.trainingSession.getTrainingSession({
        params: { id },
      });
      if (response.status !== 200)
        throw new Error('Failed to load training session');
      return response.body;
    },
  });

  if (isLoading) return <div className="p-2">{t('common:loading')}</div>;
  if (!data) return <div className="p-2">No data</div>;

  return (
    <div className="relative p-0 flex flex-col max-h-[80vh]">
      {/* Header avec date de la session et actions */}
      <div className="flex items-center justify-between p-3 border-b bg-muted/30">
        <div>
          <p className="text-sm text-muted-foreground">
            {format(new Date(data.scheduledDate), 'PPP', { locale })}
          </p>
        </div>

        <div className="flex items-center space-x-1">
          {onEdit && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(id)}
              title={t('edit')}
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}

          {onDelete && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(id)}
              title={t('delete')}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" title={t('moreOptions')}>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Printer className="mr-2 h-4 w-4" />
                <span>{t('print')}</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Share2 className="mr-2 h-4 w-4" />
                <span>{t('publish')}</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Calendar className="mr-2 h-4 w-4" />
                <span>{t('addToCalendar')}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {onClose && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              title={t('close')}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Contenu scrollable */}
      <div className="p-3 space-y-4 overflow-y-auto">
        {/* Description */}
        {data.workout.description && (
          <div>
            <p className="text-sm text-muted-foreground">
              {data.workout.description}
            </p>
          </div>
        )}

        {/* Athlètes */}
        {data.athletes && data.athletes.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-500">{t('athletes')}</h4>
            <div className="flex flex-wrap gap-1.5">
              {data.athletes.slice(0, 3).map((athlete) => (
                <Button
                  key={athlete.id}
                  variant="ghost"
                  size="sm"
                  className="h-auto py-1 px-2 flex items-center gap-1 rounded-full bg-muted/50 hover:bg-muted"
                  onClick={() => onAthleteClick?.(athlete.id)}
                >
                  <User className="h-3 w-3" />
                  <span className="text-xs">
                    {athlete.firstName} {athlete.lastName}
                  </span>
                </Button>
              ))}
              {data.athletes.length > 3 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto py-1 px-2 rounded-full bg-muted/50 hover:bg-muted"
                  onClick={() => onViewDetail?.(id)}
                >
                  <span className="text-xs text-muted-foreground">
                    +{data.athletes.length - 3} {t('others')}
                  </span>
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Éléments de l'entraînement */}
        <div className="space-y-2">
          <div className="space-y-3">
            {data.workout.elements.map((element) => (
              <div
                key={element.id}
                className="p-2 rounded-md border border-gray-200 bg-gray-50 text-sm"
              >
                <div className="flex justify-between items-start">
                  <div>
                    {element.type === WORKOUT_ELEMENT_TYPES.EXERCISE ? (
                      <div className="font-medium">{element.exercise.name}</div>
                    ) : (
                      <div className="font-medium">{element.complex.complexCategory?.name || 'Complex'}</div>
                    )}

                    <div className="flex flex-wrap gap-1 mt-1">
                      <Badge variant="outline" className="text-xs px-1">
                        {element.sets}x{element.reps}
                      </Badge>

                      {element.startWeight_percent && (
                        <Badge variant="outline" className="text-xs px-1">
                          {element.startWeight_percent}%
                        </Badge>
                      )}

                      {element.rest && (
                        <Badge variant="outline" className="text-xs px-1">
                          {t('rest')}: {element.rest}s
                        </Badge>
                      )}

                      {element.duration && (
                        <Badge variant="outline" className="text-xs px-1">
                          {element.duration}min
                        </Badge>
                      )}
                    </div>
                  </div>

                  <Badge
                    variant="secondary"
                    className={cn(
                      'text-xs',
                      element.type === WORKOUT_ELEMENT_TYPES.EXERCISE
                        ? 'bg-tertiary text-tertiary-foreground hover:bg-tertiary'
                        : 'bg-secondary text-secondary-foreground hover:bg-secondary'
                    )}
                  >
                    {element.type === WORKOUT_ELEMENT_TYPES.EXERCISE
                      ? t('exercise')
                      : t('complex')}
                  </Badge>
                </div>

                {/* Détails additionnels pour les complexes */}
                {element.type === WORKOUT_ELEMENT_TYPES.COMPLEX &&
                  element.complex.exercises && (
                    <div className="mt-2 pl-4 border-l-2 border-gray-300">
                      {element.complex.exercises.map((ex, index) => (
                        <div
                          key={`${element.id}-${index}`}
                          className="text-xs mt-1"
                        >
                          {ex.name} {ex.reps && `(${ex.reps} reps)`}
                        </div>
                      ))}
                    </div>
                  )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer avec bouton "Voir le détail" */}
      {onViewDetail && (
        <div className="p-3 border-t mt-auto">
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => onViewDetail(id)}
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            {t('viewDetail')}
          </Button>
        </div>
      )}
    </div>
  );
}
