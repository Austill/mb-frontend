// src/services/journalService.ts
import api from './authService';
import { JournalEntry } from '@/types';

// helper to map backend -> frontend
const normalizeJournal = (raw: any): JournalEntry => {
  return {
    id: raw.id || raw._id,
    userId: raw.userId || raw.user_id,
    title: raw.title || '',
    content: raw.content || '',
    isPrivate: raw.isPrivate ?? raw.is_private ?? false,
    // keep backend names your components already use
    created_at: raw.createdAt || raw.created_at,
    updated_at: raw.updatedAt || raw.updated_at,
  };
};

// GET /journal/entries
export const getJournalEntries = async (): Promise<JournalEntry[]> => {
  const response = await api.get('/journal/entries');
  const data = response.data || [];
  return data.map((item: any) => normalizeJournal(item));
};

// POST /journal/entries
export const createJournalEntry = async (entry: {
  title: string;
  content: string;
  isPrivate: boolean;
}): Promise<JournalEntry> => {
  const response = await api.post('/journal/entries', entry);
  return normalizeJournal(response.data);
};

// GET /journal/entries/:id
export const getJournalEntry = async (id: string): Promise<JournalEntry> => {
  const response = await api.get(`/journal/entries/${id}`);
  return normalizeJournal(response.data);
};

// PUT /journal/entries/:id
export const updateJournalEntry = async (
  id: string,
  data: Partial<{ title: string; content: string; isPrivate: boolean }>
): Promise<JournalEntry> => {
  // backend expects isPrivate or is_private — send camelCase
  const payload: any = { ...data };
  if (typeof data.isPrivate === 'boolean') {
    payload.isPrivate = data.isPrivate;
  }
  const response = await api.put(`/journal/entries/${id}`, payload);
  return normalizeJournal(response.data);
};

// DELETE /journal/entries/:id
export const deleteJournalEntry = async (id: string): Promise<void> => {
  await api.delete(`/journal/entries/${id}`);
};
