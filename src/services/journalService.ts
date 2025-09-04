import api from './authService';
import { JournalEntry } from '@/types';

export const getJournalEntries = async (): Promise<JournalEntry[]> => {
  const response = await api.get('/journal/entries');
  return response.data;
};

export const createJournalEntry = async (entry: {
  title: string;
  content: string;
  isPrivate: boolean;
}): Promise<JournalEntry> => {
  const response = await api.post('/journal/entries', entry);
  return response.data;
};
