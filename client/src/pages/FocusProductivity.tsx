
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ProductivityIntegration } from '@/lib/productivityIntegration';

export default function FocusProductivity() {
  const [timerMode, setTimerMode] = useState<'pomodoro' | 'deep' | 'break'>('pomodoro');
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes
  const [isRunning, setIsRunning] = useState(false);
  const [sessions, setSessions] = useState(0);

  const timerModes = {
    pomodoro: { duration: 25 * 60, label: '🍅 Pomodoro', description: '25 min focused work' },
    deep: { duration: 90 * 60, label: '🧠 Deep Work', description: '90 min deep focus' },
    break: { duration: 5 * 60, label: '☕ Break', description: '5 min rest' }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
      setSessions(prev => prev + 1);
      // Play notification sound
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmAaBjiS2vLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmAaBjiS2vLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmAaA'); 
      audio.play().catch(() => {});
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const startTimer = () => setIsRunning(true);
  const pauseTimer = () => setIsRunning(false);
  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(timerModes[timerMode].duration);
  };

  const switchMode = (mode: 'pomodoro' | 'deep' | 'break') => {
    setTimerMode(mode);
    setTimeLeft(timerModes[mode].duration);
    setIsRunning(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const createProductivityAlarms = () => {
    try {
      const alarms = ProductivityIntegration.createProductivityAlarms();
      alert(`Created ${alarms.length} productivity alarms!`);
    } catch (error) {
      console.error('Error creating alarms:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="bg-card border-b border-border px-4 py-3 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="p-2 h-auto"
            onClick={() => window.history.back()}
          >
            <span className="material-icons">arrow_back</span>
          </Button>
          <h1 className="text-xl font-medium text-foreground">Focus & Productivity</h1>
        </div>
      </header>

      <main className="p-4 space-y-6">
        {/* Timer Section */}
        <Card className="p-6">
          <div className="text-center mb-6">
            <div className="text-6xl font-mono font-bold text-primary mb-4">
              {formatTime(timeLeft)}
            </div>
            <p className="text-lg text-muted-foreground mb-4">
              {timerModes[timerMode].description}
            </p>
            <div className="flex justify-center gap-2 mb-6">
              {Object.entries(timerModes).map(([mode, config]) => (
                <Button
                  key={mode}
                  variant={timerMode === mode ? "default" : "outline"}
                  size="sm"
                  onClick={() => switchMode(mode as any)}
                >
                  {config.label}
                </Button>
              ))}
            </div>
            <div className="flex justify-center gap-4">
              <Button
                onClick={isRunning ? pauseTimer : startTimer}
                size="lg"
                className="px-8"
              >
                <span className="material-icons mr-2">
                  {isRunning ? 'pause' : 'play_arrow'}
                </span>
                {isRunning ? 'Pause' : 'Start'}
              </Button>
              <Button
                onClick={resetTimer}
                variant="outline"
                size="lg"
              >
                <span className="material-icons mr-2">refresh</span>
                Reset
              </Button>
            </div>
          </div>
        </Card>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4 text-center">
            <span className="material-icons text-3xl text-primary mb-2">timer</span>
            <div className="text-2xl font-bold">{sessions}</div>
            <p className="text-sm text-muted-foreground">Sessions Today</p>
          </Card>
          
          <Card className="p-4 text-center">
            <span className="material-icons text-3xl text-primary mb-2">trending_up</span>
            <div className="text-2xl font-bold">85%</div>
            <p className="text-sm text-muted-foreground">Focus Score</p>
          </Card>
          
          <Card className="p-4 text-center">
            <span className="material-icons text-3xl text-primary mb-2">local_fire_department</span>
            <div className="text-2xl font-bold">7</div>
            <p className="text-sm text-muted-foreground">Day Streak</p>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="p-4">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <span className="material-icons text-primary">auto_awesome</span>
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button variant="outline" onClick={createProductivityAlarms}>
              <span className="material-icons mr-2">alarm</span>
              Set Productivity Alarms
            </Button>
            <Button variant="outline">
              <span className="material-icons mr-2">analytics</span>
              View Weekly Report
            </Button>
            <Button variant="outline">
              <span className="material-icons mr-2">schedule</span>
              Schedule Deep Work
            </Button>
            <Button variant="outline">
              <span className="material-icons mr-2">psychology</span>
              Get AI Suggestions
            </Button>
          </div>
        </Card>
      </main>
    </div>
  );
}
