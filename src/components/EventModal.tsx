import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, MapPin } from 'lucide-react';
import type { CalendarEvent, Reminder } from '../types';

interface EventModalProps {
  event?: CalendarEvent;
  onSave: (event: Partial<CalendarEvent>) => void;
  onClose: () => void;
}

export function EventModal({ event, onSave, onClose }: EventModalProps) {
  const [title, setTitle] = useState(event?.title ?? '');
  const [description, setDescription] = useState(event?.description ?? '');
  const [startTime, setStartTime] = useState(
    event?.startTime ?? new Date()
  );
  const [endTime, setEndTime] = useState(
    event?.endTime ?? new Date(Date.now() + 3600000)
  );
  const [isAllDay, setIsAllDay] = useState(event?.isAllDay ?? false);
  const [selectedTags, setSelectedTags] = useState<string[]>(event?.tags ?? []);

  const handleSave = () => {
    onSave({
      title,
      description,
      startTime,
      endTime,
      isAllDay,
      tags: selectedTags,
      reminders: []
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-[#262626] rounded-2xl w-full max-w-lg">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-[#FE6902]">
              {event ? 'Edit Event' : 'New Event'}
            </h3>
            <button
              onClick={onClose}
              className="text-[#E5E5E5] hover:text-[#FE6902]"
            >
              ✕
            </button>
          </div>

          <div className="space-y-4">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Event title"
              className="w-full bg-[#393737] rounded-xl p-3 text-[#E5E5E5] placeholder-[#666] focus:outline-none focus:ring-2 focus:ring-[#FE6902]"
            />

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description"
              className="w-full bg-[#393737] rounded-xl p-3 h-32 text-[#E5E5E5] placeholder-[#666] focus:outline-none focus:ring-2 focus:ring-[#FE6902]"
            />

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="allDay"
                checked={isAllDay}
                onChange={(e) => setIsAllDay(e.target.checked)}
                className="rounded border-[#393737]"
              />
              <label htmlFor="allDay" className="text-sm">All day</label>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1">Start</label>
                <input
                  type="datetime-local"
                  value={startTime.toISOString().slice(0, 16)}
                  onChange={(e) => setStartTime(new Date(e.target.value))}
                  className="w-full bg-[#393737] rounded-xl p-3 text-[#E5E5E5]"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">End</label>
                <input
                  type="datetime-local"
                  value={endTime.toISOString().slice(0, 16)}
                  onChange={(e) => setEndTime(new Date(e.target.value))}
                  className="w-full bg-[#393737] rounded-xl p-3 text-[#E5E5E5]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={onClose}
                className="px-6 py-2 rounded-xl bg-[#393737] text-[#E5E5E5] hover:bg-[#454545] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-2 rounded-xl bg-[#FE6902] text-white hover:bg-[#ff7b1d] transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}