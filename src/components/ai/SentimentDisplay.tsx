/**
 * SentimentDisplay Component - Show Sentiment Analysis Results
 * 
 * Displays the emotional analysis of journal entries or text:
 * - Overall sentiment label (positive/negative/neutral)
 * - Sentiment confidence scores
 * - Detected emotions
 * - Crisis warnings if applicable
 * 
 * Features:
 * - Visual sentiment indicators with colors
 * - Score bars showing confidence levels
 * - Emotion tags
 * - Crisis flag alerts
 */

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Smile, 
  Frown, 
  Meh, 
  AlertTriangle,
  Heart,
  TrendingUp
} from 'lucide-react';
import { type SentimentResult } from '@/services/aiService';
import { cn } from '@/lib/utils';

/**
 * Props for SentimentDisplay component
 */
interface SentimentDisplayProps {
  sentiment: SentimentResult;
  showDetails?: boolean;  // Show detailed scores and emotions
  compact?: boolean;      // Compact version for inline display
}

export default function SentimentDisplay({ 
  sentiment, 
  showDetails = true,
  compact = false 
}: SentimentDisplayProps) {
  
  // ==========================================
  // HELPER FUNCTIONS
  // ==========================================

  /**
   * Get icon and styling based on sentiment label
   * Returns the appropriate emoji icon and color scheme
   */
  const getSentimentDisplay = () => {
    switch (sentiment.sentiment_label) {
      case 'positive':
        return {
          icon: <Smile className="h-6 w-6" />,
          label: 'Positive',
          color: 'text-green-600 dark:text-green-400',
          bgColor: 'bg-green-50 dark:bg-green-950/20',
          borderColor: 'border-green-300 dark:border-green-800',
          emoji: '😊',
        };
      case 'negative':
        return {
          icon: <Frown className="h-6 w-6" />,
          label: 'Negative',
          color: 'text-red-600 dark:text-red-400',
          bgColor: 'bg-red-50 dark:bg-red-950/20',
          borderColor: 'border-red-300 dark:border-red-800',
          emoji: '😔',
        };
      case 'neutral':
        return {
          icon: <Meh className="h-6 w-6" />,
          label: 'Neutral',
          color: 'text-gray-600 dark:text-gray-400',
          bgColor: 'bg-gray-50 dark:bg-gray-950/20',
          borderColor: 'border-gray-300 dark:border-gray-800',
          emoji: '😐',
        };
      default:
        return {
          icon: <Meh className="h-6 w-6" />,
          label: 'Unknown',
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-300',
          emoji: '❓',
        };
    }
  };

  /**
   * Convert sentiment score (0-1) to percentage
   * Formats to 2 decimal places
   */
  const scoreToPercentage = (score: number): string => {
    return (score * 100).toFixed(1) + '%';
  };

  /**
   * Get color for emotion badge based on detected emotion
   * Provides visual variety for different emotions
   */
  const getEmotionColor = (emotion: string): string => {
    const lowerEmotion = emotion.toLowerCase();
    
    // Positive emotions
    if (['happy', 'joy', 'excited', 'love', 'grateful'].includes(lowerEmotion)) {
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200';
    }
    
    // Negative emotions
    if (['sad', 'angry', 'fear', 'anxious', 'worried', 'stressed'].includes(lowerEmotion)) {
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200';
    }
    
    // Neutral/calm emotions
    if (['calm', 'neutral', 'peaceful', 'relaxed'].includes(lowerEmotion)) {
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200';
    }
    
    // Default
    return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-200';
  };

  const display = getSentimentDisplay();

  // ==========================================
  // COMPACT VERSION (Inline Display)
  // ==========================================

  if (compact) {
    return (
      <div className="flex items-center space-x-2">
        {/* Sentiment emoji */}
        <span className="text-2xl">{display.emoji}</span>
        
        {/* Sentiment label */}
        <span className={cn('font-medium', display.color)}>
          {display.label}
        </span>
        
        {/* Crisis warning (if applicable) */}
        {sentiment.crisis_flag && (
          <Badge variant="destructive" className="ml-2">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Crisis Detected
          </Badge>
        )}
      </div>
    );
  }

  // ==========================================
  // FULL VERSION (Detailed Display)
  // ==========================================

  return (
    <Card className={cn(
      'p-4',
      display.bgColor,
      'border-2',
      display.borderColor
    )}>
      {/* Header - Overall Sentiment */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          {/* Icon */}
          <div className={cn(
            'p-2 rounded-full',
            display.bgColor.replace('50', '100').replace('20', '30')
          )}>
            <div className={display.color}>
              {display.icon}
            </div>
          </div>

          {/* Label and emoji */}
          <div>
            <h4 className="font-semibold text-lg">
              {display.label} Sentiment
            </h4>
            <p className="text-sm text-muted-foreground">
              Emotional Analysis
            </p>
          </div>
        </div>

        {/* Large emoji */}
        <span className="text-4xl">{display.emoji}</span>
      </div>

      {/* Crisis Warning (if applicable) */}
      {sentiment.crisis_flag && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-800 rounded-lg">
          <div className="flex items-start space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-red-900 dark:text-red-100">
                Crisis Keywords Detected
              </p>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                If you're in crisis, please reach out:
              </p>
              <p className="text-sm font-medium mt-1">
                📞 National Suicide Prevention Lifeline: 988
              </p>
              {sentiment.crisis_keywords && sentiment.crisis_keywords.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {sentiment.crisis_keywords.map((keyword, index) => (
                    <Badge 
                      key={index} 
                      variant="destructive" 
                      className="text-xs"
                    >
                      {keyword}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Detailed Scores (if showDetails is true) */}
      {showDetails && (
        <div className="space-y-3 mb-4">
          <p className="text-sm font-medium text-muted-foreground mb-2">
            Sentiment Confidence Levels:
          </p>

          {/* Positive Score */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-green-600 dark:text-green-400">
                😊 Positive
              </span>
              <span className="text-sm text-muted-foreground">
                {scoreToPercentage(sentiment.sentiment_scores.positive)}
              </span>
            </div>
            <Progress 
              value={sentiment.sentiment_scores.positive * 100} 
              className="h-2 [&>div]:bg-green-500"
            />
          </div>

          {/* Neutral Score */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                😐 Neutral
              </span>
              <span className="text-sm text-muted-foreground">
                {scoreToPercentage(sentiment.sentiment_scores.neutral)}
              </span>
            </div>
            <Progress 
              value={sentiment.sentiment_scores.neutral * 100} 
              className="h-2 [&>div]:bg-gray-500"
            />
          </div>

          {/* Negative Score */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-red-600 dark:text-red-400">
                😔 Negative
              </span>
              <span className="text-sm text-muted-foreground">
                {scoreToPercentage(sentiment.sentiment_scores.negative)}
              </span>
            </div>
            <Progress 
              value={sentiment.sentiment_scores.negative * 100} 
              className="h-2 [&>div]:bg-red-500"
            />
          </div>
        </div>
      )}

      {/* Detected Emotions */}
      {sentiment.detected_emotions && sentiment.detected_emotions.length > 0 && (
        <div className="pt-3 border-t">
          <p className="text-sm font-medium mb-2 flex items-center">
            <Heart className="h-4 w-4 mr-1" />
            Detected Emotions:
          </p>
          <div className="flex flex-wrap gap-2">
            {sentiment.detected_emotions.map((emotion, index) => (
              <Badge 
                key={index}
                variant="secondary"
                className={cn('text-xs', getEmotionColor(emotion))}
              >
                {emotion}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Analysis Timestamp */}
      <div className="mt-4 pt-3 border-t">
        <p className="text-xs text-muted-foreground flex items-center">
          <TrendingUp className="h-3 w-3 mr-1" />
          Analyzed on {new Date(sentiment.created_at).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>
    </Card>
  );
}
