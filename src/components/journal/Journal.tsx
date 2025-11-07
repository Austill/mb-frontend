
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import {
  Save,
  Lock,
  Unlock,
  Search,
  Calendar,
  BookOpen,
  Brain,
  Sparkles,
  Eye,
  EyeOff,
  Loader2
} from "lucide-react";
import { JournalEntry } from "@/types";
import { getJournalEntries, createJournalEntry } from "@/services/journalService";
import { analyzeSentiment, analyzeJournalEntry } from "@/services/aiService";
import SentimentDisplay from "@/components/ai/SentimentDisplay";

export default function Journal() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [currentEntry, setCurrentEntry] = useState({
    title: "",
    content: "",
    isPrivate: false
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [isWriting, setIsWriting] = useState(false);
  const [showAIInsights, setShowAIInsights] = useState(true);
  const [sentiment, setSentiment] = useState<any>(null);
  const [aiInsights, setAiInsights] = useState<{ [key: string]: string }>({});
  const [analyzingEntries, setAnalyzingEntries] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  useEffect(() => {
    fetchEntries();
  }, []);

  const filteredEntries = entries.filter(entry =>
    entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const fetchEntries = async () => {
    setIsLoading(true);
    try {
      const fetchedEntries = await getJournalEntries();
      setEntries(fetchedEntries);
      setSearchTerm(""); // Reset search when fetching new entries
    } catch (error) {
      console.error("Error fetching journal entries:", error);
      toast({
        title: "Error",
        description: "Could not fetch journal entries.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveEntry = async () => {
    if (!currentEntry.title.trim() || !currentEntry.content.trim()) {
      toast({
        title: "Incomplete Entry",
        description: "Please fill in both title and content.",
        variant: "destructive",
      });
      return;
    }
    setIsSaving(true);
    try {
      const savedEntry = await createJournalEntry(currentEntry);

      // Show success toast only after successful save
      toast({
        title: "Success",
        description: "Journal entry saved successfully!",
      });

      setCurrentEntry({ title: "", content: "", isPrivate: false });
      setIsWriting(false);
      fetchEntries(); // Refetch entries to show the new one
    } catch (error) {
      console.error("Error saving journal entry:", error);
      toast({
        title: "Error",
        description: "Could not save journal entry.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getSentimentColor = (sentiment?: string) => {
    switch (sentiment) {
      case 'positive': return 'hsl(var(--mood-good))';
      case 'negative': return 'hsl(var(--mood-low))';
      default: return 'hsl(var(--mood-neutral))';
    }
  };

  const analyzeEntry = async (entry: JournalEntry) => {
    if (analyzingEntries.has(entry.id)) return;

    setAnalyzingEntries(prev => new Set(prev).add(entry.id));

    try {
      const result = await analyzeJournalEntry(entry.content);
      setAiInsights(prev => ({
        ...prev,
        [entry.id]: result.insight
      }));
      toast({
        title: "AI Insight Generated",
        description: "Your journal entry has been analyzed.",
      });
    } catch (error) {
      console.error("AI analysis error:", error);
      toast({
        title: "Analysis Failed",
        description: "Could not generate AI insight. Please try again.",
        variant: "destructive",
      });
    } finally {
      setAnalyzingEntries(prev => {
        const newSet = new Set(prev);
        newSet.delete(entry.id);
        return newSet;
      });
    }
  };

  if (isWriting) {
    return (
      <div className="space-y-6 bg-gradient-to-br from-[hsl(var(--wellness-calm)/0.1)] to-[hsl(var(--wellness-secondary)/0.1)] min-h-screen p-4 rounded-lg">
        <Card className="p-6 bg-gradient-to-br from-background via-[hsl(var(--wellness-primary)/0.02)] to-[hsl(var(--wellness-secondary)/0.05)] shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl border-0">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-[hsl(var(--wellness-primary))] to-[hsl(var(--wellness-secondary))] bg-clip-text text-transparent">New Journal Entry</h2>
            <Button
              variant="outline"
              onClick={() => setIsWriting(false)}
              className="hover:bg-[hsl(var(--wellness-primary)/0.1)] transition-colors duration-200"
            >
              Back to Journal
            </Button>
          </div>

          <div className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium mb-2 text-[hsl(var(--wellness-primary))]">
                Title
              </label>
              <Input
                placeholder="Give your entry a title..."
                value={currentEntry.title}
                onChange={(e) => setCurrentEntry(prev => ({ ...prev, title: e.target.value }))}
                className="border-2 border-[hsl(var(--wellness-primary)/0.2)] focus:border-[hsl(var(--wellness-primary))] transition-colors duration-200 rounded-lg"
              />
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium mb-2 text-[hsl(var(--wellness-primary))]">
                Your thoughts
              </label>
              <Textarea
                placeholder="Write about your day, feelings, thoughts, or anything on your mind..."
                value={currentEntry.content}
                onChange={(e) => setCurrentEntry(prev => ({ ...prev, content: e.target.value }))}
                className="min-h-[300px] resize-none rounded-lg border-2 border-[hsl(var(--wellness-primary)/0.2)] focus:border-[hsl(var(--wellness-primary))] transition-colors duration-200"
              />
            </div>

            {/* Privacy Toggle */}
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentEntry(prev => ({ ...prev, isPrivate: !prev.isPrivate }))}
                className={cn(
                  "flex items-center space-x-2 rounded-full px-4 py-2 transition-all duration-300 hover:scale-105",
                  currentEntry.isPrivate && "bg-gradient-to-r from-[hsl(var(--wellness-calm))] to-[hsl(var(--wellness-primary))] text-white shadow-lg"
                )}
              >
                {currentEntry.isPrivate ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                <span>{currentEntry.isPrivate ? "Private Entry" : "Regular Entry"}</span>
              </Button>
              <span className="text-sm text-muted-foreground">
                {currentEntry.isPrivate ? "Encrypted and visible only to you" : "Regular journal entry"}
              </span>
            </div>

            {/* Save Button */}
            <Button
              onClick={handleSaveEntry}
              className="w-full bg-gradient-to-r from-[hsl(var(--wellness-primary))] to-[hsl(var(--wellness-secondary))] hover:from-[hsl(var(--wellness-primary)/0.9)] hover:to-[hsl(var(--wellness-secondary)/0.9)] text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-lg"
              size="lg"
              disabled={isSaving}
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? "Saving..." : "Save Entry"}
            </Button>
          </div>
        </Card>

        {/* Sentiment Display */}
        {sentiment && (
          <SentimentDisplay sentiment={sentiment} compact={true} />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-gradient-to-br from-[hsl(var(--wellness-calm)/0.1)] to-[hsl(var(--wellness-secondary)/0.1)] min-h-screen p-4 rounded-lg">
      {/* Header */}
      <Card className="p-6 bg-gradient-to-br from-background via-[hsl(var(--wellness-primary)/0.02)] to-[hsl(var(--wellness-secondary)/0.05)] shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl border-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-[hsl(var(--wellness-primary))] to-[hsl(var(--wellness-secondary))] bg-clip-text text-transparent">Personal Journal</h2>
            <p className="text-muted-foreground">
              Reflect on your thoughts and track your mental wellness journey
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowAIInsights(!showAIInsights)}
              className="flex items-center space-x-2 hover:bg-[hsl(var(--wellness-primary)/0.1)] transition-colors duration-200 rounded-lg"
            >
              {showAIInsights ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span>AI Insights</span>
            </Button>
            <Button
              onClick={() => setIsWriting(true)}
              className="bg-gradient-to-r from-[hsl(var(--wellness-primary))] to-[hsl(var(--wellness-secondary))] hover:from-[hsl(var(--wellness-primary)/0.9)] hover:to-[hsl(var(--wellness-secondary)/0.9)] text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-lg"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              New Entry
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="mt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search your journal entries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 rounded-lg border-2 border-[hsl(var(--wellness-primary)/0.2)] focus:border-[hsl(var(--wellness-primary))] transition-colors duration-200"
            />
          </div>
        </div>
      </Card>

      {isLoading && <p>Loading entries...</p>}

      {/* Journal Entries */}
      {!isLoading && (
        <div className="space-y-4">
          {filteredEntries.map((entry, index) => (
            <Card
              key={entry.id}
              className="p-6 bg-gradient-to-br from-background via-[hsl(var(--wellness-primary)/0.01)] to-[hsl(var(--wellness-secondary)/0.02)] shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl border-0 hover:scale-[1.02]"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex flex-col sm:flex-row items-start justify-between mb-3 gap-2">
                <div className="flex items-center space-x-3">
                  <h3 className="text-lg font-semibold text-[hsl(var(--wellness-primary))]">{entry.title}</h3>
                  {entry.isPrivate && (
                    <Badge variant="secondary" className="flex items-center space-x-1 bg-gradient-to-r from-[hsl(var(--wellness-calm)/0.2)] to-[hsl(var(--wellness-primary)/0.2)] text-[hsl(var(--wellness-primary))] border-0 rounded-full px-3 py-1">
                      <Lock className="w-3 h-3" />
                      <span>Private</span>
                    </Badge>
                  )}
                  {/* Sentiment indicator will be added when backend supports it */}
                </div>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground shrink-0 bg-[hsl(var(--wellness-secondary)/0.1)] px-3 py-1 rounded-full">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(entry.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}</span>
                </div>
              </div>

              <p className="text-muted-foreground mb-4 line-clamp-3 leading-relaxed">
                {entry.content}
              </p>

              {/* AI Insights */}
              {showAIInsights && (
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => analyzeEntry(entry)}
                    disabled={analyzingEntries.has(entry.id)}
                    className="flex items-center space-x-2 bg-gradient-to-r from-[hsl(var(--wellness-secondary)/0.1)] to-[hsl(var(--wellness-primary)/0.1)] border-[hsl(var(--wellness-primary)/0.3)] hover:bg-[hsl(var(--wellness-primary)/0.1)] rounded-full px-4 py-2 transition-all duration-300 hover:scale-105"
                  >
                    {analyzingEntries.has(entry.id) ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Brain className="w-4 h-4" />
                    )}
                    <span>{analyzingEntries.has(entry.id) ? "Analyzing..." : "Get AI Insight"}</span>
                  </Button>

                  {aiInsights[entry.id] && (
                    <Card className="p-4 bg-gradient-to-br from-[hsl(var(--wellness-calm)/0.1)] to-[hsl(var(--wellness-secondary)/0.1)] border-[hsl(var(--wellness-primary)/0.2)] animate-in fade-in-0 slide-in-from-bottom-2 duration-500 rounded-lg shadow-sm">
                      <div className="flex items-start space-x-3">
                        <Sparkles className="w-5 h-5 text-[hsl(var(--wellness-primary))] mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-sm mb-2 text-[hsl(var(--wellness-primary))]">
                            AI Insight
                          </h4>
                          <p className="text-sm leading-relaxed text-muted-foreground">
                            {aiInsights[entry.id]}
                          </p>
                        </div>
                      </div>
                    </Card>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

        {filteredEntries.length === 0 && (
          <Card className="p-12 text-center bg-gradient-to-br from-background via-[hsl(var(--wellness-primary)/0.01)] to-[hsl(var(--wellness-secondary)/0.02)] shadow-lg rounded-xl border-0">
            <div className="text-6xl mb-4 opacity-50">📝</div>
            <h3 className="text-lg font-semibold mb-2 bg-gradient-to-r from-[hsl(var(--wellness-primary))] to-[hsl(var(--wellness-secondary))] bg-clip-text text-transparent">No entries found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm ? "Try adjusting your search terms" : "Start your journaling journey by writing your first entry"}
            </p>
            <Button
              onClick={() => setIsWriting(true)}
              className="bg-gradient-to-r from-[hsl(var(--wellness-primary))] to-[hsl(var(--wellness-secondary))] hover:from-[hsl(var(--wellness-primary)/0.9)] hover:to-[hsl(var(--wellness-secondary)/0.9)] text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-lg"
            >
              Write Your First Entry
            </Button>
          </Card>
        )}
    </div>
  );
}
