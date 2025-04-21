import { CreateWorkoutModal } from '@/features/planning/create-workout-modal';
import {
  CalendarEvent,
  PlanningCalendar,
} from '@/features/planning/planning-calendar';
import { api } from '@/lib/api';
import { HeaderPage } from '@/shared/components/layout/header-page';
import { useTranslation } from '@dropit/i18n';
import { EventClickArg } from '@fullcalendar/core';
import { DateClickArg } from '@fullcalendar/interaction';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';

export const Route = createFileRoute('/planning')({
  component: PlanningPage,
});

function PlanningPage() {
  const { t } = useTranslation('planning');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: calendarEvents, isLoading: calendarEventsLoading } = useQuery({
    queryKey: ['calendarEvents'],
    queryFn: () => api.session.getSessions(),
  });

  console.log(calendarEvents);

  // Example initial events - in a real app, these would come from an API
  const initialEvents: CalendarEvent[] = [
    {
      id: '1',
      title: 'Squat Day',
      start: '2024-05-15',
    },
    {
      id: '2',
      title: 'Clean & Jerk',
      start: '2024-05-20',
    },
  ];

  const handleDateClick = (info: DateClickArg) => {
    setSelectedDate(new Date(info.date));
    setIsModalOpen(true);
  };

  const handleEventClick = (info: EventClickArg) => {
    // Handle event click - e.g., open workout details
    console.log('Event clicked:', info.event);
  };

  return (
    <div className="relative flex-1">
      <HeaderPage title={t('title')} description={t('description')} />

      <div className="bg-white rounded-lg shadow p-4">
        <PlanningCalendar
          initialEvents={initialEvents}
          onDateClick={handleDateClick}
          onEventClick={handleEventClick}
        />
      </div>

      <CreateWorkoutModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedDate={selectedDate}
      />
    </div>
  );
}
