import React from 'react';
import { Calendar as CalendarIcon, Clock, MapPin, Plus } from 'lucide-react';
import type { CalendarEvent, Reminder } from '../types';

interface CalendarProps {
  events: CalendarEvent[];
  reminders: Reminder[];
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
  onEventClick: (event: CalendarEvent) => void;
  onAddEvent: () => void;
}

export function Calendar({
  events,
  reminders,
  selectedDate,
  onDateSelect,
  onEventClick,
  onAddEvent
}: CalendarProps) {
  const today = new Date();
  const currentMonth = selectedDate?.getMonth() ?? today.getMonth();
  const currentYear = selectedDate?.getFullYear() ?? today.getFullYear();

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const getEventsForDay = (day: number): CalendarEvent[] => {
    return events.filter(event => {
      const eventDate = new Date(event.startTime);
      return eventDate.getDate() === day &&
             eventDate.getMonth() === currentMonth &&
             eventDate.getFullYear() === currentYear;
    });
  };

  const getRemindersForDay = (day: number): Reminder[] => {
    return reminders.filter(reminder => {
      if (reminder.type !== 'time' || !reminder.time) return false;
      const reminderDate = new Date(reminder.time);
      return reminderDate.getDate() === day &&
             reminderDate.getMonth() === currentMonth &&
             reminderDate.getFullYear() === currentYear;
    });
  };

  return (
    <div className="bg-[#262626] rounded-2xl p-4 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-[#FE6902] flex items-center gap-2">
          <CalendarIcon size={20} />
          {monthNames[currentMonth]} {currentYear}
        </h2>
        <button
          onClick={onAddEvent}
          className="p-2 rounded-lg bg-[#393737]/30 hover:bg-[#393737]/50 transition-colors"
        >
          <Plus size={20} className="text-[#FE6902]" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-sm mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-[#666]">{day}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {[...Array(firstDayOfMonth)].map((_, index) => (
          <div key={`empty-${index}`} className="aspect-square" />
        ))}
        {[...Array(daysInMonth)].map((_, index) => {
          const day = index + 1;
          const events = getEventsForDay(day);
          const reminders = getRemindersForDay(day);
          const isToday = day === today.getDate() &&
                         currentMonth === today.getMonth() &&
                         currentYear === today.getFullYear();
          const isSelected = day === selectedDate?.getDate() &&
                           currentMonth === selectedDate?.getMonth() &&
                           currentYear === selectedDate?.getFullYear();

          return (
            <button
              key={day}
              onClick={() => onDateSelect(new Date(currentYear, currentMonth, day))}
              className={`
                aspect-square rounded-lg flex flex-col items-center justify-start p-1 relative
                ${isToday ? 'bg-[#FE6902] text-white' :
                  isSelected ? 'bg-[#393737]' :
                  events.length > 0 || reminders.length > 0 ? 'bg-[#393737]/30' :
                  'hover:bg-[#393737]/30'}
              `}
            >
              <span className="text-sm">{day}</span>
              {events.length > 0 && (
                <div className="absolute bottom-1 left-1">
                  <CalendarIcon size={12} className="text-[#FE6902]" />
                </div>
              )}
              {reminders.length > 0 && (
                <div className="absolute bottom-1 right-1">
                  <Clock size={12} className="text-[#FE6902]" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Events and Reminders List */}
      {selectedDate && (
        <div className="mt-4 space-y-2">
          <h3 className="text-sm font-semibold text-[#666]">Events & Reminders</h3>
          {getEventsForDay(selectedDate.getDate()).map(event => (
            <button
              key={event.id}
              onClick={() => onEventClick(event)}
              className="w-full bg-[#393737]/30 rounded-lg p-2 text-left hover:bg-[#393737]/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <CalendarIcon size={16} className="text-[#FE6902]" />
                <div>
                  <div className="font-medium">{event.title}</div>
                  <div className="text-xs text-[#666]">
                    {event.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    {!event.isAllDay && ` - ${event.endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                  </div>
                </div>
              </div>
            </button>
          ))}
          {getRemindersForDay(selectedDate.getDate()).map(reminder => (
            <div
              key={reminder.id}
              className="bg-[#393737]/30 rounded-lg p-2"
            >
              <div className="flex items-center gap-2">
                {reminder.type === 'time' ? (
                  <Clock size={16} className="text-[#FE6902]" />
                ) : (
                  <MapPin size={16} className="text-[#FE6902]" />
                )}
                <div>
                  <div className="font-medium">{reminder.title}</div>
                  {reminder.type === 'time' && reminder.time && (
                    <div className="text-xs text-[#666]">
                      {reminder.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  )}
                  {reminder.type === 'location' && reminder.location && (
                    <div className="text-xs text-[#666]">
                      {reminder.location.name}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}