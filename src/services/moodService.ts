import api from './authService';

export interface MoodEntry {
  id: string;
  userId: string;
  moodLevel: number;
  emoji: string;
  note?: string;
  triggers?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface MoodStats {
  totalEntries: number;
  averageMood: number;
  moodDistribution: Record<string, number>;
  commonTriggers: Array<{ trigger: string; count: number }>;
  period: number;
}

export interface CreateMoodEntryData {
  moodLevel: number;
  emoji: string;
  note?: string;
  triggers?: string[];
}

export interface UpdateMoodEntryData {
  moodLevel?: number;
  emoji?: string;
  note?: string;
  triggers?: string[];
}

// Create a new mood entry
export const createMoodEntry = async (data: CreateMoodEntryData): Promise<MoodEntry> => {
  const response = await api.post('/mood/entries', data);
  return response.data.entry;
};

// Get mood entries with pagination and filtering
export const getMoodEntries = async (params?: {
  limit?: number;
  offset?: number;
  days?: number;
}): Promise<{
  entries: MoodEntry[];
  total: number;
  limit: number;
  offset: number;
}> => {
  const response = await api.get('/mood/entries', { params });
  return response.data;
};

// Get a specific mood entry
export const getMoodEntry = async (entryId: string): Promise<MoodEntry> => {
  const response = await api.get(`/mood/entries/${entryId}`);
  return response.data.entry;
};

// Update a mood entry
export const updateMoodEntry = async (entryId: string, data: UpdateMoodEntryData): Promise<MoodEntry> => {
  const response = await api.put(`/mood/entries/${entryId}`, data);
  return response.data.entry;
};

// Delete a mood entry
export const deleteMoodEntry = async (entryId: string): Promise<void> => {
  await api.delete(`/mood/entries/${entryId}`);
};

// Get mood statistics
export const getMoodStats = async (days: number = 30): Promise<MoodStats> => {
  const response = await api.get('/mood/stats', { params: { days } });
  return response.data.stats;
};

// Check if user has logged mood today
export const getTodayMood = async (): Promise<{
  hasEntry: boolean;
  entry?: MoodEntry;
}> => {
  const response = await api.get('/mood/today');
  return response.data;
};

// Get recent mood entries (last 7 days)
export const getRecentMoodEntries = async (): Promise<MoodEntry[]> => {
  const response = await getMoodEntries({ limit: 10, days: 7 });
  return response.entries;
};
