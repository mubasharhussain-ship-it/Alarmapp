import React from 'react';
import { AlarmEvent } from '@/lib/alarmScheduler';
import { AlarmDismissalChallenge } from './AlarmDismissalChallenge';

interface AlarmRingingOverlayProps {
  alarmEvent: AlarmEvent | null;
  onSnooze: (alarmId: string) => void;
  onDismiss: (alarmId: string) => void;
}

export function AlarmRingingOverlay({ alarmEvent, onSnooze, onDismiss }: AlarmRingingOverlayProps) {
  if (!alarmEvent) return null;

  const { alarm, snoozeCount } = alarmEvent;

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  const canSnooze = alarm.snoozeEnabled && snoozeCount < alarm.maxSnoozes;

  return (
    <div 
      className="fixed inset-0 bg-background z-50 flex flex-col items-center justify-center"
      data-testid="alarm-ringing-overlay"
    >
      <div className="text-center p-8">
        <div className="animate-pulse-slow mb-6">
          <span className="material-icons text-8xl text-primary">alarm</span>
        </div>
        <h2 
          className="text-2xl font-medium text-foreground mb-2"
          data-testid="ringing-alarm-label"
        >
          {alarm.label || 'Alarm'}
        </h2>
        <div 
          className="text-4xl font-light text-foreground mb-8"
          data-testid="ringing-alarm-time"
        >
          {formatTime(alarm.time)}
        </div>
        
        {snoozeCount > 0 && (
          <div className="text-sm text-muted-foreground mb-4" data-testid="snooze-count">
            Snoozed {snoozeCount} time{snoozeCount !== 1 ? 's' : ''}
          </div>
        )}
        
        <div className="w-full max-w-xs">
          <AlarmDismissalChallenge
            alarm={alarm}
            onDismiss={() => onDismiss(alarm.id)}
            onSnooze={() => onSnooze(alarm.id)}
          />
        </div>
      </div>
    </div>
  );
}
