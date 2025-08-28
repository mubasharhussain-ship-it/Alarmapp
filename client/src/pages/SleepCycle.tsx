import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SleepCycleCalculator } from '@/lib/sleepCycleCalculator';
import { useAlarms } from '@/hooks/use-alarms';
import { InsertAlarm } from '@shared/schema';

export default function SleepCycle() {
  const { createAlarm } = useAlarms();
  const [wakeTime, setWakeTime] = useState('07:00');
  const [bedtime, setBedtime] = useState('');
  const [optimalBedtimes, setOptimalBedtimes] = useState<string[]>([]);
  const [optimalWakeTimes, setOptimalWakeTimes] = useState<string[]>([]);
  const [sleepQuality, setSleepQuality] = useState<{ score: number; quality: string; recommendation: string } | null>(null);

  const calculateBedtimes = () => {
    const bedtimes = SleepCycleCalculator.calculateOptimalBedtimes(wakeTime);
    setOptimalBedtimes(bedtimes);
  };

  const calculateWakeTimes = () => {
    if (!bedtime) return;
    const wakeTimes = SleepCycleCalculator.calculateOptimalWakeTimes(bedtime);
    setOptimalWakeTimes(wakeTimes);
  };

  const analyzeSleep = () => {
    if (!bedtime || !wakeTime) return;
    const duration = SleepCycleCalculator.getSleepDuration(bedtime, wakeTime);
    const quality = SleepCycleCalculator.getSleepQualityScore(duration);
    setSleepQuality(quality);
  };

  const formatTime12Hour = (time24: string) => {
    const [hours, minutes] = time24.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  const setAlarmForTime = (time: string, label: string) => {
    const alarmData: InsertAlarm = {
      time,
      label,
      enabled: true,
      repeatDays: [1, 2, 3, 4, 5], // Weekdays
      tone: 'gentle-chimes',
      vibration: true,
      gradualVolume: true,
      snoozeEnabled: true,
      snoozeDuration: 5,
      maxSnoozes: 2,
      dismissMethod: 'tap',
      smartSnooze: true,
      weatherBased: false,
      mathDifficulty: 'easy',
      locationBased: false,
      isPreset: false,
    };

    createAlarm(alarmData);
    alert(`Alarm set for ${formatTime12Hour(time)} with optimal sleep cycle timing!`);
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
              Sleep Cycle Calculator
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 space-y-6">
        {/* Wake Time Calculator */}
        <Card className="p-6">
          <h2 className="text-lg font-medium text-foreground mb-4 flex items-center gap-2">
            <span className="material-icons text-primary">wb_sunny</span>
            When Should I Go to Bed?
          </h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="wake-time">I want to wake up at:</Label>
              <Input
                id="wake-time"
                type="time"
                value={wakeTime}
                onChange={(e) => setWakeTime(e.target.value)}
                className="mt-1"
                data-testid="wake-time-input"
              />
            </div>
            <Button onClick={calculateBedtimes} className="w-full" data-testid="calculate-bedtimes">
              Calculate Optimal Bedtimes
            </Button>

            {optimalBedtimes.length > 0 && (
              <div className="mt-4">
                <h3 className="font-medium text-foreground mb-3">Optimal Bedtimes:</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {optimalBedtimes.map((time, index) => (
                    <Card
                      key={time}
                      className="p-4 text-center hover:shadow-md transition-shadow cursor-pointer border-2 hover:border-primary"
                      onClick={() => setAlarmForTime(time, `Bedtime Reminder`)}
                      data-testid={`bedtime-option-${index}`}
                    >
                      <div className="text-xl font-medium text-primary mb-1">
                        {formatTime12Hour(time)}
                      </div>
                      <div className="text-sm text-muted-foreground mb-2">
                        {4 + index} sleep cycles
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {6 + index * 1.5} hours of sleep
                      </div>
                      <Button size="sm" className="mt-2 w-full">
                        Set Bedtime Alarm
                      </Button>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Bedtime Calculator */}
        <Card className="p-6">
          <h2 className="text-lg font-medium text-foreground mb-4 flex items-center gap-2">
            <span className="material-icons text-primary">bedtime</span>
            When Should I Wake Up?
          </h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="bed-time">I'm going to bed at:</Label>
              <Input
                id="bed-time"
                type="time"
                value={bedtime}
                onChange={(e) => setBedtime(e.target.value)}
                className="mt-1"
                data-testid="bedtime-input"
              />
            </div>
            <Button
              onClick={calculateWakeTimes}
              className="w-full"
              disabled={!bedtime}
              data-testid="calculate-waketimes"
            >
              Calculate Optimal Wake Times
            </Button>

            {optimalWakeTimes.length > 0 && (
              <div className="mt-4">
                <h3 className="font-medium text-foreground mb-3">Optimal Wake Times:</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {optimalWakeTimes.map((time, index) => (
                    <Card
                      key={time}
                      className="p-4 text-center hover:shadow-md transition-shadow cursor-pointer border-2 hover:border-primary"
                      onClick={() => setAlarmForTime(time, `Optimal Wake Up (${4 + index} cycles)`)}
                      data-testid={`waketime-option-${index}`}
                    >
                      <div className="text-xl font-medium text-primary mb-1">
                        {formatTime12Hour(time)}
                      </div>
                      <div className="text-sm text-muted-foreground mb-2">
                        {4 + index} sleep cycles
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {6 + index * 1.5} hours of sleep
                      </div>
                      <Button size="sm" className="mt-2 w-full">
                        Set Wake Alarm
                      </Button>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Sleep Quality Analyzer */}
        <Card className="p-6">
          <h2 className="text-lg font-medium text-foreground mb-4 flex items-center gap-2">
            <span className="material-icons text-primary">analytics</span>
            Analyze My Sleep
          </h2>
          <div className="space-y-4">
            <Button
              onClick={analyzeSleep}
              className="w-full"
              disabled={!bedtime || !wakeTime}
              data-testid="analyze-sleep"
            >
              Analyze Sleep Quality
            </Button>

            {sleepQuality && (
              <div className="mt-4">
                <Card className="p-4">
                  <div className="text-center mb-4">
                    <div className="text-3xl font-bold text-primary mb-2" data-testid="sleep-score">
                      {sleepQuality.score}/100
                    </div>
                    <div className="text-lg font-medium text-foreground" data-testid="sleep-quality">
                      {sleepQuality.quality} Sleep Quality
                    </div>
                  </div>

                  <div className="w-full bg-muted rounded-full h-2 mb-4">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${sleepQuality.score}%` }}
                    ></div>
                  </div>

                  <div className="p-3 bg-muted rounded-lg">
                    <div className="text-sm font-medium text-foreground mb-1">Recommendation:</div>
                    <div className="text-sm text-muted-foreground" data-testid="sleep-recommendation">
                      {sleepQuality.recommendation}
                    </div>
                  </div>
                </Card>
              </div>
            )}
          </div>
        </Card>

        {/* Sleep Education */}
        <Card className="p-6">
          <h2 className="text-lg font-medium text-foreground mb-4 flex items-center gap-2">
            <span className="material-icons text-primary">school</span>
            Understanding Sleep Cycles
          </h2>
          <div className="space-y-4">
            <div className="p-4 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <h3 className="font-medium text-blue-800 dark:text-blue-200 mb-2">💤 What are Sleep Cycles?</h3>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                A complete sleep cycle lasts about 90 minutes and includes light sleep, deep sleep, and REM sleep.
                Waking up at the end of a cycle helps you feel more refreshed.
              </p>
            </div>

            <div className="p-4 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <h3 className="font-medium text-green-800 dark:text-green-200 mb-2">🎯 Optimal Sleep Duration</h3>
              <p className="text-sm text-green-700 dark:text-green-300">
                Adults typically need 4-6 complete sleep cycles (6-9 hours) per night.
                Quality matters more than quantity - better to wake after a complete cycle.
              </p>
            </div>

            <div className="p-4 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <h3 className="font-medium text-purple-800 dark:text-purple-200 mb-2">⏰ Timing Matters</h3>
              <p className="text-sm text-purple-700 dark:text-purple-300">
                Going to bed and waking up at consistent times helps regulate your body's internal clock.
                Try to maintain the same schedule even on weekends.
              </p>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}