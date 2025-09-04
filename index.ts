export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  date: string; // ISO string
  isPrivate: boolean;
  aiInsights?: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
  tags?: string[];
}

export interface AuthResponse {
  token: string;
  user: User;
}