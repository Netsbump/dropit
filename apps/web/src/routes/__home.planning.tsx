import { PlanningCalendar } from '@/features/planning/planning-calendar';
import { TrainingSessionDetailPopover } from '@/features/planning/training-session-detail-popover';
import { api } from '@/lib/api';
import { HeaderPage } from '@/shared/components/layout/header-page';
import { useToast } from '@/shared/hooks/use-toast';
import { useTranslation } from '@dropit/i18n';
import { EventClickArg } from '@fullcalendar/core';
import { DateClickArg } from '@fullcalendar/interaction';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';

export const Route = createFileRoute('/__home/planning')({
  component: PlanningPage,
});

function PlanningPage() {
  const { t } = useTranslation('planning');
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isDetailPopoverOpen, setIsDetailPopoverOpen] = useState(false);
  const [selectedTrainingSessionId, setSelectedTrainingSessionId] = useState<
    string | undefined
  >();
  const [popoverAnchorEl, setPopoverAnchorEl] = useState<HTMLElement | null>(
    null
  );

  const {
    data: calendarEvents,
    isLoading: calendarEventsLoading,
    refetch,
  } = useQuery({
    queryKey: ['calendarEvents'],
    queryFn: async () => {
      const response = await api.trainingSession.getTrainingSessions();
      if (response.status !== 200)
        throw new Error('Failed to load training sessions');
      return response.body;
    },
  });

  const handleDateClick = (info: DateClickArg) => {
    // Naviguer vers la page de création avec la date sélectionnée
    const dateParam = info.date.toISOString().split('T')[0];
    navigate({ to: '/workouts/create', search: { date: dateParam } });
  };

  const handleEventClick = (info: EventClickArg) => {
    // Fermer d'abord si un autre popover est déjà ouvert
    if (isDetailPopoverOpen) {
      setIsDetailPopoverOpen(false);
    }

    // Définir l'élément d'ancrage et ouvrir le popover
    const trainingSessionId = info.event._def.publicId;
    setSelectedTrainingSessionId(trainingSessionId);

    // Utiliser l'élément DOM de l'événement comme point d'ancrage
    const eventEl = info.el;
    setPopoverAnchorEl(eventEl);

    // Ouvrir le popover après un court délai pour éviter les problèmes de rendu
    setTimeout(() => {
      setIsDetailPopoverOpen(true);
    }, 10);
  };

  const handleClosePopover = () => {
    setIsDetailPopoverOpen(false);
  };

  const handleEditTrainingSession = (id: string) => {
    // Fermer d'abord le popover
    setIsDetailPopoverOpen(false);

    // Logique temporaire - à remplacer par une navigation vers le formulaire d'édition
    toast({
      title: t('editTrainingSession'),
      description: `${t('editingTrainingSession')} ID: ${id}`,
    });

    // TODO: Rediriger vers le formulaire d'édition de la session d'entrainement
  };

  const handleDeleteTrainingSession = async (id: string) => {
    // Confirmation avant suppression
    if (window.confirm(t('confirmDeleteTrainingSession'))) {
      try {
        // Appel à l'API pour supprimer la session d'entrainement
        const response = await api.trainingSession.deleteTrainingSession({
          params: { id },
        });

        if (response.status === 200) {
          // Fermer le popover
          setIsDetailPopoverOpen(false);

          // Afficher un message de succès
          toast({
            title: t('success'),
            description: t('trainingSessionDeleted'),
          });

          // Rafraîchir les données du calendrier
          refetch();
        } else {
          throw new Error('Failed to delete training session');
        }
      } catch (error) {
        // Afficher un message d'erreur
        toast({
          title: t('error'),
          description: t('errorDeletingTrainingSession'),
          variant: 'destructive',
        });
      }
    }
  };

  const handleViewTrainingSessionDetail = (id: string) => {
    // Fermer le popover
    setIsDetailPopoverOpen(false);

    // Naviguer vers la page de détail de la session d'entrainement
    // Note: Cette route devra être créée dans votre application
    navigate({ to: `/training-session/${id}` });

    // Alternative: Si la page n'existe pas encore, afficher un toast
    toast({
      title: t('viewTrainingTrainingSessionDetail'),
      description: t('navigatingToTrainingTrainingSessionDetail'),
    });
  };

  const handleAthleteClick = (athleteId: string) => {
    // Fermer d'abord le popover
    setIsDetailPopoverOpen(false);

    // Naviguer vers la page de détail de l'athlète
    navigate({ to: `/athletes/${athleteId}` });

    // Notification pour l'utilisateur
    toast({
      title: t('athleteDetails'),
      description: t('navigatingToAthleteDetail'),
    });
  };

  if (calendarEventsLoading) return <div>{t('common:loading')}</div>;

  return (
    <div className="relative flex-1 p-8">
      <HeaderPage title={t('title')} description={t('description')} />

      <PlanningCalendar
        initialEvents={calendarEvents}
        onDateClick={handleDateClick}
        onEventClick={handleEventClick}
      />


      <TrainingSessionDetailPopover
        isOpen={isDetailPopoverOpen}
        onClose={handleClosePopover}
        trainingSessionId={selectedTrainingSessionId}
        anchorElement={popoverAnchorEl}
        onEdit={handleEditTrainingSession}
        onDelete={handleDeleteTrainingSession}
        onViewDetail={handleViewTrainingSessionDetail}
        onAthleteClick={handleAthleteClick}
      />
    </div>
  );
}
