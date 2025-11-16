import { useCallback, useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { getJournalEntries as apiGetJournalEntries, createJournalEntry as apiCreateJournalEntry } from '@/services/journalService';

export default function useJournal() {
  const { toast } = useToast();
  const [entries, setEntries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const fetched = await apiGetJournalEntries();
      setEntries(fetched.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
    } catch (err) {
      console.error('useJournal.load error', err);
      toast({ title: 'Error', description: 'Failed to load journal entries', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  const createEntry = useCallback(
    async (payload: { title: string; content: string; isPrivate: boolean }) => {
      setIsSaving(true);
      const tempId = `temp-j-${Date.now()}`;
      const temp = { id: tempId, ...payload, created_at: new Date().toISOString() } as any;
      try {
        // optimistic add
        setEntries((prev) => [temp, ...prev]);
        const saved = await apiCreateJournalEntry(payload as any);
        // replace temp
          setEntries((prev) => [saved, ...prev.filter((e) => e.id !== tempId && e.id !== saved.id)]);
          // ensure server-authoritative ordering/state after optimistic update
          try {
            await load();
          } catch (e) {
            // ignore — we already showed success and have optimistic state
          }
          toast({ title: 'Success', description: 'Journal entry saved' });
          return saved;
      } catch (err) {
        console.error('createEntry error', err);
        toast({ title: 'Error', description: 'Failed to save journal entry', variant: 'destructive' });
        await load();
        throw err;
      } finally {
        setIsSaving(false);
      }
    },
    [load, toast]
  );

  return { entries, isLoading, isSaving, load, createEntry, setEntries };
}
