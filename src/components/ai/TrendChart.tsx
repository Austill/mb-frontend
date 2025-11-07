/**
 * TrendChart Component - Mood Trend Visualization
 * 
 * Displays sentiment trends over time using a line chart
 * Shows how user's mood has been changing across days
 * 
 * Features:
 * - 7-day, 30-day, 90-day views
 * - Trend indicators (improving/declining/stable)
 * - Color-coded sentiment levels
 * - Insights about patterns
 */

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { TrendingUp, TrendingDown, Minus, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  getSentimentTrends,
  type SentimentTrendAnalysis 
} from '@/services/aiService';

/**
 * Period options for trend analysis
 */
type Period = 7 | 30 | 90;

export default function TrendChart() {
  // ==========================================
  // STATE MANAGEMENT
  // ==========================================
  
  const [period, setPeriod] = useState<Period>(30);
  const [trendData, setTrendData] = useState<SentimentTrendAnalysis | null>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // ==========================================
  // EFFECTS
  // ==========================================

  /**
   * Load trend data when period changes
   */
  useEffect(() => {
    loadTrendData();
  }, [period]);

  // ==========================================
  // DATA LOADING
  // ==========================================

  /**
   * Fetch sentiment trends from API
   */
  const loadTrendData = async () => {
    setIsLoading(true);
    try {
      const data = await getSentimentTrends(period);
      setTrendData(data.trend_analysis);
      
      // Transform data for chart
      // This is placeholder - actual implementation would parse sentiment_distribution
      const mockChartData = generateMockChartData(period);
      setChartData(mockChartData);
      
    } catch (error) {
      console.error('Failed to load trend data:', error);
      toast({
        title: 'Failed to load trends',
        description: 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Generate mock chart data for visualization
   * In production, this would come from the API
   */
  const generateMockChartData = (days: number) => {
    const data = [];
    const today = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        positive: Math.random() * 0.5 + 0.3,
        neutral: Math.random() * 0.3 + 0.2,
        negative: Math.random() * 0.4,
      });
    }
    
    return data;
  };

  // ==========================================
  // RENDER HELPERS
  // ==========================================

  /**
   * Get trend icon and color
   */
  const getTrendDisplay = () => {
    if (!trendData) return null;
    
    switch (trendData.overall_trend) {
      case 'improving':
        return {
          icon: <TrendingUp className="h-5 w-5" />,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          label: 'Improving',
        };
      case 'declining':
        return {
          icon: <TrendingDown className="h-5 w-5" />,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          label: 'Needs Attention',
        };
      case 'stable':
        return {
          icon: <Minus className="h-5 w-5" />,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          label: 'Stable',
        };
      default:
        return {
          icon: <Minus className="h-5 w-5" />,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          label: 'Fluctuating',
        };
    }
  };

  // ==========================================
  // RENDER
  // ==========================================

  const trendDisplay = getTrendDisplay();

  return (
    <Card className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold">Mood Trends</h3>
          <p className="text-sm text-muted-foreground">
            Your emotional patterns over time
          </p>
        </div>

        {/* Period Selector */}
        <div className="flex space-x-2">
          {[7, 30, 90].map((days) => (
            <Button
              key={days}
              variant={period === days ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPeriod(days as Period)}
            >
              {days}d
            </Button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <>
          {/* Trend Summary */}
          {trendData && trendDisplay && (
            <div className={`p-4 rounded-lg ${trendDisplay.bgColor} mb-4`}>
              <div className="flex items-center space-x-3">
                <div className={trendDisplay.color}>
                  {trendDisplay.icon}
                </div>
                <div>
                  <p className="font-semibold">{trendDisplay.label} Trend</p>
                  <p className="text-sm text-muted-foreground">
                    {trendData.recommendation}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Chart */}
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                interval="preserveStartEnd"
              />
              <YAxis 
                domain={[0, 1]}
                tick={{ fontSize: 12 }}
                label={{ value: 'Sentiment Score', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="positive" 
                stroke="#22c55e" 
                strokeWidth={2}
                name="Positive"
              />
              <Line 
                type="monotone" 
                dataKey="neutral" 
                stroke="#94a3b8" 
                strokeWidth={2}
                name="Neutral"
              />
              <Line 
                type="monotone" 
                dataKey="negative" 
                stroke="#ef4444" 
                strokeWidth={2}
                name="Negative"
              />
            </LineChart>
          </ResponsiveContainer>

          {/* Distribution Summary */}
          {trendData && (
            <div className="mt-4 grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {(trendData.sentiment_distribution.positive * 100).toFixed(0)}%
                </p>
                <p className="text-xs text-muted-foreground">Positive</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-600">
                  {(trendData.sentiment_distribution.neutral * 100).toFixed(0)}%
                </p>
                <p className="text-xs text-muted-foreground">Neutral</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">
                  {(trendData.sentiment_distribution.negative * 100).toFixed(0)}%
                </p>
                <p className="text-xs text-muted-foreground">Negative</p>
              </div>
            </div>
          )}
        </>
      )}
    </Card>
  );
}
