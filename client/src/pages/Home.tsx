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

// Mock socialFeatures and emergencyFeatures for demonstration
const socialFeatures = {
  shareAlarm: async (alarm: any) => {
    console.log('Sharing alarm:', alarm);
    // Simulate a potential error
    // throw new Error("Sharing not implemented yet");
  }
};

const emergencyFeatures = {
  activateEmergencyAlarm: async () => {
    console.log('Activating emergency alarm');
    // Simulate a potential error
    // throw new Error("Emergency activation failed");
  }
};


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

          <Link href="/ai-sleep-coach">
            <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer border-2 hover:border-primary">
              <div className="text-center">
                <span className="material-icons text-3xl text-primary mb-2">psychology</span>
                <h3 className="font-medium text-foreground mb-1">AI Sleep Coach</h3>
                <p className="text-sm text-muted-foreground">Personalized sleep optimization</p>
              </div>
            </Card>
          </Link>

          <Link href="/focus-productivity">
            <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer border-2 hover:border-primary">
              <div className="text-center">
                <span className="material-icons text-3xl text-primary mb-2">fitness_center</span>
                <h3 className="font-medium text-foreground mb-1">Focus & Productivity</h3>
                <p className="text-sm text-muted-foreground">Pomodoro & deep work timers</p>
              </div>
            </Card>
          </Link>

          <Link href="/family-alarms">
            <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer border-2 hover:border-primary">
              <div className="text-center">
                <span className="material-icons text-3xl text-primary mb-2">family_restroom</span>
                <h3 className="font-medium text-foreground mb-1">Family Alarms</h3>
                <p className="text-sm text-muted-foreground">Share & sync with family</p>
              </div>
            </Card>
          </Link>

          <Link href="/health-medical">
            <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer border-2 hover:border-primary">
              <div className="text-center">
                <span className="material-icons text-3xl text-primary mb-2">medical_services</span>
                <h3 className="font-medium text-foreground mb-1">Health & Medical</h3>
                <p className="text-sm text-muted-foreground">Medication & wellness reminders</p>
              </div>
            </Card>
          </Link>

          <Link href="/biometric-security">
            <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer border-2 hover:border-primary">
              <div className="text-center">
                <span className="material-icons text-3xl text-primary mb-2">fingerprint</span>
                <h3 className="font-medium text-foreground mb-1">Biometric Security</h3>
                <p className="text-sm text-muted-foreground">Secure important alarms</p>
              </div>
            </Card>
          </Link>

          {/* Share Alarm */}
          <Button
            variant="outline"
            className="h-20 flex-col relative group hover:bg-primary/5 transition-colors"
            onClick={() => {
              try {
                socialFeatures.shareAlarm({ id: '1', time: '07:00', label: 'Morning Alarm', enabled: true });
              } catch (error) {
                console.log('Share feature not available');
              }
            }}
            data-testid="share-alarms-button"
          >
            <span className="material-icons mb-1 text-primary">share</span>
            <span className="text-sm font-medium">Share Alarms</span>
            <span className="text-xs text-muted-foreground">Social features</span>
          </Button>

          {/* Emergency Alarm */}
          <Button
            variant="outline"
            className="h-20 flex-col relative group hover:bg-destructive/5 transition-colors border-destructive/20"
            onClick={() => {
              try {
                emergencyFeatures.activateEmergencyAlarm();
              } catch (error) {
                alert('Emergency feature activated');
              }
            }}
            data-testid="emergency-button"
          >
            <span className="material-icons mb-1 text-destructive">warning</span>
            <span className="text-sm font-medium">Emergency</span>
            <span className="text-xs text-muted-foreground">Critical alerts</span>
          </Button>

          {/* Backup & Restore */}
          <Button
            variant="outline"
            className="h-20 flex-col relative group hover:bg-primary/5 transition-colors"
            onClick={() => {
              const confirmAction = confirm('Choose:\nOK = Backup Data\nCancel = Restore Data');

              if (confirmAction) {
                // Backup
                const data = {
                  alarms: JSON.parse(localStorage.getItem('alarms') || '[]'),
                  settings: JSON.parse(localStorage.getItem('app-settings') || '{}'),
                  timestamp: new Date().toISOString()
                };

                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `alarm-backup-${new Date().toISOString().split('T')[0]}.json`;
                a.click();
                URL.revokeObjectURL(url);
                alert('Backup downloaded successfully!');
              } else {
                // Restore
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = '.json';
                input.onchange = (e) => {
                  const file = (e.target as HTMLInputElement).files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                      try {
                        const data = JSON.parse(e.target?.result as string);
                        localStorage.setItem('alarms', JSON.stringify(data.alarms || []));
                        localStorage.setItem('app-settings', JSON.stringify(data.settings || {}));
                        alert('Data restored successfully! Please refresh the page.');
                        window.location.reload();
                      } catch (error) {
                        alert('Invalid backup file!');
                      }
                    };
                    reader.readAsText(file);
                  }
                };
                input.click();
              }
            }}
            data-testid="backup-restore-button"
          >
            <span className="material-icons mb-1 text-primary">backup</span>
            <span className="text-sm font-medium">Backup & Restore</span>
            <span className="text-xs text-muted-foreground">Save/load your data</span>
          </Button>

          {/* Dark Mode Toggle */}
          <Button
            variant="outline"
            className="h-20 flex-col relative group hover:bg-primary/5 transition-colors"
            onClick={() => {
              const currentTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
              const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

              document.documentElement.classList.remove('dark', 'light');
              document.documentElement.classList.add(newTheme);

              localStorage.setItem('theme', newTheme);

              // Update the icon based on current theme
              const icon = document.querySelector('[data-testid="dark-mode-toggle"] .material-icons');
              if (icon) {
                icon.textContent = newTheme === 'dark' ? 'light_mode' : 'dark_mode';
              }

              alert(`Switched to ${newTheme} mode!`);
            }}
            data-testid="dark-mode-toggle"
          >
            <span className="material-icons mb-1 text-primary">
              {typeof window !== 'undefined' && document.documentElement.classList.contains('dark') ? 'light_mode' : 'dark_mode'}
            </span>
            <span className="text-sm font-medium">Dark Mode</span>
            <span className="text-xs text-muted-foreground">Toggle theme</span>
          </Button>

          {/* System Info */}
          <Button
            variant="outline"
            className="h-20 flex-col relative group hover:bg-primary/5 transition-colors"
            onClick={() => {
              const info = [
                `🌐 Browser: ${navigator.userAgent.split(' ').pop()}`,
                `💾 Storage Used: ${(JSON.stringify(localStorage).length / 1024).toFixed(1)} KB`,
                `⏰ Timezone: ${Intl.DateTimeFormat().resolvedOptions().timeZone}`,
                `📱 Platform: ${navigator.platform}`,
                `🔊 Audio: ${typeof Audio !== 'undefined' ? 'Supported' : 'Not Supported'}`,
                `📍 Location: ${navigator.geolocation ? 'Available' : 'Not Available'}`,
                `🔔 Notifications: ${Notification.permission || 'Not Supported'}`,
                `🎯 Online: ${navigator.onLine ? 'Yes' : 'No'}`,
                `⚡ Service Worker: ${navigator.serviceWorker ? 'Supported' : 'Not Supported'}`
              ].join('\n');

              alert(`System Information:\n\n${info}`);
            }}
            data-testid="system-info-button"
          >
            <span className="material-icons mb-1 text-primary">info</span>
            <span className="text-sm font-medium">System Info</span>
            <span className="text-xs text-muted-foreground">Device details</span>
          </Button>

          {/* Test Alarm */}
          <Button
            variant="outline"
            className="h-20 flex-col relative group hover:bg-primary/5 transition-colors"
            onClick={() => {
              // Create audio context and generate a beep sound
              const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

              const playBeep = (frequency: number, duration: number, delay: number = 0) => {
                setTimeout(() => {
                  const oscillator = audioContext.createOscillator();
                  const gainNode = audioContext.createGain();

                  oscillator.connect(gainNode);
                  gainNode.connect(audioContext.destination);

                  oscillator.frequency.value = frequency;
                  oscillator.type = 'sine';

                  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
                  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

                  oscillator.start(audioContext.currentTime);
                  oscillator.stop(audioContext.currentTime + duration);
                }, delay);
              };

              // Play a test alarm sequence
              alert('Playing test alarm sound...');
              playBeep(800, 0.2, 0);
              playBeep(600, 0.2, 300);
              playBeep(800, 0.2, 600);
              playBeep(600, 0.2, 900);
              playBeep(800, 0.5, 1200);

              // Show notification if permission is granted
              if (Notification.permission === 'granted') {
                setTimeout(() => {
                  new Notification('Test Alarm', {
                    body: 'This is how your alarm notifications will appear',
                    icon: '/manifest.json'
                  });
                }, 1000);
              } else if (Notification.permission !== 'denied') {
                Notification.requestPermission().then(permission => {
                  if (permission === 'granted') {
                    setTimeout(() => {
                      new Notification('Test Alarm', {
                        body: 'This is how your alarm notifications will appear',
                        icon: '/manifest.json'
                      });
                    }, 1000);
                  }
                });
              }
            }}
            data-testid="test-alarm-button"
          >
            <span className="material-icons mb-1 text-primary">play_arrow</span>
            <span className="text-sm font-medium">Test Alarm</span>
            <span className="text-xs text-muted-foreground">Preview sounds</span>
          </Button>
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