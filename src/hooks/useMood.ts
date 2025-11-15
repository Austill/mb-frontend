import { useCallback, useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import {
  createMoodEntry,
  getRecentMoodEntries,
  getTodayMood,
  type MoodEntry as APIMoodEntry,
} from '@/services/moodService';

type MoodEntry = APIMoodEntry & { dateObj?: Date };

export default function useMood() {
  const { toast } = useToast();
  const [todayEntry, setTodayEntry] = useState<MoodEntry | null>(null);
  const [recentEntries, setRecentEntries] = useState<MoodEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const entries = await getRecentMoodEntries();
      const mapped = entries.map((e) => ({ ...e, dateObj: new Date(e.createdAt || e.created_at) }));
      setRecentEntries(mapped);

      const today = await getTodayMood();
      if (today.hasEntry && today.entry) {
        setTodayEntry({ ...today.entry, dateObj: new Date(today.entry.createdAt || today.entry.created_at) } as MoodEntry);
      } else {
        setTodayEntry(null);
      }
    } catch (err) {
      console.error('useMood.load error', err);
      toast({ title: 'Error', description: 'Failed to load mood data', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  const saveMood = useCallback(
    async (payload: any) => {
      setIsSaving(true);
      // optimistic entry
      const tempId = `temp-${Date.now()}`;
      const temp = {
        id: tempId,
        moodLevel: payload.moodLevel,
        emoji: payload.emoji,
        note: payload.note,
        triggers: payload.triggers,
        createdAt: new Date().toISOString(),
      } as any;

      try {
        // optimistic UI update
        setTodayEntry({ ...temp, dateObj: new Date(temp.createdAt) });
        setRecentEntries((prev) => [ { ...temp, dateObj: new Date(temp.createdAt) }, ...prev.filter((p) => p.id !== tempId) ].slice(0, 20));

        const saved = await createMoodEntry(payload);
        const normalized = { ...saved, dateObj: new Date(saved.createdAt || saved.created_at) } as MoodEntry;

        // replace temp with saved
        setTodayEntry(normalized);
        setRecentEntries((prev) => {
          const withoutTemp = prev.filter((p) => p.id !== tempId && p.id !== normalized.id);
          return [normalized, ...withoutTemp].slice(0, 20);
        });

        toast({ title: 'Success', description: 'Mood saved' });
        return normalized;
      } catch (err) {
        console.error('saveMood error', err);
        toast({ title: 'Error', description: 'Failed to save mood', variant: 'destructive' });
        // reload to restore server state
        await load();
        throw err;
      } finally {
        setIsSaving(false);
      }
    },
    [load, toast]
  );

  return {
    todayEntry,
    recentEntries,
    isLoading,
    isSaving,
    load,
    saveMood,
    setRecentEntries,
    setTodayEntry,
  };
}
