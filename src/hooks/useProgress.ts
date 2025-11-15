import { useCallback, useEffect, useMemo, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { getMoodEntries } from '@/services/moodService';
import { getJournalEntries } from '@/services/journalService';

export default function useProgress() {
  const { toast } = useToast();
  const [moodEntries, setMoodEntries] = useState<any[]>([]);
  const [journalEntries, setJournalEntries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadAll = useCallback(async () => {
    setIsLoading(true);
    try {
      const moodsResp = await getMoodEntries({ days: 365 });
      const moods = moodsResp?.entries || [];
      setMoodEntries(moods.map((m: any) => ({ ...m, dateObj: new Date(m.createdAt || m.created_at) })));

      const journals = await getJournalEntries();
      setJournalEntries(journals);
    } catch (err) {
      console.error('useProgress.loadAll error', err);
      toast({ title: 'Error', description: 'Failed to load progress data', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const stats = useMemo(() => {
    const total = moodEntries.length;
    const avg = total > 0 ? moodEntries.reduce((s, m) => s + (m.moodLevel || m.mood_level || 0), 0) / total : 0;

    const now = new Date();
    const weekAgo = new Date();
    weekAgo.setDate(now.getDate() - 7);
    const checkinsThisWeek = moodEntries.filter((m) => new Date(m.createdAt || m.created_at) >= weekAgo).length;

    const moodCategories = { excellent: 0, good: 0, neutral: 0, low: 0, poor: 0 };
    for (const m of moodEntries) {
      const level = m.moodLevel ?? m.mood_level ?? 0;
      if (level >= 5) moodCategories.excellent++;
      else if (level >= 4) moodCategories.good++;
      else if (level >= 3) moodCategories.neutral++;
      else if (level >= 2) moodCategories.low++;
      else moodCategories.poor++;
    }

    return {
      averageMood: Number(avg.toFixed(2)),
      totalCheckins: checkinsThisWeek,
      totalJournalEntries: journalEntries.length,
      moodCategories,
      moodEntries,
      journalEntries,
    };
  }, [moodEntries, journalEntries]);

  return { isLoading, loadAll, stats, refresh: loadAll };
}
