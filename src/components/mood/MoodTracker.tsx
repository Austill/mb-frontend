import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Calendar, TrendingUp, Save, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  createMoodEntry, 
  getRecentMoodEntries, 
  getTodayMood,
  MoodEntry as APIMoodEntry,
  CreateMoodEntryData 
} from "@/services/moodService";

// Use the API interface but keep local interface for compatibility
interface MoodEntry extends Omit<APIMoodEntry, 'createdAt' | 'updatedAt'> {
  date: Date;
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
  "Work stress", "Sleep issues", "Social interaction", "Exercise", 
  "Weather", "Family", "Health", "Financial concerns", "Relationships", "Other"
];

export default function MoodTracker() {
  const { toast } = useToast();
  const [currentMood, setCurrentMood] = useState([3]);
  const [note, setNote] = useState("");
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>([]);
  const [customTrigger, setCustomTrigger] = useState("");
  const [recentEntries, setRecentEntries] = useState<MoodEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [todayEntry, setTodayEntry] = useState<MoodEntry | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // Check if user has already logged mood today
      const todayData = await getTodayMood();
      if (todayData.hasEntry && todayData.entry) {
        const entry = todayData.entry;
        setTodayEntry({
          ...entry,
          date: new Date(entry.createdAt),
          mood: entry.moodLevel
        });
        // Pre-fill form with today's entry
        setCurrentMood([entry.moodLevel]);
        setNote(entry.note || "");
        setSelectedTriggers(entry.triggers || []);
      }

      // Load recent entries
      const entries = await getRecentMoodEntries();
      const formattedEntries: MoodEntry[] = entries.map(entry => ({
        ...entry,
        date: new Date(entry.createdAt),
        mood: entry.moodLevel
      }));
      setRecentEntries(formattedEntries);

    } catch (error) {
      console.error('Failed to load mood data:', error);
      toast({
        title: "Error",
        description: "Failed to load mood data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const currentMoodData = moodEmojis.find(m => m.value === currentMood[0]) || moodEmojis[2];

  const handleTriggerToggle = (trigger: string) => {
    setSelectedTriggers(prev => 
      prev.includes(trigger)
        ? prev.filter(t => t !== trigger)
        : [...prev, trigger]
    );
  };

  const handleSaveMood = async () => {
    try {
      setIsSaving(true);
      
      // Prepare triggers array including custom trigger if provided
      let finalTriggers = [...selectedTriggers];
      if (selectedTriggers.includes("Other") && customTrigger.trim()) {
        finalTriggers = finalTriggers.filter(t => t !== "Other");
        finalTriggers.push(customTrigger.trim());
      }
      
      const moodData: CreateMoodEntryData = {
        moodLevel: currentMood[0],
        emoji: currentMoodData.emoji,
        note: note.trim() || undefined,
        triggers: finalTriggers.length > 0 ? finalTriggers : undefined
      };
      
      const savedEntry = await createMoodEntry(moodData);
      
      // Update local state
      const newEntry: MoodEntry = {
        ...savedEntry,
        date: new Date(savedEntry.createdAt),
        mood: savedEntry.moodLevel
      };
      
      setTodayEntry(newEntry);
      setRecentEntries(prev => [newEntry, ...prev.slice(0, 9)]); // Keep only 10 recent entries
      
      // Reset form
      setNote("");
      setSelectedTriggers([]);
      setCustomTrigger("");
      
      toast({
        title: "Success",
        description: "Mood entry saved successfully!"
      });
      
    } catch (error) {
      console.error('Failed to save mood entry:', error);
      toast({
        title: "Error",
        description: "Failed to save mood entry. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Today's Mood Check-in */}
      <Card className="p-6 bg-gradient-to-br from-background to-[hsl(var(--wellness-primary)/0.05)]">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold mb-2">How are you feeling today?</h2>
          <p className="text-muted-foreground">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>

        {/* Mood Emoji Display */}
        <div className="text-center mb-8">
          <div className="text-8xl mb-4 animate-pulse">
            {currentMoodData.emoji}
          </div>
          <h3 className="text-xl font-semibold" style={{ color: currentMoodData.color }}>
            {currentMoodData.label}
          </h3>
        </div>

        {/* Mood Slider */}
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
          
          {/* Emoji Scale */}
          <div className="flex justify-between">
            {moodEmojis.map((mood) => (
              <Button
                key={mood.value}
                variant="ghost"
                size="sm"
                className={cn(
                  "text-2xl p-2 rounded-full transition-all",
                  currentMood[0] === mood.value && "bg-primary/10 scale-110"
                )}
                onClick={() => setCurrentMood([mood.value])}
              >
                {mood.emoji}
              </Button>
            ))}
          </div>
        </div>

        {/* Mood Note */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">
            What's on your mind? (Optional)
          </label>
          <Textarea
            placeholder="Share your thoughts, feelings, or what happened today..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="min-h-[100px] resize-none"
          />
        </div>

        {/* Triggers */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-3">
            What influenced your mood today?
          </label>
          <div className="flex flex-wrap gap-2">
            {commonTriggers.map((trigger) => (
              <Badge
                key={trigger}
                variant={selectedTriggers.includes(trigger) ? "default" : "outline"}
                className={cn(
                  "cursor-pointer transition-all hover:scale-105",
                  selectedTriggers.includes(trigger) && 
                  "bg-[hsl(var(--wellness-primary))] hover:bg-[hsl(var(--wellness-primary))]"
                )}
                onClick={() => handleTriggerToggle(trigger)}
              >
                {trigger}
              </Badge>
            ))}
          </div>
          
          {/* Custom Trigger Input */}
          {selectedTriggers.includes("Other") && (
            <div className="mt-3">
              <input
                type="text"
                placeholder="Describe what else influenced your mood..."
                value={customTrigger}
                onChange={(e) => setCustomTrigger(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              />
            </div>
          )}
        </div>

        {/* Save Button */}
        <Button 
          onClick={handleSaveMood}
          disabled={isSaving}
          className="w-full bg-[hsl(var(--wellness-primary))] hover:bg-[hsl(var(--wellness-primary))] text-white"
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
              {todayEntry ? 'Update Today\'s Mood' : 'Save Today\'s Mood'}
            </>
          )}
        </Button>
      </Card>

      {/* Recent Entries */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Recent Entries</h3>
          <Button variant="outline" size="sm">
            <Calendar className="w-4 h-4 mr-2" />
            View All
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="ml-2">Loading recent entries...</span>
          </div>
        ) : recentEntries.length > 0 ? (
          <div className="space-y-3">
            {recentEntries.map((entry) => (
              <div key={entry.id} className="flex items-start space-x-4 p-3 rounded-lg bg-muted/30">
                <div className="text-2xl">{entry.emoji}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium">
                      {moodEmojis.find(m => m.value === entry.mood)?.label}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {entry.date.toLocaleDateString()}
                    </span>
                  </div>
                  {entry.note && (
                    <p className="text-sm text-muted-foreground mb-2">{entry.note}</p>
                  )}
                  {entry.triggers && entry.triggers.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {entry.triggers.map((trigger, index) => (
                        <Badge key={`${trigger}-${index}`} variant="secondary" className="text-xs">
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
          <div className="text-center py-8 text-muted-foreground">
            <p>No recent mood entries found.</p>
            <p className="text-sm">Start tracking your mood to see your progress!</p>
          </div>
        )}
      </Card>
    </div>
  );
}
