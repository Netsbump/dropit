import { cn } from '@/lib/utils';
import { Button } from '@/shared/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { useToast } from '@/shared/hooks/use-toast';
import { useTranslation } from '@dropit/i18n';
import { TrainingSessionDto } from '@dropit/schemas';
import { Duration, EventApi, EventClickArg } from '@fullcalendar/core';
import enLocale from '@fullcalendar/core/locales/en-gb';
import frLocale from '@fullcalendar/core/locales/fr';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin, { DateClickArg } from '@fullcalendar/interaction';
import multiMonthPlugin from '@fullcalendar/multimonth';
import FullCalendar from '@fullcalendar/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRef, useState } from 'react';

interface EventDropInfo {
  event: EventApi;
  oldEvent: EventApi;
  delta: Duration;
  revert: () => void;
}

interface PlanningCalendarProps {
  className?: string;
  initialEvents?: TrainingSessionDto[];
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
  const [events, setEvents] = useState<TrainingSessionDto[]>(initialEvents);
  const [currentView, setCurrentView] = useState('dayGridMonth');
  const calendarRef = useRef<FullCalendar>(null);
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

  const handlePrev = () => {
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      calendarApi.prev();
    }
  };

  const handleNext = () => {
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      calendarApi.next();
    }
  };

  const handleToday = () => {
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      calendarApi.today();
    }
  };

  const handleViewChange = (newView: string) => {
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      calendarApi.changeView(newView);
      setCurrentView(newView);
    }
  };

  const getViewLabel = (view: string) => {
    switch (view) {
      case 'dayGridMonth':
        return t('month');
      case 'dayGridWeek':
        return t('week');
      case 'multiMonthYear':
        return t('year');
      default:
        return t('month');
    }
  };

  return (
    <div className={cn('planning-calendar', className)}>
      {/* Custom Toolbar */}
      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Navigation Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handlePrev}
            className="h-9 w-9"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">{t('common:previous')}</span>
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            onClick={handleNext}
            className="h-9 w-9"
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">{t('common:next')}</span>
          </Button>
          
          <Button
            variant="outline"
            onClick={handleToday}
            className="ml-2"
          >
            {t('today')}
          </Button>
        </div>

        {/* View Selector */}
        <div className="flex items-center gap-2">
          <Select value={currentView} onValueChange={handleViewChange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue>
                {getViewLabel(currentView)}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dayGridMonth">
                {t('month')}
              </SelectItem>
              <SelectItem value="dayGridWeek">
                {t('week')}
              </SelectItem>
              <SelectItem value="multiMonthYear">
                {t('year')}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Calendar */}
      <div className="rounded-lg border bg-card">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, interactionPlugin, multiMonthPlugin]}
          initialView="dayGridMonth"
          headerToolbar={false} // Disable default toolbar
          locale={currentLocale}
          editable={true}
          selectable={true}
          selectMirror={true}
          dayMaxEvents={true}
          weekends={true}
          events={events.map((event) => ({
            id: event.id,
            title: event.workout.title,
            start: event.scheduledDate,
            end: event.scheduledDate,
          }))}
          eventClick={handleEventClick}
          dateClick={handleDateClick}
          eventDrop={handleEventDrop}
          height="75vh"
        />
      </div>
    </div>
  );
}
