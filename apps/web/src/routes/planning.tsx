import { CreateWorkoutModal } from '@/features/planning/create-workout-modal';
import {
  CalendarEvent,
  PlanningCalendar,
} from '@/features/planning/planning-calendar';
import { useTranslation } from '@dropit/i18n';
import { EventClickArg } from '@fullcalendar/core';
import { DateClickArg } from '@fullcalendar/interaction';
import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';

export const Route = createFileRoute('/planning')({
  component: RouteComponent,
});

function RouteComponent() {
  const { t } = useTranslation('planning');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [isModalOpen, setIsModalOpen] = useState(false);

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
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">{t('title')}</h1>
      <p className="text-muted-foreground mb-6">{t('description')}</p>

      <div className="bg-background rounded-lg shadow p-4">
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
