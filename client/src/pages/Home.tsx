import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AlarmCard } from '@/components/AlarmCard';
import { AlarmForm } from '@/components/AlarmForm';
import { AlarmRingingOverlay } from '@/components/AlarmRingingOverlay';
import { useAlarms } from '@/hooks/use-alarms';
import { useTheme } from '@/hooks/use-theme';
import { Alarm, InsertAlarm } from '@shared/schema';
import { Link } from 'wouter';

export default function Home() {
  const { theme, toggleTheme } = useTheme();
  const {
    alarms,
    ringingAlarm,
    isLoading,
    createAlarm,
    updateAlarm,
    deleteAlarm,
    toggleAlarm,
    snoozeAlarm,
    dismissAlarm,
  } = useAlarms();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAlarm, setEditingAlarm] = useState<Alarm | undefined>();
  const [currentTime, setCurrentTime] = useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleSaveAlarm = (alarmData: InsertAlarm) => {
    if (editingAlarm) {
      updateAlarm(editingAlarm.id, alarmData);
    } else {
      createAlarm(alarmData);
    }
    setIsFormOpen(false);
    setEditingAlarm(undefined);
  };

  const handleEditAlarm = (alarm: Alarm) => {
    setEditingAlarm(alarm);
    setIsFormOpen(true);
  };

  const handleCancelForm = () => {
    setIsFormOpen(false);
    setEditingAlarm(undefined);
  };

  const formatCurrentTime = () => {
    return currentTime.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const formatCurrentDate = () => {
    return currentTime.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <span className="material-icons text-4xl text-muted-foreground animate-spin">refresh</span>
          <p className="mt-2 text-muted-foreground">Loading alarms...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="bg-card border-b border-border px-4 py-3 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-medium text-foreground" data-testid="app-title">
            Alarms
          </h1>
          <Button
            variant="ghost"
            size="sm"
            className="p-2 h-auto"
            onClick={toggleTheme}
            data-testid="theme-toggle"
          >
            <span className="material-icons">
              {theme === 'light' ? 'dark_mode' : 'light_mode'}
            </span>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="pb-20">
        {/* Current Time Display */}
        <Card className="mx-4 mt-4 p-6 text-center">
          <div 
            className="text-4xl font-light text-foreground"
            data-testid="current-time"
          >
            {formatCurrentTime()}
          </div>
          <div 
            className="text-sm text-muted-foreground mt-1"
            data-testid="current-date"
          >
            {formatCurrentDate()}
          </div>
        </Card>

        {/* Quick Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mx-4 mt-4">
          <Link href="/quick-alarms">
            <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer border-2 hover:border-primary">
              <div className="text-center">
                <span className="material-icons text-3xl text-primary mb-2">timer</span>
                <h3 className="font-medium text-foreground mb-1">Quick Alarms</h3>
                <p className="text-sm text-muted-foreground">Set nap timers & presets</p>
              </div>
            </Card>
          </Link>

          <Link href="/sleep-cycle">
            <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer border-2 hover:border-primary">
              <div className="text-center">
                <span className="material-icons text-3xl text-primary mb-2">bedtime</span>
                <h3 className="font-medium text-foreground mb-1">Sleep Cycle</h3>
                <p className="text-sm text-muted-foreground">Optimize your sleep timing</p>
              </div>
            </Card>
          </Link>

          <Link href="/statistics">
            <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer border-2 hover:border-primary">
              <div className="text-center">
                <span className="material-icons text-3xl text-primary mb-2">analytics</span>
                <h3 className="font-medium text-foreground mb-1">Statistics</h3>
                <p className="text-sm text-muted-foreground">Track your sleep patterns</p>
              </div>
            </Card>
          </Link>

          <Link href="/world-clock">
            <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer border-2 hover:border-primary">
              <div className="text-center">
                <span className="material-icons text-3xl text-primary mb-2">public</span>
                <h3 className="font-medium text-foreground mb-1">World Clock</h3>
                <p className="text-sm text-muted-foreground">Track time across timezones</p>
              </div>
            </Card>
          </Link>

          <Link href="/sound-recorder">
            <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer border-2 hover:border-primary">
              <div className="text-center">
                <span className="material-icons text-3xl text-primary mb-2">mic</span>
                <h3 className="font-medium text-foreground mb-1">Custom Sounds</h3>
                <p className="text-sm text-muted-foreground">Record personal alarm tones</p>
              </div>
            </Card>
          </Link>

          <Link href="/stopwatch">
            <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer border-2 hover:border-primary">
              <div className="text-center">
                <span className="material-icons text-3xl text-primary mb-2">timer</span>
                <h3 className="font-medium text-foreground mb-1">Stopwatch</h3>
                <p className="text-sm text-muted-foreground">Time events & activities</p>
              </div>
            </Card>
          </Link>
        </div>

        {/* Alarms List */}
        <div className="px-4 mt-6">
          <h2 className="text-lg font-medium text-foreground mb-4" data-testid="alarms-section-title">
            Your Alarms
          </h2>
          
          {alarms.length > 0 ? (
            <div data-testid="alarms-list">
              {alarms.map((alarm) => (
                <AlarmCard
                  key={alarm.id}
                  alarm={alarm}
                  onToggle={toggleAlarm}
                  onEdit={handleEditAlarm}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12" data-testid="empty-state">
              <span className="material-icons text-6xl text-muted-foreground mb-4">alarm_off</span>
              <h3 className="text-lg font-medium text-foreground mb-2">No alarms set</h3>
              <p className="text-muted-foreground mb-6">Tap the + button to create your first alarm</p>
            </div>
          )}
        </div>
      </main>

      {/* Floating Action Button */}
      <Button
        className="fab fixed bottom-6 right-6 w-14 h-14 rounded-full z-20"
        onClick={() => setIsFormOpen(true)}
        data-testid="add-alarm-fab"
      >
        <span className="material-icons text-2xl">add</span>
      </Button>

      {/* Alarm Form Modal */}
      <AlarmForm
        alarm={editingAlarm}
        onSave={handleSaveAlarm}
        onCancel={handleCancelForm}
        isOpen={isFormOpen}
      />

      {/* Alarm Ringing Overlay */}
      <AlarmRingingOverlay
        alarmEvent={ringingAlarm}
        onSnooze={snoozeAlarm}
        onDismiss={dismissAlarm}
      />
    </div>
  );
}
