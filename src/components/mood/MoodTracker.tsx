// src/components/mood/MoodTracker.tsx
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Calendar, Save, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  createMoodEntry,
  getRecentMoodEntries,
  getTodayMood,
  type MoodEntry as APIMoodEntry,
  type CreateMoodEntryData,
} from "@/services/moodService";

interface MoodEntry extends APIMoodEntry {
  dateObj: Date;
  mood: number;
}

const moodEmojis = [
  { value: 1, emoji: "😢", label: "Very Low", color: "hsl(var(--mood-poor))" },
  { value: 2, emoji: "😕", label: "Low", color: "hsl(var(--mood-low))" },
  { value: 3, emoji: "😐", label: "Neutral", color: "hsl(var(--mood-neutral))" },
  { value: 4, emoji: "😊", label: "Good", color: "hsl(var(--mood-good))" },
  { value: 5, emoji: "😃", label: "Excellent", color: "hsl(var(--mood-excellent))" },
];

const commonTriggers = [
  "Work stress",
  "Sleep issues",
  "Social interaction",
  "Exercise",
  "Weather",
  "Family",
  "Health",
  "Financial concerns",
  "Relationships",
  "Other",
];

export default function MoodTracker() {
  const { toast } = useToast();
  const [currentMood, setCurrentMood] = useState<[number]>([3]);
  const [note, setNote] = useState("");
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>([]);
  const [customTrigger, setCustomTrigger] = useState("");
  const [recentEntries, setRecentEntries] = useState<MoodEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [todayEntry, setTodayEntry] = useState<MoodEntry | null>(null);
  const [animatingMood, setAnimatingMood] = useState<number | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);

      // 1) recent entries (normalized)
      const entries = await getRecentMoodEntries();
      const mapped: MoodEntry[] = entries.map((entry) => ({
        ...entry,
        dateObj: new Date(entry.createdAt || Date.now()),
        mood: entry.moodLevel,
      }));
      setRecentEntries(mapped);

      // 2) today's entry
      const todayData = await getTodayMood();
      if (todayData.hasEntry && todayData.entry) {
        const entry = todayData.entry;
        const mappedToday: MoodEntry = {
          ...entry,
          dateObj: new Date(entry.createdAt || Date.now()),
          mood: entry.moodLevel,
        };
        setTodayEntry(mappedToday);
        setCurrentMood([entry.moodLevel]);
        setNote(entry.note || "");
        setSelectedTriggers(entry.triggers || []);
      } else {
        // Reset to default if no today's entry
        setTodayEntry(null);
        setCurrentMood([3]); // Default to neutral
        setNote("");
        setSelectedTriggers([]);
      }
    } catch (error) {
      console.error("Failed to load mood data:", error);
      toast({
        title: "Error",
        description: "Failed to load mood data. Please refresh the page.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const currentMoodData =
    moodEmojis.find((m) => m.value === currentMood[0]) || moodEmojis[2];

  const handleTriggerToggle = (trigger: string) => {
    setSelectedTriggers((prev) =>
      prev.includes(trigger)
        ? prev.filter((t) => t !== trigger)
        : [...prev, trigger]
    );
  };

  const handleMoodClick = (value: number) => {
    setCurrentMood([value]);
    setAnimatingMood(value);
    setTimeout(() => setAnimatingMood(null), 300);
  };

  const handleSaveMood = async () => {
    // Prevent saving empty mood entries
    if (!currentMood[0] || currentMood[0] < 1 || currentMood[0] > 5) {
      toast({
        title: "Invalid Mood",
        description: "Please select a valid mood level.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSaving(true);

      // final triggers
      let finalTriggers = [...selectedTriggers];
      if (selectedTriggers.includes("Other") && customTrigger.trim()) {
        finalTriggers = finalTriggers.filter((t) => t !== "Other");
        finalTriggers.push(customTrigger.trim());
      }

      const payload: CreateMoodEntryData = {
        moodLevel: currentMood[0],
        emoji: currentMoodData.emoji,
        note: note.trim() || undefined,
        triggers: finalTriggers.length > 0 ? finalTriggers : undefined,
      };

      const saved = await createMoodEntry(payload);

      const newEntry: MoodEntry = {
        ...saved,
        dateObj: new Date(saved.createdAt || Date.now()),
        mood: saved.moodLevel,
      };

      // update today's entry
      setTodayEntry(newEntry);

      // put on top of recent entries, dedupe, limit 10
      setRecentEntries((prev) => {
        const filtered = prev.filter((e) => e.id !== newEntry.id);
        return [newEntry, ...filtered].slice(0, 10);
      });

      // reset extra fields
      setCustomTrigger("");

      toast({
        title: "Success",
        description: "Mood entry saved successfully!",
      });
    } catch (error) {
      console.error("Failed to save mood entry:", error);
      toast({
        title: "Error",
        description: "Failed to save mood entry. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 bg-gradient-to-br from-[hsl(var(--wellness-calm)/0.1)] to-[hsl(var(--wellness-secondary)/0.1)] min-h-screen p-4 rounded-lg">
      {/* Today's Mood Check-in */}
      <Card className="p-6 bg-gradient-to-br from-background via-[hsl(var(--wellness-primary)/0.02)] to-[hsl(var(--wellness-secondary)/0.05)] shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl border-0">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-[hsl(var(--wellness-primary))] to-[hsl(var(--wellness-secondary))] bg-clip-text text-transparent">
            How are you feeling today?
          </h2>
          <p className="text-muted-foreground">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        {/* Mood Emoji Display */}
        <div className="text-center mb-8">
          <div
            className={cn(
              "text-8xl mb-4 transition-all duration-300",
              animatingMood === currentMood[0] && "animate-bounce scale-110"
            )}
          >
            {currentMoodData.emoji}
          </div>
          <h3
            className="text-xl font-semibold transition-colors duration-300"
            style={{ color: currentMoodData.color }}
          >
            {currentMoodData.label}
          </h3>
        </div>

        {/* Slider */}
        <div className="mb-8">
          <div className="mb-4">
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span>😢 Very Low</span>
              <span>😃 Excellent</span>
            </div>
            <Slider
              value={currentMood}
              onValueChange={setCurrentMood}
              max={5}
              min={1}
              step={1}
              className="w-full"
            />
          </div>

          {/* Emoji buttons */}
          <div className="flex justify-between">
            {moodEmojis.map((mood) => (
              <Button
                key={mood.value}
                variant="ghost"
                size="sm"
                className={cn(
                  "text-2xl p-3 rounded-full transition-all duration-300 hover:scale-110 hover:shadow-md",
                  currentMood[0] === mood.value &&
                    "bg-gradient-to-br from-[hsl(var(--wellness-primary)/0.2)] to-[hsl(var(--wellness-secondary)/0.2)] scale-110 shadow-lg ring-2 ring-[hsl(var(--wellness-primary))/0.3]"
                )}
                onClick={() => handleMoodClick(mood.value)}
              >
                {mood.emoji}
              </Button>
            ))}
          </div>
        </div>

        {/* Note */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2 text-[hsl(var(--wellness-primary))]">
            What's on your mind? (Optional)
          </label>
          <Textarea
            placeholder="Share your thoughts, feelings, or what happened today..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="min-h-[100px] resize-none rounded-lg border-2 border-[hsl(var(--wellness-primary)/0.2)] focus:border-[hsl(var(--wellness-primary))] transition-colors duration-200"
          />
        </div>

        {/* Triggers */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-3 text-[hsl(var(--wellness-primary))]">
            What influenced your mood today?
          </label>
          <div className="flex flex-wrap gap-2">
            {commonTriggers.map((trigger) => (
              <Badge
                key={trigger}
                variant={selectedTriggers.includes(trigger) ? "default" : "outline"}
                className={cn(
                  "cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-md rounded-full px-3 py-1",
                  selectedTriggers.includes(trigger) &&
                    "bg-gradient-to-r from-[hsl(var(--wellness-primary))] to-[hsl(var(--wellness-secondary))] text-white shadow-lg scale-105"
                )}
                onClick={() => handleTriggerToggle(trigger)}
              >
                {trigger}
              </Badge>
            ))}
          </div>

          {selectedTriggers.includes("Other") && (
            <div className="mt-3 animate-in slide-in-from-top-2 duration-300">
              <input
                type="text"
                placeholder="Describe what else influenced your mood..."
                value={customTrigger}
                onChange={(e) => setCustomTrigger(e.target.value)}
                className="w-full px-3 py-2 text-sm border-2 border-[hsl(var(--wellness-primary)/0.2)] rounded-lg bg-background focus:outline-none focus:border-[hsl(var(--wellness-primary))] transition-colors duration-200"
              />
            </div>
          )}
        </div>

        {/* Save Button */}
        <Button
          onClick={handleSaveMood}
          disabled={isSaving}
          className="w-full bg-gradient-to-r from-[hsl(var(--wellness-primary))] to-[hsl(var(--wellness-secondary))] hover:from-[hsl(var(--wellness-primary)/0.9)] hover:to-[hsl(var(--wellness-secondary)/0.9)] text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-lg"
          size="lg"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              {todayEntry ? "Update Today's Mood" : "Save Today's Mood"}
            </>
          )}
        </Button>
      </Card>

      {/* Recent Entries */}
      <Card className="p-6 bg-gradient-to-br from-background via-[hsl(var(--wellness-primary)/0.01)] to-[hsl(var(--wellness-secondary)/0.02)] shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl border-0">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold bg-gradient-to-r from-[hsl(var(--wellness-primary))] to-[hsl(var(--wellness-secondary))] bg-clip-text text-transparent">
            Recent Entries
          </h3>
          <Button variant="outline" size="sm" className="hover:bg-[hsl(var(--wellness-primary)/0.1)] transition-colors duration-200">
            <Calendar className="w-4 h-4 mr-2" />
            View All
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-[hsl(var(--wellness-primary))]" />
            <span className="ml-2 text-muted-foreground">Loading recent entries...</span>
          </div>
        ) : recentEntries.length > 0 ? (
          <div className="space-y-3">
            {recentEntries.map((entry) => (
              <div
                key={entry.id}
                className="flex items-start space-x-4 p-4 rounded-xl bg-gradient-to-r from-background to-[hsl(var(--wellness-primary)/0.05)] shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02] border border-[hsl(var(--wellness-primary)/0.1)]"
              >
                <div className="text-3xl">{entry.emoji}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-[hsl(var(--wellness-primary))]">
                      {moodEmojis.find((m) => m.value === entry.mood)?.label}
                    </span>
                    <span className="text-sm text-muted-foreground bg-[hsl(var(--wellness-secondary)/0.1)] px-2 py-1 rounded-full">
                      {entry.dateObj.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  {entry.note && (
                    <p className="text-sm text-muted-foreground mb-3 italic leading-relaxed">
                      {entry.note}
                    </p>
                  )}
                  {entry.triggers && entry.triggers.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {entry.triggers.map((trigger) => (
                        <Badge
                          key={`${entry.id}-${trigger}`}
                          variant="secondary"
                          className="text-xs bg-gradient-to-r from-[hsl(var(--wellness-primary)/0.1)] to-[hsl(var(--wellness-secondary)/0.1)] text-[hsl(var(--wellness-primary))] border-0 rounded-full px-3 py-1"
                        >
                          {trigger}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <div className="text-6xl mb-4 opacity-50">📝</div>
            <p className="text-lg font-medium mb-2">No recent mood entries found.</p>
            <p className="text-sm">Start tracking your mood to see your progress!</p>
          </div>
        )}
      </Card>
    </div>
  );
}
