import React from 'react';
import { Alarm } from '@shared/schema';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface AlarmCardProps {
  alarm: Alarm;
  onToggle: (id: string, enabled: boolean) => void;
  onEdit: (alarm: Alarm) => void;
}

export function AlarmCard({ alarm, onToggle, onEdit }: AlarmCardProps) {
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    return {
      time: `${displayHours}:${minutes.toString().padStart(2, '0')}`,
      period
    };
  };

  const formatRepeatDays = () => {
    if (alarm.repeatDays.length === 0) return 'One-time';
    if (alarm.repeatDays.length === 7) return 'Daily';
    
    const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    const weekdays = [1, 2, 3, 4, 5];
    const weekends = [0, 6];
    
    if (alarm.repeatDays.every(day => weekdays.includes(day)) && alarm.repeatDays.length === 5) {
      return 'M T W T F';
    }
    
    if (alarm.repeatDays.every(day => weekends.includes(day)) && alarm.repeatDays.length === 2) {
      return 'S S';
    }
    
    return alarm.repeatDays
      .sort()
      .map(day => dayNames[day])
      .join(' ');
  };

  const { time, period } = formatTime(alarm.time);

  return (
    <Card 
      className={`alarm-card p-4 mb-3 shadow-sm transition-opacity ${
        alarm.enabled ? 'opacity-100' : 'opacity-60'
      }`}
      data-testid={`alarm-card-${alarm.id}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div className="text-2xl font-light text-foreground" data-testid={`alarm-time-${alarm.id}`}>
              {time}
            </div>
            <span className="text-sm text-muted-foreground" data-testid={`alarm-period-${alarm.id}`}>
              {period}
            </span>
          </div>
          <div className="text-sm text-muted-foreground mt-1" data-testid={`alarm-label-${alarm.id}`}>
            {alarm.label || 'Alarm'}
          </div>
          <div className="flex flex-wrap gap-1 mt-2">
            <span 
              className={`text-xs px-2 py-1 rounded-full ${
                alarm.enabled 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted text-muted-foreground'
              }`}
              data-testid={`alarm-repeat-${alarm.id}`}
            >
              {formatRepeatDays()}
            </span>
          </div>
        </div>
        <input
          type="checkbox"
          className="toggle-switch"
          checked={alarm.enabled}
          onChange={(e) => onToggle(alarm.id, e.target.checked)}
          data-testid={`alarm-toggle-${alarm.id}`}
        />
      </div>
      
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <span className="material-icons text-sm">volume_up</span>
            <span data-testid={`alarm-tone-${alarm.id}`}>{alarm.tone.replace('-', ' ')}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="material-icons text-sm">vibration</span>
            <span data-testid={`alarm-vibration-${alarm.id}`}>
              {alarm.vibration ? 'On' : 'Off'}
            </span>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="p-1 h-auto"
          onClick={() => onEdit(alarm)}
          data-testid={`alarm-edit-${alarm.id}`}
        >
          <span className="material-icons text-sm">edit</span>
        </Button>
      </div>
    </Card>
  );
}
