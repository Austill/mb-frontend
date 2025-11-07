export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  isPremium?: boolean;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at?: string;
  isPrivate: boolean;
  mood?: string;
  user_id: string;
}
