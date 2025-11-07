import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { getDailyInsight, type WellnessInsight } from "@/services/aiService";
import { getMoodEntries } from "@/services/moodService";
import { getJournalEntries } from "@/services/journalService";
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  Heart,
  Brain,
  Activity,
} from "lucide-react";

interface MoodData {
  date: string;
  mood: number;
  note?: string;
}

export default function ProgressDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState<"week" | "month" | "year">("week");
  const [dailyInsight, setDailyInsight] = useState<WellnessInsight | null>(null);
  const [moodData, setMoodData] = useState<MoodData[]>([]);
  const [journalCount, setJournalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        loadDailyInsight(),
        loadMoodData(),
        loadJournalData(),
      ]);
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
      toast({
        title: "Error",
        description: "Could not load progress data.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ use the normalized mood service (createdAt, moodLevel, note)
  const loadMoodData = async () => {
    try {
      const response = await getMoodEntries();
      const entries = response.entries || [];
      const formattedData: MoodData[] = entries.map((entry: any) => ({
        date: entry.createdAt,
        mood: entry.moodLevel,
        note: entry.note,
      }));
      setMoodData(formattedData);
    } catch (error) {
      console.error("Failed to load mood data:", error);
      setMoodData([]);
    }
  };

  const loadJournalData = async () => {
    try {
      const entries = await getJournalEntries();
      setJournalCount(entries.length);
    } catch (error) {
      console.error("Failed to load journal data:", error);
      setJournalCount(0);
    }
  };

  // ✅ actually call the backend insights endpoint
  const loadDailyInsight = async () => {
    try {
      const res = await getDailyInsight();
      // aiService returns { insight, is_new }
      setDailyInsight(res.insight ?? null);
    } catch (error) {
      console.error("Failed to load daily insight:", error);
      // it's okay to fail silently here
    }
  };

  // Calculate mood stats
  const averageMood =
    moodData.length > 0
      ? moodData.reduce((sum, data) => sum + data.mood, 0) / moodData.length
      : 0;

  const moodTrend =
    moodData.length >= 2
      ? moodData[moodData.length - 1].mood - moodData[0].mood
      : 0;

  const checkInStreak = moodData.length;
  const journalStreak = journalCount;

  const getMoodColor = (mood: number) => {
    if (mood >= 4.5) return "hsl(var(--mood-excellent))";
    if (mood >= 3.5) return "hsl(var(--mood-good))";
    if (mood >= 2.5) return "hsl(var(--mood-neutral))";
    if (mood >= 1.5) return "hsl(var(--mood-low))";
    return "hsl(var(--mood-poor))";
  };

  const renderMoodChart = () => {
    const maxMood = 5;
    const chartHeight = 120;
    const displayData = moodData.slice(-7); // last 7 entries

    if (displayData.length === 0) {
      return (
        <div className="relative h-32 bg-muted/20 rounded-lg p-4 flex items-center justify-center">
          <p className="text-muted-foreground">
            No mood data yet. Start tracking your mood!
          </p>
        </div>
      );
    }

    return (
      <div className="relative h-32 bg-muted/20 rounded-lg p-4">
        <div className="flex items-end justify-between h-full">
          {displayData.map((data) => {
            const height = (data.mood / maxMood) * chartHeight;
            return (
              <div key={data.date} className="flex flex-col items-center space-y-2">
                <div
                    className="w-6 rounded-t-lg transition-all hover:opacity-80"
                    style={{
                      height: `${height}px`,
                      backgroundColor: getMoodColor(data.mood),
                      minHeight: "8px",
                    }}
                  />
                <span className="text-xs text-muted-foreground">
                  {new Date(data.date).getDate()}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Daily Insight (if available) */}
      {dailyInsight && (
        <Card className="p-6 bg-gradient-to-br from-[hsl(var(--wellness-primary)/0.05)] to-background border-0 shadow-sm">
          <h2 className="text-lg font-semibold mb-2">Today's Insight</h2>
          <p className="text-sm text-muted-foreground mb-2">
            {dailyInsight.insight_text}
          </p>
          {dailyInsight.recommendation && (
            <p className="text-xs text-muted-foreground">
              {dailyInsight.recommendation}
            </p>
          )}
        </Card>
      )}

      {/* Header with Period Selector */}
      <Card className="p-6 bg-gradient-to-br from-background to-[hsl(var(--wellness-primary)/0.05)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold mb-2">Your Progress</h2>
            <p className="text-muted-foreground">
              Track your mental wellness journey and celebrate your achievements
            </p>
          </div>
          <div className="flex rounded-lg border bg-background">
            {(["week", "month", "year"] as const).map((period) => (
              <Button
                key={period}
                variant={selectedPeriod === period ? "default" : "ghost"}
                size="sm"
                onClick={() => setSelectedPeriod(period)}
                className={cn(
                  "capitalize",
                  selectedPeriod === period &&
                    "bg-[hsl(var(--wellness-primary))] hover:bg-[hsl(var(--wellness-primary))]"
                )}
              >
                {period}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Average Mood */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Heart className="w-5 h-5 text-[hsl(var(--mood-good))]" />
              <h3 className="font-semibold">Average Mood</h3>
            </div>
            <div className="flex items-center space-x-1">
              {moodTrend > 0 ? (
                <TrendingUp className="w-4 h-4 text-[hsl(var(--mood-good))]" />
              ) : moodTrend < 0 ? (
                <TrendingDown className="w-4 h-4 text-[hsl(var(--mood-low))]" />
              ) : null}
            </div>
          </div>
          <div className="text-center">
            <div
              className="text-3xl font-bold mb-2"
              style={{ color: getMoodColor(averageMood) }}
            >
              {averageMood.toFixed(1)}/5
            </div>
            <p className="text-sm text-muted-foreground">
              {moodTrend > 0 ? "Improving" : moodTrend < 0 ? "Declining" : "Stable"} trend
            </p>
          </div>
        </Card>

        {/* Total Check-ins */}
        <Card className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Activity className="w-5 h-5 text-[hsl(var(--wellness-secondary))]" />
            <h3 className="font-semibold">Check-ins</h3>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold mb-2 text-[hsl(var(--wellness-secondary))]">
              {moodData.length}
            </div>
            <p className="text-sm text-muted-foreground">This {selectedPeriod}</p>
          </div>
        </Card>

        {/* Journal Entries */}
        <Card className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Brain className="w-5 h-5 text-[hsl(var(--wellness-secondary))]" />
            <h3 className="font-semibold">Journal Entries</h3>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold mb-2 text-[hsl(var(--wellness-secondary))]">
              {journalCount}
            </div>
            <p className="text-sm text-muted-foreground">Total entries</p>
          </div>
        </Card>
      </div>

      {/* Mood Chart */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Mood Trends</h3>
          <Button variant="outline" size="sm">
            <BarChart3 className="w-4 h-4 mr-2" />
            View Details
          </Button>
        </div>
        {renderMoodChart()}
        <div className="mt-4 flex items-center justify-center space-x-4 text-sm text-muted-foreground">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-[hsl(var(--mood-excellent))]" />
            <span>Excellent (5)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-[hsl(var(--mood-good))]" />
            <span>Good (4)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-[hsl(var(--mood-neutral))]" />
            <span>Neutral (3)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-[hsl(var(--mood-low))]" />
            <span>Low (2)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-[hsl(var(--mood-poor))]" />
            <span>Poor (1)</span>
          </div>
        </div>
      </Card>

      {/* Streaks */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Current Activity</h3>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              type: "Mood Check-ins",
              current: checkInStreak,
              icon: <Heart className="w-4 h-4" />,
              color: "hsl(var(--mood-good))",
            },
            {
              type: "Journal Entries",
              current: journalStreak,
              icon: <Brain className="w-4 h-4" />,
              color: "hsl(var(--wellness-secondary))",
            },
          ].map((streak) => (
            <div key={streak.type} className="p-4 rounded-lg bg-muted/30">
              <div className="flex items-center space-x-3 mb-3">
                <div
                  className="p-2 rounded-full text-white"
                  style={{ backgroundColor: streak.color }}
                >
                  {streak.icon}
                </div>
                <div>
                  <h4 className="font-medium text-sm">{streak.type}</h4>
                </div>
              </div>
              <div className="text-center">
                <div
                  className="text-2xl font-bold"
                  style={{ color: streak.color }}
                >
                  {streak.current}
                </div>
                <p className="text-xs text-muted-foreground">total</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
