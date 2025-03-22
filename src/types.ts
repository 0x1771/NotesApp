export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface ImportantDate {
  id: string;
  title: string;
  date: Date;
  tags: string[];
}

export interface ImageData {
  url: string;
  metadata: {
    width: number;
    height: number;
    type: string;
  };
  filters?: {
    brightness: number;
    contrast: number;
    saturation: number;
  };
  recognizedText?: string;
  category?: string;
}

export interface AIFeatures {
  transcription: string | null;
  summary: string | null;
  translation: {
    detectedLanguage: string;
    translations: { [key: string]: string };
  } | null;
  suggestions: string[];
  imageAnalysis?: {
    description: string;
    tags: string[];
    objects: string[];
  };
}

export interface Reminder {
  id: string;
  noteId: string;
  title: string;
  description?: string;
  type: 'time' | 'location';
  time?: Date;
  location?: {
    name: string;
    latitude: number;
    longitude: number;
    radius: number; // in meters
  };
  isCompleted: boolean;
  createdAt: Date;
}

export interface CalendarEvent {
  id: string;
  noteId?: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  isAllDay: boolean;
  color?: string;
  tags: string[];
  reminders: Reminder[];
}

export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  hasMedia: boolean;
  hasImage?: boolean;
  hasAudio?: boolean;
  todos?: TodoItem[];
  aiFeatures?: AIFeatures;
  images?: ImageData[];
  events?: CalendarEvent[];
  reminders?: Reminder[];
  createdAt: Date;
  updatedAt: Date;
}

export const defaultTags = [
  'personal',
  'work',
  'ideas',
  'todos',
  'important',
  'shopping',
  'travel',
  'health'
];

export const importantDates: ImportantDate[] = [
  {
    id: '1',
    title: 'Proje Teslimi',
    date: new Date('2024-03-25'),
    tags: ['work', 'important']
  },
  {
    id: '2',
    title: 'Doktor Randevusu',
    date: new Date('2024-03-28'),
    tags: ['health']
  },
  {
    id: '3',
    title: 'Tatil Başlangıcı',
    date: new Date('2024-04-15'),
    tags: ['travel', 'personal']
  }
];

export const welcomeNote: Note = {
  id: '1',
  title: '📝 Not Uygulamasına Hoş Geldiniz!',
  content: `Bu uygulama ile notlarınızı kolayca organize edebilir ve yönetebilirsiniz.

Özellikler:
✨ Yapay Zeka Desteği
📸 Resim Ekleme
🎤 Ses Kaydı
🏷️ Hashtag ile Kategorilendirme

Nasıl Kullanılır:
1. Yeni not eklemek için sağ alttaki + butonuna tıklayın
2. Notlarınızı hashtag'ler ile kategorilendirin
3. Medya eklemek için ilgili butonları kullanın
4. Yapay zeka yardımı için ✨ butonunu kullanın

İpucu: Notlarınızı filtrelemek için üstteki hashtag'lere tıklayabilirsiniz.`,
  tags: ['important', 'personal'],
  hasMedia: false,
  createdAt: new Date(),
  updatedAt: new Date()
};

export const todoNote: Note = {
  id: '2',
  title: '✅ Yapılacaklar Listesi',
  content: '💡 İpuçları:\n• Görevleri tamamladıkça kutucukları işaretle\n• Yeni görevler ekleyebilirsin\n• Önemli görevleri #important ile etiketle\n• Tarihleri not almayı unutma\n\nBu listeyi kendi ihtiyaçlarına göre düzenleyebilirsin. Yeni görevler eklemek için + butonunu kullan!',
  tags: ['todos', 'important'],
  hasMedia: false,
  todos: [
    { id: '1', text: 'Uygulamayı keşfet', completed: false },
    { id: '2', text: 'İlk notunu oluştur', completed: false },
    { id: '3', text: "Hashtag'leri dene", completed: false },
    { id: '4', text: 'Yapay zeka özelliğini test et', completed: false },
    { id: '5', text: 'Günlük plan oluştur', completed: false },
    { id: '6', text: 'Alışveriş listesi hazırla', completed: false },
    { id: '7', text: 'Önemli tarihleri not al', completed: false },
    { id: '8', text: 'Fikirlerini kaydet', completed: false }
  ],
  createdAt: new Date(),
  updatedAt: new Date()
};