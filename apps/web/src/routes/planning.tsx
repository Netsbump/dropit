import { CreateWorkoutModal } from '@/features/planning/create-workout-modal';
import { PlanningCalendar } from '@/features/planning/planning-calendar';
import { SessionDetailPopover } from '@/features/planning/session-detail-popover';
import { api } from '@/lib/api';
import { HeaderPage } from '@/shared/components/layout/header-page';
import { useToast } from '@/shared/hooks/use-toast';
import { useTranslation } from '@dropit/i18n';
import { EventClickArg } from '@fullcalendar/core';
import { DateClickArg } from '@fullcalendar/interaction';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';

export const Route = createFileRoute('/planning')({
  component: PlanningPage,
});

function PlanningPage() {
  const { t } = useTranslation('planning');
  const { toast } = useToast();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailPopoverOpen, setIsDetailPopoverOpen] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<
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
      const response = await api.session.getSessions();
      if (response.status !== 200) throw new Error('Failed to load sessions');
      return response.body;
    },
  });

  const handleDateClick = (info: DateClickArg) => {
    setSelectedDate(new Date(info.date));
    setIsCreateModalOpen(true);
  };

  const handleEventClick = (info: EventClickArg) => {
    // Fermer d'abord si un autre popover est déjà ouvert
    if (isDetailPopoverOpen) {
      setIsDetailPopoverOpen(false);
    }

    // Définir l'élément d'ancrage et ouvrir le popover
    const sessionId = info.event._def.publicId;
    setSelectedSessionId(sessionId);

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

  const handleEditSession = (id: string) => {
    // Fermer d'abord le popover
    setIsDetailPopoverOpen(false);

    // Logique temporaire - à remplacer par une navigation vers le formulaire d'édition
    toast({
      title: t('editSession'),
      description: `${t('editingSession')} ID: ${id}`,
    });

    // TODO: Rediriger vers le formulaire d'édition de session
  };

  const handleDeleteSession = async (id: string) => {
    // Confirmation avant suppression
    if (window.confirm(t('confirmDeleteSession'))) {
      try {
        // Appel à l'API pour supprimer la session
        const response = await api.session.deleteSession({ params: { id } });

        if (response.status === 200) {
          // Fermer le popover
          setIsDetailPopoverOpen(false);

          // Afficher un message de succès
          toast({
            title: t('success'),
            description: t('sessionDeleted'),
          });

          // Rafraîchir les données du calendrier
          refetch();
        } else {
          throw new Error('Failed to delete session');
        }
      } catch (error) {
        // Afficher un message d'erreur
        toast({
          title: t('error'),
          description: t('errorDeletingSession'),
          variant: 'destructive',
        });
      }
    }
  };

  const handleViewSessionDetail = (id: string) => {
    // Fermer le popover
    setIsDetailPopoverOpen(false);

    // Naviguer vers la page de détail de la session
    // Note: Cette route devra être créée dans votre application
    navigate({ to: `/session/${id}` });

    // Alternative: Si la page n'existe pas encore, afficher un toast
    toast({
      title: t('viewSessionDetail'),
      description: t('navigatingToSessionDetail'),
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
    <div className="relative flex-1">
      <HeaderPage title={t('title')} description={t('description')} />

      <div className="bg-white rounded-lg shadow p-4">
        <PlanningCalendar
          initialEvents={calendarEvents}
          onDateClick={handleDateClick}
          onEventClick={handleEventClick}
        />
      </div>

      <CreateWorkoutModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        selectedDate={selectedDate}
      />

      <SessionDetailPopover
        isOpen={isDetailPopoverOpen}
        onClose={handleClosePopover}
        sessionId={selectedSessionId}
        anchorElement={popoverAnchorEl}
        onEdit={handleEditSession}
        onDelete={handleDeleteSession}
        onViewDetail={handleViewSessionDetail}
        onAthleteClick={handleAthleteClick}
      />
    </div>
  );
}
