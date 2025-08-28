import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { alarmStorage } from '@/lib/storage';
import { AlarmStats } from '@shared/schema';
import { useTheme } from '@/hooks/use-theme';

export default function Statistics() {
  const { theme } = useTheme();
  const [stats, setStats] = useState<AlarmStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = () => {
    try {
      const alarmStats = alarmStorage.getStats();
      setStats(alarmStats);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <span className="material-icons text-4xl text-muted-foreground animate-spin">refresh</span>
          <p className="mt-2 text-muted-foreground">Loading statistics...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <span className="material-icons text-6xl text-muted-foreground mb-4">error</span>
          <h3 className="text-lg font-medium text-foreground mb-2">Unable to load statistics</h3>
          <Button onClick={loadStats} data-testid="retry-stats">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="bg-card border-b border-border px-4 py-3 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="p-2 h-auto"
              onClick={() => window.history.back()}
              data-testid="back-button"
            >
              <span className="material-icons">arrow_back</span>
            </Button>
            <h1 className="text-xl font-medium text-foreground" data-testid="page-title">
              Sleep Statistics
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 space-y-6">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-primary mb-1" data-testid="total-alarms">
              {stats.totalAlarmsCreated}
            </div>
            <div className="text-sm text-muted-foreground">Total Alarms Created</div>
          </Card>

          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-primary mb-1" data-testid="triggered-alarms">
              {stats.totalAlarmsTriggered}
            </div>
            <div className="text-sm text-muted-foreground">Alarms Triggered</div>
          </Card>

          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-primary mb-1" data-testid="total-snoozes">
              {stats.totalSnoozes}
            </div>
            <div className="text-sm text-muted-foreground">Total Snoozes</div>
          </Card>

          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-primary mb-1" data-testid="avg-snoozes">
              {stats.averageSnoozeCount.toFixed(1)}
            </div>
            <div className="text-sm text-muted-foreground">Avg Snoozes per Alarm</div>
          </Card>
        </div>

        {/* Sleep Streak */}
        <Card className="p-6">
          <h2 className="text-lg font-medium text-foreground mb-4 flex items-center gap-2">
            <span className="material-icons text-primary">hotel</span>
            Sleep Streak
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="text-3xl font-bold text-primary mb-2" data-testid="current-streak">
                {stats.currentSleepStreak}
              </div>
              <div className="text-sm text-muted-foreground">Current Streak (days)</div>
              <div className="text-xs text-muted-foreground mt-1">
                Keep it up! Consistent sleep improves your health.
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold text-secondary mb-2" data-testid="longest-streak">
                {stats.longestSleepStreak}
              </div>
              <div className="text-sm text-muted-foreground">Longest Streak (days)</div>
              <div className="text-xs text-muted-foreground mt-1">
                Your personal best!
              </div>
            </div>
          </div>
        </Card>

        {/* Preferences */}
        <Card className="p-6">
          <h2 className="text-lg font-medium text-foreground mb-4 flex items-center gap-2">
            <span className="material-icons text-primary">tune</span>
            Your Preferences
          </h2>
          <div className="space-y-4">
            <div>
              <div className="text-sm text-muted-foreground">Most Used Alarm Tone</div>
              <div className="text-lg font-medium text-foreground" data-testid="favorite-tone">
                {stats.mostUsedTone || 'None yet'}
              </div>
            </div>
            
            <div>
              <div className="text-sm text-muted-foreground">Statistics Last Updated</div>
              <div className="text-lg font-medium text-foreground" data-testid="last-updated">
                {formatDate(stats.lastUpdated)}
              </div>
            </div>
          </div>
        </Card>

        {/* Tips and Insights */}
        <Card className="p-6">
          <h2 className="text-lg font-medium text-foreground mb-4 flex items-center gap-2">
            <span className="material-icons text-primary">lightbulb</span>
            Sleep Tips
          </h2>
          <div className="space-y-3">
            {stats.averageSnoozeCount > 2 && (
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                <div className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  💤 Tip: Try going to bed 15 minutes earlier
                </div>
                <div className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                  You're snoozing more than average. Earlier bedtime might help you wake up more refreshed.
                </div>
              </div>
            )}
            
            {stats.currentSleepStreak >= 7 && (
              <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <div className="text-sm font-medium text-green-800 dark:text-green-200">
                  🎉 Great job! You're building a healthy sleep routine
                </div>
                <div className="text-xs text-green-700 dark:text-green-300 mt-1">
                  Keep up your {stats.currentSleepStreak}-day streak!
                </div>
              </div>
            )}
            
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <div className="text-sm font-medium text-blue-800 dark:text-blue-200">
                💡 Sleep Quality Tip
              </div>
              <div className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                Aim for 7-9 hours of sleep per night and try to maintain consistent sleep and wake times.
              </div>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}