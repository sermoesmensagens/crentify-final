
export enum Section {
  DASHBOARD = 'dashboard',
  BIBLE = 'bible',
  MENTOR = 'mentor',
  DIARY = 'diary',
  HABITS = 'habits',
  WORKFLOW = 'workflow',
  FINANCE = 'finance',
  HEALTH = 'health',
  ADMIN = 'admin',
  ACADEMY = 'academy'
}

export interface AcademyCategory {
  id: string;
  name: string;
}

export type AcademyVisibility = 'público' | 'não listado' | 'privado';

export interface AcademyContent {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  type: 'video' | 'text' | 'audio';
  url?: string;
  textContent?: string;
  fileName?: string;
  thumbnailUrl?: string;
  visibility?: AcademyVisibility;
}

export interface AcademyReflection {
  id: string;
  contentId: string;
  title: string;
  text: string;
  date: string;
}

export interface BibleNote {
  id: string;
  bookName: string;
  chapter: number;
  verse: number;
  verseText: string;
  content: string;
  date: string;
}

export interface DiaryEntry {
  id: string;
  title: string;
  content: string;
  date: string;
  type: 'free' | 'plan' | 'testimony' | 'routine';
}

export type HabitFrequency = 'daily' | 'weekly' | 'period' | 'annual' | 'once';

export interface SpiritualHabit {
  id: string;
  category: 'ORAÇÃO' | 'LEITURA' | 'JEJUM' | 'CULTO' | 'SERVIÇO' | 'ESTUDO' | 'OUTRO';
  description: string;
  frequency: HabitFrequency;
  selectedDays?: number[];
  startDate?: string;
  endDate?: string;
  date?: string;
  completions: Record<string, boolean>;
}

export interface PhysicalActivity {
  id: string;
  type: string;
  duration: number;
  calories: number;
  date: string;
  notes: string;
}

export interface Recipe {
  id: string;
  title: string;
  instructions: string;
  imageUrl?: string;
  youtubeUrl?: string;
  date: string;
}

export interface MealRecord {
  id: string;
  type: 'Café da Manhã' | 'Almoço' | 'Jantar' | 'Lanche' | 'Outro';
  date: string;
  description: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

export interface BibleData {
  books: {
    name: string;
    chapters: {
      number: number;
      verses: {
        number: number;
        text: string;
      }[];
    }[];
  }[];
}

export interface BibleProgress {
  completedChapters: Record<string, number[]>;
}

export interface FinancialTransaction {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
}

export interface Installment {
  id: string;
  number: number;
  amount: number;
  date: string;
  isPaid: boolean; 
  isLaunched: boolean;
}

export interface FinancialPlan {
  id: string;
  description: string;
  type: 'income' | 'expense';
  totalAmount: number;
  installmentAmount: number;
  installmentsCount: number;
  startDate: string;
  category: string;
  installments: Installment[];
}

export interface WorkflowTask {
  id: string;
  title: string;
  status: 'draft' | 'ready' | 'published';
  platform: 'YouTube' | 'TikTok' | 'WordPress';
  content?: string;
  script?: string;
  sources?: string[];
  editorialAngle?: string;
  transcript?: string;
  transcriptSpeaker?: string;
  imageWebP?: string;
}