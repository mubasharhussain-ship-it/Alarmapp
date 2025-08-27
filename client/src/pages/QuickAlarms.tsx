import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { alarmStorage } from '@/lib/storage';
import { QuickPreset, InsertAlarm } from '@shared/schema';
import { useAlarms } from '@/hooks/use-alarms';

export default function QuickAlarms() {
  const { createAlarm } = useAlarms();
  const [presets, setPresets] = useState<QuickPreset[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPresets();
  }, []);

  const loadPresets = () => {
    try {
      const loadedPresets = alarmStorage.getPresets();
      setPresets(loadedPresets);
    } catch (error) {
      console.error('Failed to load presets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAlarm = (preset: QuickPreset) => {
    const now = new Date();
    const futureTime = new Date(now.getTime() + preset.duration * 60000);
    
    const timeString = `${futureTime.getHours().toString().padStart(2, '0')}:${futureTime.getMinutes().toString().padStart(2, '0')}`;
    
    const alarmData: InsertAlarm = {
      time: timeString,
      label: preset.name,
      enabled: true,
      repeatDays: [],
      tone: preset.tone,
      vibration: preset.vibration,
      gradualVolume: false,
      snoozeEnabled: true,
      snoozeDuration: 5,
      maxSnoozes: 3,
      dismissMethod: 'tap',
      smartSnooze: false,
      weatherBased: false,
      mathDifficulty: 'easy',
      locationBased: false,
      isPreset: true,
      presetType: preset.id as any,
    };

    createAlarm(alarmData);
    
    // Show success feedback
    alert(`${preset.name} set for ${futureTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`);
  };

  const getPresetIcon = (presetId: string) => {
    switch (presetId) {
      case 'nap-10':
        return '😴';
      case 'nap-20':
        return '💤';
      case 'power-nap':
        return '⚡';
      default:
        return '⏰';
    }
  };

  const getPresetDescription = (preset: QuickPreset) => {
    const futureTime = new Date(Date.now() + preset.duration * 60000);
    return `Will ring at ${futureTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <span className="material-icons text-4xl text-muted-foreground animate-spin">refresh</span>
          <p className="mt-2 text-muted-foreground">Loading quick alarms...</p>
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
                    {getPresetDescription(preset)}
                  </p>
                  
                  <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mb-3">
                    <span className="material-icons text-sm">volume_up</span>
                    <span>{preset.tone.replace('-', ' ')}</span>
                    {preset.vibration && (
                      <>
                        <span className="material-icons text-sm">vibration</span>
                        <span>Vibrate</span>
                      </>
                    )}
                  </div>
                  
                  <Button 
                    className="w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleQuickAlarm(preset);
                    }}
                  >
                    Set Alarm
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </Card>

        {/* Custom Quick Alarm */}
        <Card className="p-6">
          <h2 className="text-lg font-medium text-foreground mb-4 flex items-center gap-2">
            <span className="material-icons text-primary">edit</span>
            Custom Quick Alarm
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[5, 15, 30, 45, 60, 90, 120, 180].map((minutes) => (
              <Button
                key={minutes}
                variant="outline"
                className="p-3 h-auto"
                onClick={() => {
                  const now = new Date();
                  const futureTime = new Date(now.getTime() + minutes * 60000);
                  const timeString = `${futureTime.getHours().toString().padStart(2, '0')}:${futureTime.getMinutes().toString().padStart(2, '0')}`;
                  
                  const alarmData: InsertAlarm = {
                    time: timeString,
                    label: `${minutes} min timer`,
                    enabled: true,
                    repeatDays: [],
                    tone: 'classic-bell',
                    vibration: true,
                    gradualVolume: false,
                    snoozeEnabled: false,
                    snoozeDuration: 5,
                    maxSnoozes: 0,
                    dismissMethod: 'tap',
                    smartSnooze: false,
                    weatherBased: false,
                    mathDifficulty: 'easy',
                    locationBased: false,
                    isPreset: true,
                    presetType: 'custom',
                  };
                  
                  createAlarm(alarmData);
                  alert(`${minutes} minute timer set!`);
                }}
                data-testid={`custom-alarm-${minutes}`}
              >
                <div className="text-center">
                  <div className="font-medium">{minutes}</div>
                  <div className="text-xs text-muted-foreground">min</div>
                </div>
              </Button>
            ))}
          </div>
        </Card>

        {/* Tips */}
        <Card className="p-6">
          <h2 className="text-lg font-medium text-foreground mb-4 flex items-center gap-2">
            <span className="material-icons text-primary">lightbulb</span>
            Quick Alarm Tips
          </h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="material-icons text-sm text-muted-foreground mt-0.5">schedule</span>
              <div>
                <div className="text-sm font-medium text-foreground">Power Nap (20 min)</div>
                <div className="text-xs text-muted-foreground">Perfect for a quick energy boost without grogginess</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="material-icons text-sm text-muted-foreground mt-0.5">hotel</span>
              <div>
                <div className="text-sm font-medium text-foreground">Full Cycle (90 min)</div>
                <div className="text-xs text-muted-foreground">Complete sleep cycle for deeper, more refreshing rest</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="material-icons text-sm text-muted-foreground mt-0.5">coffee</span>
              <div>
                <div className="text-sm font-medium text-foreground">Micro Nap (10 min)</div>
                <div className="text-xs text-muted-foreground">Quick refresh when you just need a moment to recharge</div>
              </div>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}