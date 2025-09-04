import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Target,
  Award,
  BarChart3,
  Heart,
  Brain,
  Moon,
  Activity,
  Flame,
  ChevronRight
} from "lucide-react";

interface MoodData {
  date: string;
  mood: number;
  note?: string;
}

interface Streak {
  type: string;
  current: number;
  best: number;
  icon: React.ReactNode;
  color: string;
}

interface Goal {
  id: string;
  title: string;
  description: string;
  progress: number;
  target: number;
  unit: string;
  category: 'mood' | 'journal' | 'meditation' | 'wellness';
}

// Mock data - in real app this would come from Supabase
const mockMoodData: MoodData[] = [
  { date: '2024-01-01', mood: 3 },
  { date: '2024-01-02', mood: 4 },
  { date: '2024-01-03', mood: 2 },
  { date: '2024-01-04', mood: 4 },
  { date: '2024-01-05', mood: 5 },
  { date: '2024-01-06', mood: 4 },
  { date: '2024-01-07', mood: 3 },
];

const streaks: Streak[] = [
  {
    type: "Daily Check-ins",
    current: 7,
    best: 12,
    icon: <Heart className="w-4 h-4" />,
    color: "hsl(var(--mood-good))"
  },
  {
    type: "Journal Entries",
    current: 3,
    best: 8,
    icon: <Brain className="w-4 h-4" />,
    color: "hsl(var(--wellness-secondary))"
  },
  {
    type: "Meditation Sessions",
    current: 5,
    best: 10,
    icon: <Moon className="w-4 h-4" />,
    color: "hsl(var(--wellness-primary))"
  }
];

const goals: Goal[] = [
  {
    id: "mood-tracking",
    title: "Daily Mood Tracking",
    description: "Track your mood for 30 consecutive days",
    progress: 7,
    target: 30,
    unit: "days",
    category: "mood"
  },
  {
    id: "journal-entries",
    title: "Weekly Journaling",
    description: "Write 3 journal entries per week",
    progress: 2,
    target: 3,
    unit: "entries",
    category: "journal"
  },
  {
    id: "meditation-minutes",
    title: "Meditation Practice",
    description: "Meditate for 100 minutes this month",
    progress: 45,
    target: 100,
    unit: "minutes",
    category: "meditation"
  }
];

export default function ProgressDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('week');
  
  // Calculate mood statistics
  const averageMood = mockMoodData.reduce((sum, data) => sum + data.mood, 0) / mockMoodData.length;
  const moodTrend = mockMoodData.length >= 2 
    ? mockMoodData[mockMoodData.length - 1].mood - mockMoodData[0].mood 
    : 0;

  const getMoodColor = (mood: number) => {
    if (mood >= 4.5) return 'hsl(var(--mood-excellent))';
    if (mood >= 3.5) return 'hsl(var(--mood-good))';
    if (mood >= 2.5) return 'hsl(var(--mood-neutral))';
    if (mood >= 1.5) return 'hsl(var(--mood-low))';
    return 'hsl(var(--mood-poor))';
  };

  const getCategoryColor = (category: Goal['category']) => {
    switch (category) {
      case 'mood': return 'hsl(var(--mood-good))';
      case 'journal': return 'hsl(var(--wellness-secondary))';
      case 'meditation': return 'hsl(var(--wellness-primary))';
      case 'wellness': return 'hsl(var(--wellness-accent))';
      default: return 'hsl(var(--wellness-primary))';
    }
  };

  const renderMoodChart = () => {
    const maxMood = 5;
    const chartHeight = 120;
    
    return (
      <div className="relative h-32 bg-muted/20 rounded-lg p-4">
        <div className="flex items-end justify-between h-full">
          {mockMoodData.map((data, index) => {
            const height = (data.mood / maxMood) * chartHeight;
            return (
              <div key={index} className="flex flex-col items-center space-y-2">
                <div 
                  className="w-6 rounded-t-lg transition-all hover:opacity-80"
                  style={{ 
                    height: `${height}px`,
                    backgroundColor: getMoodColor(data.mood),
                    minHeight: '8px'
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
            {(['week', 'month', 'year'] as const).map((period) => (
              <Button
                key={period}
                variant={selectedPeriod === period ? "default" : "ghost"}
                size="sm"
                onClick={() => setSelectedPeriod(period)}
                className={cn(
                  "capitalize",
                  selectedPeriod === period && "bg-[hsl(var(--wellness-primary))] hover:bg-[hsl(var(--wellness-primary))]"
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
              {moodTrend > 0 ? 'Improving' : moodTrend < 0 ? 'Declining' : 'Stable'} trend
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
              {mockMoodData.length}
            </div>
            <p className="text-sm text-muted-foreground">
              This {selectedPeriod}
            </p>
          </div>
        </Card>

        {/* Wellness Score */}
        <Card className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Award className="w-5 h-5 text-[hsl(var(--wellness-accent))]" />
            <h3 className="font-semibold">Wellness Score</h3>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold mb-2 text-[hsl(var(--wellness-accent))]">
              78
            </div>
            <p className="text-sm text-muted-foreground">
              +5 from last week
            </p>
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
        <h3 className="text-lg font-semibold mb-4">Current Streaks</h3>
        <div className="grid gap-4 md:grid-cols-3">
          {streaks.map((streak, index) => (
            <div key={index} className="p-4 rounded-lg bg-muted/30">
              <div className="flex items-center space-x-3 mb-3">
                <div 
                  className="p-2 rounded-full text-white"
                  style={{ backgroundColor: streak.color }}
                >
                  {streak.icon}
                </div>
                <div>
                  <h4 className="font-medium text-sm">{streak.type}</h4>
                  <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                    <Flame className="w-3 h-3" />
                    <span>Best: {streak.best} days</span>
                  </div>
                </div>
              </div>
              <div className="text-center">
                <div 
                  className="text-2xl font-bold"
                  style={{ color: streak.color }}
                >
                  {streak.current}
                </div>
                <p className="text-xs text-muted-foreground">days</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Goals */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Goals & Milestones</h3>
          <Button variant="outline" size="sm">
            <Target className="w-4 h-4 mr-2" />
            Set New Goal
          </Button>
        </div>
        <div className="space-y-4">
          {goals.map((goal) => {
            const progressPercentage = (goal.progress / goal.target) * 100;
            return (
              <div key={goal.id} className="p-4 rounded-lg border hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-medium">{goal.title}</h4>
                      <Badge 
                        variant="outline" 
                        style={{ 
                          borderColor: getCategoryColor(goal.category),
                          color: getCategoryColor(goal.category)
                        }}
                      >
                        {goal.category}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{goal.description}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>{goal.progress} / {goal.target} {goal.unit}</span>
                    <span className="font-medium">{Math.round(progressPercentage)}%</span>
                  </div>
                  <Progress 
                    value={progressPercentage} 
                    className="h-2"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Achievements */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Achievements</h3>
        <div className="space-y-3">
          {[
            { title: "First Week Complete!", description: "Completed 7 days of mood tracking", date: "2 days ago", icon: <Award className="w-4 h-4" /> },
            { title: "Meditation Master", description: "Completed your first 10-minute meditation", date: "5 days ago", icon: <Brain className="w-4 h-4" /> },
            { title: "Streak Starter", description: "Started your first 3-day streak", date: "1 week ago", icon: <Flame className="w-4 h-4" /> }
          ].map((achievement, index) => (
            <div key={index} className="flex items-center space-x-4 p-3 rounded-lg bg-gradient-to-r from-[hsl(var(--wellness-primary)/0.05)] to-[hsl(var(--wellness-secondary)/0.05)]">
              <div className="p-2 rounded-full bg-[hsl(var(--wellness-primary))] text-white">
                {achievement.icon}
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-sm">{achievement.title}</h4>
                <p className="text-xs text-muted-foreground">{achievement.description}</p>
              </div>
              <div className="text-xs text-muted-foreground">
                {achievement.date}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}