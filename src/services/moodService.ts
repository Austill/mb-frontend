// src/services/moodService.ts
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

// normalize backend -> frontend (snake_case -> camelCase)
const normalizeMood = (raw: any): MoodEntry => {
  return {
    id: raw.id || raw._id,
    userId: raw.userId || raw.user_id,
    moodLevel: raw.moodLevel ?? raw.mood_level,
    emoji: raw.emoji,
    note: raw.note,
    triggers: raw.triggers || [],
    createdAt: raw.createdAt || raw.created_at,
    updatedAt: raw.updatedAt || raw.updated_at,
  };
};

// Create a new mood entry
export const createMoodEntry = async (data: CreateMoodEntryData): Promise<MoodEntry> => {
  const response = await api.post('/mood/entries', data);
  // backend returns { message, entry }
  return normalizeMood(response.data.entry);
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
  const payload = response.data;
  return {
    entries: (payload.entries || []).map((e: any) => normalizeMood(e)),
    total: payload.total,
    limit: payload.limit,
    offset: payload.offset,
  };
};

// Get a specific mood entry
export const getMoodEntry = async (entryId: string): Promise<MoodEntry> => {
  const response = await api.get(`/mood/entries/${entryId}`);
  return normalizeMood(response.data.entry);
};

// Update a mood entry
export const updateMoodEntry = async (
  entryId: string,
  data: UpdateMoodEntryData
): Promise<MoodEntry> => {
  const response = await api.put(`/mood/entries/${entryId}`, data);
  return normalizeMood(response.data.entry);
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
  if (response.data.entry) {
    return {
      hasEntry: true,
      entry: normalizeMood(response.data.entry),
    };
  }
  return { hasEntry: false };
};

// Get recent mood entries (last 30 days)
export const getRecentMoodEntries = async (): Promise<MoodEntry[]> => {
  const response = await getMoodEntries({ limit: 10, days: 30 });
  return response.entries;
};
