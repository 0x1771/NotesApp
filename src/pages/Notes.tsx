import React, { useState, useRef, useEffect } from 'react';
import { Plus, Image, Mic, Sparkles, Search, Languages, FileText, BrainCircuit, Upload } from 'lucide-react';
import { defaultTags, type Note, type TodoItem, type ImportantDate, type ImageData, type CalendarEvent } from '../types';
import { ImageEditor } from '../components/ImageEditor';
import { Calendar as CalendarComponent } from '../components/Calendar';
import { EventModal } from '../components/EventModal';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

export function Notes() {
  const { profile } = useAuthStore();
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showNewNote, setShowNewNote] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | undefined>();
  const [searchQuery, setSearchQuery] = useState('');
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (profile) {
      loadNotes();
    }
  }, [profile]);

  const loadNotes = async () => {
    if (!profile) return;
    
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotes(data || []);
    } catch (error) {
      console.error('Error loading notes:', error);
      toast.error('Failed to load notes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveNote = async () => {
    if (!profile) return;

    if (!newNoteTitle.trim() || !newNoteContent.trim()) {
      toast.error('Please enter both title and content');
      return;
    }

    try {
      const { error } = await supabase
        .from('notes')
        .insert({
          user_id: profile.id,
          title: newNoteTitle.trim(),
          content: newNoteContent.trim(),
          tags: selectedTags,
          has_media: selectedImage !== null
        });

      if (error) throw error;

      toast.success('Note saved successfully');
      await loadNotes();
      setNewNoteTitle('');
      setNewNoteContent('');
      setSelectedTags([]);
      setSelectedImage(null);
      setShowNewNote(false);
    } catch (error) {
      console.error('Error saving note:', error);
      toast.error('Failed to save note');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#1B1B1B] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#FE6902]" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-[#FE6902]">My Notes</h1>
          <button
            onClick={() => setShowNewNote(true)}
            className="bg-[#FE6902] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#ff7b1d] transition-colors"
          >
            <Plus size={20} />
            New Note
          </button>
        </div>

        <div className="flex items-center gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#666]" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notes..."
              className="w-full bg-[#262626] rounded-xl py-2 pl-10 pr-4 text-[#E5E5E5] placeholder-[#666] focus:outline-none focus:ring-2 focus:ring-[#FE6902]"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {defaultTags.map((tag) => (
            <button
              key={tag}
              onClick={() => {
                if (selectedTags.includes(tag)) {
                  setSelectedTags(selectedTags.filter((t) => t !== tag));
                } else {
                  setSelectedTags([...selectedTags, tag]);
                }
              }}
              className={`px-3 py-1 rounded-full text-sm ${
                selectedTags.includes(tag)
                  ? 'bg-[#FE6902] text-white'
                  : 'bg-[#262626] text-[#E5E5E5] hover:bg-[#393737]'
              } transition-colors`}
            >
              #{tag}
            </button>
          ))}
        </div>
      </div>

      {showNewNote && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-[#262626] rounded-2xl w-full max-w-2xl">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-[#FE6902]">New Note</h3>
                <button
                  onClick={() => setShowNewNote(false)}
                  className="text-[#E5E5E5] hover:text-[#FE6902]"
                >
                  ✕
                </button>
              </div>

              <input
                type="text"
                value={newNoteTitle}
                onChange={(e) => setNewNoteTitle(e.target.value)}
                placeholder="Note title"
                className="w-full bg-[#393737] rounded-xl p-3 mb-4 text-[#E5E5E5] placeholder-[#666] focus:outline-none focus:ring-2 focus:ring-[#FE6902]"
              />

              <textarea
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
                placeholder="Write your note..."
                className="w-full bg-[#393737] rounded-xl p-3 h-48 mb-4 text-[#E5E5E5] placeholder-[#666] focus:outline-none focus:ring-2 focus:ring-[#FE6902]"
              />

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowNewNote(false)}
                  className="px-4 py-2 rounded-xl bg-[#393737] text-[#E5E5E5] hover:bg-[#454545] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveNote}
                  className="px-4 py-2 rounded-xl bg-[#FE6902] text-white hover:bg-[#ff7b1d] transition-colors"
                >
                  Save Note
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {notes.map((note) => (
          <div
            key={note.id}
            className="bg-[#262626] rounded-2xl p-6 hover:ring-2 hover:ring-[#FE6902] transition-all cursor-pointer"
          >
            <h3 className="text-xl font-semibold text-[#E5E5E5] mb-2">{note.title}</h3>
            <p className="text-[#666] mb-4 line-clamp-3">{note.content}</p>
            <div className="flex flex-wrap gap-2">
              {note.tags?.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 rounded-full bg-[#393737] text-[#E5E5E5] text-xs"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}