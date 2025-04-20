import { cn } from '@/lib/utils';
import { useToast } from '@/shared/hooks/use-toast';
import { useTranslation } from '@dropit/i18n';
import { Duration, EventApi, EventClickArg } from '@fullcalendar/core';
import enLocale from '@fullcalendar/core/locales/en-gb';
import frLocale from '@fullcalendar/core/locales/fr';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin, { DateClickArg } from '@fullcalendar/interaction';
import multiMonthPlugin from '@fullcalendar/multimonth';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import { useState } from 'react';

export type CalendarEvent = {
  id: string;
  title: string;
  start: string;
  end?: string;
  allDay?: boolean;
};

interface EventDropInfo {
  event: EventApi;
  oldEvent: EventApi;
  delta: Duration;
  revert: () => void;
}

interface PlanningCalendarProps {
  className?: string;
  initialEvents?: CalendarEvent[];
  onEventClick?: (eventInfo: EventClickArg) => void;
  onDateClick?: (dateInfo: DateClickArg) => void;
  onEventDrop?: (eventDropInfo: EventDropInfo) => void;
}

export function PlanningCalendar({
  className,
  initialEvents = [],
  onEventClick,
  onDateClick,
  onEventDrop,
}: PlanningCalendarProps) {
  const { t, i18n } = useTranslation('planning');
  const { toast } = useToast();
  const [events, setEvents] = useState<CalendarEvent[]>(initialEvents);
  const currentLocale = i18n.language === 'fr' ? frLocale : enLocale;

  const handleEventClick = (info: EventClickArg) => {
    if (onEventClick) {
      onEventClick(info);
    }
  };

  const handleDateClick = (info: DateClickArg) => {
    if (onDateClick) {
      onDateClick(info);
    }
  };

  const handleEventDrop = (info: EventDropInfo) => {
    if (onEventDrop) {
      onEventDrop(info);
    } else {
      // Default behavior: update the event date
      setEvents((prevEvents) => {
        return prevEvents.map((event) => {
          if (event.id === info.event.id) {
            return {
              ...event,
              start: info.event.startStr,
              end: info.event.endStr || undefined,
            };
          }
          return event;
        });
      });

      toast({
        title: t('eventMoved'),
        description: t('eventMovedDescription'),
      });
    }
  };

  return (
    <div className={cn('planning-calendar', className)}>
      <FullCalendar
        plugins={[
          dayGridPlugin,
          timeGridPlugin,
          interactionPlugin,
          multiMonthPlugin,
        ]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,multiMonthYear',
        }}
        buttonText={{
          today: t('today'),
          month: t('month'),
          week: t('week'),
          year: t('year'),
        }}
        editable={true}
        selectable={true}
        selectMirror={true}
        dayMaxEvents={true}
        weekends={true}
        events={events}
        locale={currentLocale}
        eventClick={handleEventClick}
        dateClick={handleDateClick}
        eventDrop={handleEventDrop}
        height="auto"
      />
    </div>
  );
}
