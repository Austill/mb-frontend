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
  EyeOff
} from "lucide-react"; 
import { JournalEntry } from "@/types";
import { getJournalEntries, createJournalEntry } from "@/services/journalService";

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
    } catch (error) {
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
      await createJournalEntry(currentEntry);
      toast({
        title: "Success",
        description: "Journal entry saved successfully!",
      });
      setCurrentEntry({ title: "", content: "", isPrivate: false });
      setIsWriting(false);
      fetchEntries(); // Refetch entries to show the new one
    } catch (error) {
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

  if (isWriting) {
    return (
      <div className="space-y-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">New Journal Entry</h2>
            <Button
              variant="outline"
              onClick={() => setIsWriting(false)}
            >
              Back to Journal
            </Button>
          </div>

          <div className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium mb-2">Title</label>
              <Input
                placeholder="Give your entry a title..."
                value={currentEntry.title}
                onChange={(e) => setCurrentEntry(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium mb-2">Your thoughts</label>
              <Textarea
                placeholder="Write about your day, feelings, thoughts, or anything on your mind..."
                value={currentEntry.content}
                onChange={(e) => setCurrentEntry(prev => ({ ...prev, content: e.target.value }))}
                className="min-h-[300px] resize-none"
              />
            </div>

            {/* Privacy Toggle */}
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentEntry(prev => ({ ...prev, isPrivate: !prev.isPrivate }))}
                className={cn(
                  "flex items-center space-x-2",
                  currentEntry.isPrivate && "bg-[hsl(var(--wellness-calm))] text-white"
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
              className="w-full bg-[hsl(var(--wellness-primary))] hover:bg-[hsl(var(--wellness-primary))/90] text-white"
              size="lg"
              disabled={isSaving}
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? "Saving..." : "Save Entry"}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6 bg-gradient-to-br from-background to-[hsl(var(--wellness-secondary)/0.05)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold mb-2">Personal Journal</h2>
            <p className="text-muted-foreground">
              Reflect on your thoughts and track your mental wellness journey
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowAIInsights(!showAIInsights)}
              className="flex items-center space-x-2"
            >
              {showAIInsights ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span>AI Insights</span>
            </Button>
            <Button
              onClick={() => setIsWriting(true)}
              className="bg-[hsl(var(--wellness-primary))] hover:bg-[hsl(var(--wellness-primary))/90] text-white"
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
              className="pl-10"
            />
          </div>
        </div>
      </Card>

      {isLoading && <p>Loading entries...</p>}

      {/* Journal Entries */}
      {!isLoading && (
        <div className="space-y-4">
          {filteredEntries.map((entry) => (
            <Card key={entry.id} className="p-6 hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row items-start justify-between mb-3 gap-2">
                <div className="flex items-center space-x-3">
                  <h3 className="text-lg font-semibold">{entry.title}</h3>
                  {entry.isPrivate && (
                    <Badge variant="secondary" className="flex items-center space-x-1">
                      <Lock className="w-3 h-3" />
                      <span>Private</span>
                    </Badge>
                  )}
                  {entry.sentiment && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: getSentimentColor(entry.sentiment) }}
                          />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Sentiment: {entry.sentiment}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground shrink-0">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(entry.date).toLocaleDateString()}</span>
                </div>
              </div>

              <p className="text-muted-foreground mb-4 line-clamp-3">
                {entry.content}
              </p>

              {entry.tags && entry.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {entry.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              {showAIInsights && entry.aiInsights && (
                <Alert className="mt-4 bg-gradient-to-r from-[hsl(var(--wellness-primary)/0.05)] to-[hsl(var(--wellness-secondary)/0.05)] border-[hsl(var(--wellness-primary)/0.2)]">
                  <Brain className="h-4 w-4" />
                  <AlertDescription className="flex items-start space-x-2">
                    <Sparkles className="w-4 h-4 mt-0.5 text-[hsl(var(--wellness-primary))]" />
                    <span>{entry.aiInsights}</span>
                  </AlertDescription>
                </Alert>
              )}
            </Card>
          ))}
        </div>
      )}

        {filteredEntries.length === 0 && (
          <Card className="p-12 text-center">
            <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No entries found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm ? "Try adjusting your search terms" : "Start your journaling journey by writing your first entry"}
            </p>
            <Button 
              onClick={() => setIsWriting(true)}
              className="bg-[hsl(var(--wellness-primary))] hover:bg-[hsl(var(--wellness-primary))/90] text-white"
            >
              Write Your First Entry
            </Button>
          </Card>
        )}
    </div>
  );
}