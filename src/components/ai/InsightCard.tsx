/**
 * InsightCard Component - Display Wellness Insights
 * 
 * Shows personalized AI-generated wellness insights including:
 * - Daily tips
 * - Mood pattern analysis
 * - Crisis support resources
 * - Wellness recommendations
 * 
 * Features:
 * - Priority-based styling (urgent/high/normal/low)
 * - Read/dismiss actions
 * - Activity suggestions
 * - Icon indicators by insight type
 */

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Lightbulb, 
  TrendingUp, 
  AlertTriangle, 
  Heart,
  X,
  CheckCircle,
  Sparkles
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  markInsightRead,
  dismissInsight,
  type WellnessInsight 
} from '@/services/aiService';
import { cn } from '@/lib/utils';

/**
 * Props for InsightCard component
 */
interface InsightCardProps {
  insight: WellnessInsight;
  onUpdate?: () => void;  // Callback when insight is read/dismissed
  compact?: boolean;       // Show compact version (smaller)
}

export default function InsightCard({ insight, onUpdate, compact = false }: InsightCardProps) {
  // ==========================================
  // STATE MANAGEMENT
  // ==========================================
  
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const { toast } = useToast();

  // ==========================================
  // HELPER FUNCTIONS
  // ==========================================

  /**
   * Get icon component based on insight type
   * Visual indicator of what kind of insight this is
   */
  const getInsightIcon = () => {
    switch (insight.insight_type) {
      case 'daily_tip':
        return <Lightbulb className="h-5 w-5" />;
      case 'mood_pattern':
        return <TrendingUp className="h-5 w-5" />;
      case 'crisis_support':
        return <AlertTriangle className="h-5 w-5" />;
      case 'wellness_recommendation':
        return <Heart className="h-5 w-5" />;
      default:
        return <Sparkles className="h-5 w-5" />;
    }
  };

  /**
   * Get color scheme based on priority level
   * Higher priority = more attention-grabbing colors
   */
  const getPriorityColors = () => {
    switch (insight.priority) {
      case 'urgent':
        return {
          bg: 'bg-red-50 dark:bg-red-950/20',
          border: 'border-red-300 dark:border-red-800',
          icon: 'text-red-600 dark:text-red-400',
          badge: 'bg-red-500 text-white',
        };
      case 'high':
        return {
          bg: 'bg-orange-50 dark:bg-orange-950/20',
          border: 'border-orange-300 dark:border-orange-800',
          icon: 'text-orange-600 dark:text-orange-400',
          badge: 'bg-orange-500 text-white',
        };
      case 'normal':
        return {
          bg: 'bg-blue-50 dark:bg-blue-950/20',
          border: 'border-blue-300 dark:border-blue-800',
          icon: 'text-blue-600 dark:text-blue-400',
          badge: 'bg-blue-500 text-white',
        };
      case 'low':
        return {
          bg: 'bg-gray-50 dark:bg-gray-950/20',
          border: 'border-gray-300 dark:border-gray-800',
          icon: 'text-gray-600 dark:text-gray-400',
          badge: 'bg-gray-500 text-white',
        };
      default:
        return {
          bg: 'bg-background',
          border: 'border-border',
          icon: 'text-foreground',
          badge: 'bg-primary text-primary-foreground',
        };
    }
  };

  /**
   * Get human-readable label for insight type
   */
  const getInsightTypeLabel = () => {
    switch (insight.insight_type) {
      case 'daily_tip':
        return 'Daily Tip';
      case 'mood_pattern':
        return 'Mood Pattern';
      case 'crisis_support':
        return 'Crisis Support';
      case 'wellness_recommendation':
        return 'Wellness Recommendation';
      default:
        return 'Insight';
    }
  };

  // ==========================================
  // ACTION HANDLERS
  // ==========================================

  /**
   * Mark insight as read
   * Updates the backend and triggers callback for parent refresh
   */
  const handleMarkRead = async () => {
    // Don't re-read if already read
    if (insight.is_read) return;

    setIsLoading(true);
    try {
      await markInsightRead(insight._id);
      
      // Notify parent component to refresh insights list
      if (onUpdate) {
        onUpdate();
      }

      toast({
        title: 'Insight marked as read',
        duration: 2000,
      });
    } catch (error) {
      console.error('Failed to mark insight as read:', error);
      toast({
        title: 'Failed to mark as read',
        description: 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Dismiss insight
   * User doesn't want to see this insight anymore
   */
  const handleDismiss = async () => {
    setIsLoading(true);
    try {
      await dismissInsight(insight._id);
      
      // Hide the card with animation
      setIsVisible(false);
      
      // Notify parent after animation completes
      setTimeout(() => {
        if (onUpdate) {
          onUpdate();
        }
      }, 300);

      toast({
        title: 'Insight dismissed',
        duration: 2000,
      });
    } catch (error) {
      console.error('Failed to dismiss insight:', error);
      toast({
        title: 'Failed to dismiss',
        description: 'Please try again',
        variant: 'destructive',
      });
      setIsVisible(true); // Restore visibility on error
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================
  // RENDER
  // ==========================================

  const colors = getPriorityColors();

  // Don't render if dismissed and hidden
  if (!isVisible) {
    return null;
  }

  // ==========================================
  // COMPACT VERSION (For Dashboard/Sidebar)
  // ==========================================

  if (compact) {
    return (
      <Card 
        className={cn(
          'p-3 transition-all duration-300',
          colors.bg,
          colors.border,
          !insight.is_read && 'shadow-md'
        )}
      >
        <div className="flex items-start space-x-3">
          {/* Icon */}
          <div className={cn('mt-0.5', colors.icon)}>
            {getInsightIcon()}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium line-clamp-2">
              {insight.insight_text}
            </p>
            {!insight.is_read && (
              <Badge variant="secondary" className="mt-1 text-xs">
                New
              </Badge>
            )}
          </div>

          {/* Dismiss button */}
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 opacity-50 hover:opacity-100"
            onClick={handleDismiss}
            disabled={isLoading}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </Card>
    );
  }

  // ==========================================
  // FULL VERSION (For Insights Page)
  // ==========================================

  return (
    <Card 
      className={cn(
        'p-6 transition-all duration-300',
        colors.bg,
        colors.border,
        !insight.is_read && 'shadow-lg ring-2 ring-offset-2',
        !insight.is_read && colors.border.replace('border-', 'ring-')
      )}
    >
      {/* Header - Type, Priority, Status */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          {/* Icon */}
          <div className={cn(
            'p-2 rounded-full',
            colors.bg.replace('50', '100').replace('20', '30')
          )}>
            <div className={colors.icon}>
              {getInsightIcon()}
            </div>
          </div>

          {/* Type and Priority */}
          <div>
            <h4 className="font-semibold">{getInsightTypeLabel()}</h4>
            <div className="flex items-center space-x-2 mt-1">
              <Badge className={colors.badge} variant="secondary">
                {insight.priority.toUpperCase()}
              </Badge>
              {!insight.is_read && (
                <Badge variant="outline" className="text-xs">
                  Unread
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          {!insight.is_read && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkRead}
              disabled={isLoading}
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Mark Read
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDismiss}
            disabled={isLoading}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Main Insight Text */}
      <div className="mb-4">
        <p className="text-base leading-relaxed">
          {insight.insight_text}
        </p>
      </div>

      {/* Recommendation (if available) */}
      {insight.recommendation && (
        <div className="mb-4 p-3 rounded-lg bg-muted/50">
          <p className="text-sm font-medium mb-1">💡 Recommendation:</p>
          <p className="text-sm text-muted-foreground">
            {insight.recommendation}
          </p>
        </div>
      )}

      {/* Activity Suggestion (if available) */}
      {insight.activity_suggestion && (
        <div className="mb-4 p-3 rounded-lg bg-primary/10">
          <p className="text-sm font-medium mb-1">🎯 Try This:</p>
          <p className="text-sm">
            {insight.activity_suggestion}
          </p>
        </div>
      )}

      {/* Metadata Footer */}
      <div className="flex items-center justify-between pt-3 border-t">
        <div className="text-xs text-muted-foreground">
          {new Date(insight.created_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
          {insight.based_on_sentiment && (
            <span className="ml-2">
              • Based on {insight.based_on_sentiment} mood
            </span>
          )}
          {insight.based_on_pattern && (
            <span className="ml-2">
              • Pattern: {insight.based_on_pattern}
            </span>
          )}
        </div>
      </div>
    </Card>
  );
}
