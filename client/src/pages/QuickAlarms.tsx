import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAlarms } from '@/hooks/use-alarms';

interface QuickAlarmPreset {
  id: string;
  name: string;
  duration: number;
  sound: string;
  description: string;
}

export default function QuickAlarms() {
  const { createAlarm } = useAlarms();
  const [activeTimer, setActiveTimer] = useState<string | null>(null);

  const presets: QuickAlarmPreset[] = [
    { id: 'power-nap', name: 'Power Nap', duration: 20, sound: 'gentle', description: 'Quick refresh when you just need a moment to recharge' },
    { id: 'coffee-break', name: 'Coffee Break', duration: 15, sound: 'bell', description: 'Perfect timing for a quick coffee or tea break' },
    { id: 'meditation', name: 'Meditation', duration: 10, sound: 'chime', description: 'Short mindfulness session to center yourself' },
    { id: 'pomodoro', name: 'Pomodoro', duration: 25, sound: 'notification', description: 'Focus session for productivity' },
    { id: 'micro-break', name: 'Micro Break', duration: 5, sound: 'soft', description: 'Quick break from screen time' },
    { id: 'lunch-break', name: 'Lunch Break', duration: 60, sound: 'bell', description: 'Extended break for meals' },
  ];

  const handleQuickAlarm = (preset: QuickAlarmPreset) => {
    const now = new Date();
    const alarmTime = new Date(now.getTime() + preset.duration * 60000);

    createAlarm({
      time: alarmTime.toTimeString().slice(0, 5),
      label: preset.name,
      enabled: true,
      sound: preset.sound,
      volume: 70,
      repeat: false,
      snoozeEnabled: true,
      snoozeDuration: 5
    });

    setActiveTimer(preset.id);
    setTimeout(() => setActiveTimer(null), 2000);
  };

  const getPresetIcon = (id: string) => {
    const icons: Record<string, string> = {
      'power-nap': '😴',
      'coffee-break': '☕',
      'meditation': '🧘',
      'pomodoro': '🍅',
      'micro-break': '⏱️',
      'lunch-break': '🍽️'
    };
    return icons[id] || '⏰';
  };

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
              Quick Alarms
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 space-y-6">
        <Card className="p-6">
          <h2 className="text-lg font-medium text-foreground mb-2">Set a Quick Alarm</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Perfect for naps, timers, and quick reminders. These alarms will go off once and then be removed.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {presets.map((preset) => (
              <Card 
                key={preset.id} 
                className="p-4 hover:shadow-md transition-shadow cursor-pointer border-2 hover:border-primary"
                onClick={() => handleQuickAlarm(preset)}
                data-testid={`quick-alarm-${preset.id}`}
              >
                <div className="text-center">
                  <div className="text-3xl mb-2">{getPresetIcon(preset.id)}</div>
                  <h3 className="font-medium text-foreground mb-1">{preset.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {preset.duration} minute{preset.duration !== 1 ? 's' : ''}
                  </p>
                  <p className="text-xs text-muted-foreground mb-4">
                    {preset.description}
                  </p>

                  {activeTimer === preset.id && (
                    <div className="text-green-600 text-sm font-medium">
                      ✓ Alarm Set!
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </Card>

        {/* Custom Timer */}
        <Card className="p-6">
          <h3 className="text-lg font-medium text-foreground mb-4">Custom Timer</h3>
          <div className="flex items-center gap-4">
            <input
              type="number"
              min="1"
              max="480"
              placeholder="Minutes"
              className="flex-1 p-2 border border-border rounded-md bg-background text-foreground"
            />
            <Button onClick={() => {/* Handle custom timer */}}>
              Set Timer
            </Button>
          </div>
        </Card>
      </main>
    </div>
  );
}