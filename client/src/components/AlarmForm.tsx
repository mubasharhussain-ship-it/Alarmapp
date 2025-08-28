import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { insertAlarmSchema, InsertAlarm, Alarm } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { audioManager } from '@/lib/audioManager';

interface AlarmFormProps {
  alarm?: Alarm;
  onSave: (alarm: InsertAlarm) => void;
  onCancel: () => void;
  isOpen: boolean;
}

const formSchema = insertAlarmSchema.extend({
  hour: insertAlarmSchema.shape.time,
  minute: insertAlarmSchema.shape.time,
  period: insertAlarmSchema.shape.time,
});

export function AlarmForm({ alarm, onSave, onCancel, isOpen }: AlarmFormProps) {
  const [selectedTone, setSelectedTone] = useState('classic-bell');
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [repeatMode, setRepeatMode] = useState<'never' | 'weekdays' | 'weekends' | 'daily' | 'custom'>('never');
  const [hour, setHour] = useState(7);
  const [minute, setMinute] = useState(0);
  const [period, setPeriod] = useState<'AM' | 'PM'>('AM');

  const defaultTones = audioManager.getDefaultTones();

  const getCustomRecordings = () => {
    try {
      const saved = localStorage.getItem('customRecordings');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  };

  const form = useForm<InsertAlarm>({
    resolver: zodResolver(insertAlarmSchema),
    defaultValues: {
      time: alarm?.time || '07:00',
      label: alarm?.label || '',
      enabled: alarm?.enabled ?? true,
      repeatDays: alarm?.repeatDays || [],
      tone: alarm?.tone || 'gentle-chimes',
      vibration: alarm?.vibration ?? true,
      gradualVolume: alarm?.gradualVolume ?? true,
      snoozeEnabled: alarm?.snoozeEnabled ?? true,
      snoozeDuration: alarm?.snoozeDuration || 5,
      maxSnoozes: alarm?.maxSnoozes || 2,
      dismissMethod: alarm?.dismissMethod || 'tap',
      smartSnooze: alarm?.smartSnooze ?? true,
      weatherBased: alarm?.weatherBased ?? false,
      mathDifficulty: alarm?.mathDifficulty || 'easy',
      locationBased: alarm?.locationBased ?? false,
      isPreset: alarm?.isPreset ?? false,
    },
  });

  useEffect(() => {
    if (alarm) {
      const [alarmHour, alarmMinute] = alarm.time.split(':').map(Number);
      const alarmPeriod = alarmHour >= 12 ? 'PM' : 'AM';
      const displayHour = alarmHour === 0 ? 12 : alarmHour > 12 ? alarmHour - 12 : alarmHour;

      setHour(displayHour);
      setMinute(alarmMinute);
      setPeriod(alarmPeriod);
      setSelectedDays(alarm.repeatDays);
      setSelectedTone(alarm.tone);

      if (alarm.repeatDays.length === 0) setRepeatMode('never');
      else if (alarm.repeatDays.length === 7) setRepeatMode('daily');
      else if (alarm.repeatDays.every(d => [1,2,3,4,5].includes(d)) && alarm.repeatDays.length === 5) setRepeatMode('weekdays');
      else if (alarm.repeatDays.every(d => [0,6].includes(d)) && alarm.repeatDays.length === 2) setRepeatMode('weekends');
      else setRepeatMode('custom');

      form.reset({
        time: alarm.time,
        label: alarm.label,
        enabled: alarm.enabled,
        repeatDays: alarm.repeatDays,
        tone: alarm.tone,
        vibration: alarm.vibration,
        gradualVolume: alarm.gradualVolume,
        snoozeEnabled: alarm.snoozeEnabled,
        snoozeDuration: alarm.snoozeDuration,
        maxSnoozes: alarm.maxSnoozes,
        dismissMethod: alarm.dismissMethod,
      });
    }
  }, [alarm, form]);

  const formatTime = (h: number, m: number, p: 'AM' | 'PM') => {
    let hour24 = h;
    if (p === 'PM' && h !== 12) hour24 += 12;
    if (p === 'AM' && h === 12) hour24 = 0;

    return `${hour24.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  const handleTimeChange = (newHour?: number, newMinute?: number, newPeriod?: 'AM' | 'PM') => {
    const h = newHour ?? hour;
    const m = newMinute ?? minute;
    const p = newPeriod ?? period;

    setHour(h);
    setMinute(m);
    setPeriod(p);

    const timeString = formatTime(h, m, p);
    form.setValue('time', timeString);
  };

  const handleRepeatModeChange = (mode: typeof repeatMode) => {
    setRepeatMode(mode);
    let days: number[] = [];

    switch (mode) {
      case 'never':
        days = [];
        break;
      case 'daily':
        days = [0, 1, 2, 3, 4, 5, 6];
        break;
      case 'weekdays':
        days = [1, 2, 3, 4, 5];
        break;
      case 'weekends':
        days = [0, 6];
        break;
      case 'custom':
        days = selectedDays;
        break;
    }

    setSelectedDays(days);
    form.setValue('repeatDays', days);
  };

  const toggleDay = (day: number) => {
    const newDays = selectedDays.includes(day)
      ? selectedDays.filter(d => d !== day)
      : [...selectedDays, day].sort();

    setSelectedDays(newDays);
    form.setValue('repeatDays', newDays);
    setRepeatMode('custom');
  };

  const onSubmit = (data: InsertAlarm) => {
    onSave(data);
  };

  if (!isOpen) return null;

  return (
    <>
      <div 
        className={`backdrop fixed inset-0 bg-black/50 z-30 ${isOpen ? 'open' : ''}`}
        onClick={onCancel}
        data-testid="alarm-form-backdrop"
      />

      <div className={`bottom-sheet fixed bottom-0 left-0 right-0 bg-card rounded-t-2xl z-40 max-h-[90vh] overflow-y-auto ${isOpen ? 'open' : ''}`}>
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-foreground" data-testid="alarm-form-title">
              {alarm ? 'Edit Alarm' : 'Add Alarm'}
            </h2>
            <Button
              variant="ghost"
              size="sm"
              className="p-2 h-auto"
              onClick={onCancel}
              data-testid="alarm-form-close"
            >
              <span className="material-icons">close</span>
            </Button>
          </div>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="p-4 space-y-6">
          {/* Time Picker */}
          <div className="text-center">
            <div className="text-5xl font-light text-foreground mb-2" data-testid="alarm-form-time-display">
              {hour.toString().padStart(2, '0')}:{minute.toString().padStart(2, '0')}
            </div>
            <div className="flex justify-center gap-4">
              <Button
                type="button"
                variant={period === 'AM' ? 'default' : 'secondary'}
                size="sm"
                onClick={() => handleTimeChange(undefined, undefined, 'AM')}
                data-testid="alarm-form-am-button"
              >
                AM
              </Button>
              <Button
                type="button"
                variant={period === 'PM' ? 'default' : 'secondary'}
                size="sm"
                onClick={() => handleTimeChange(undefined, undefined, 'PM')}
                data-testid="alarm-form-pm-button"
              >
                PM
              </Button>
            </div>
            <div className="flex justify-center gap-2 mt-4">
              <div className="flex flex-col items-center">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleTimeChange(hour === 12 ? 1 : hour + 1)}
                  data-testid="alarm-form-hour-up"
                >
                  +
                </Button>
                <span className="py-2 text-lg">{hour}</span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleTimeChange(hour === 1 ? 12 : hour - 1)}
                  data-testid="alarm-form-hour-down"
                >
                  -
                </Button>
              </div>
              <div className="flex flex-col items-center">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleTimeChange(undefined, minute === 59 ? 0 : minute + 1)}
                  data-testid="alarm-form-minute-up"
                >
                  +
                </Button>
                <span className="py-2 text-lg">{minute.toString().padStart(2, '0')}</span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleTimeChange(undefined, minute === 0 ? 59 : minute - 1)}
                  data-testid="alarm-form-minute-down"
                >
                  -
                </Button>
              </div>
            </div>
          </div>

          {/* Alarm Label */}
          <div>
            <Label htmlFor="label" className="block text-sm font-medium text-foreground mb-2">
              Label
            </Label>
            <Input
              id="label"
              {...form.register('label')}
              placeholder="Alarm name"
              className="w-full"
              data-testid="alarm-form-label-input"
            />
          </div>

          {/* Repeat Options */}
          <div>
            <Label className="block text-sm font-medium text-foreground mb-3">Repeat</Label>
            <div className="grid grid-cols-7 gap-2 mb-3">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                <Button
                  key={index}
                  type="button"
                  variant={selectedDays.includes(index) ? 'default' : 'secondary'}
                  size="sm"
                  className="aspect-square text-xs font-medium"
                  onClick={() => toggleDay(index)}
                  data-testid={`alarm-form-day-${index}`}
                >
                  {day}
                </Button>
              ))}
            </div>
            <div className="space-y-2">
              {[
                { value: 'never', label: 'Never (One-time)' },
                { value: 'weekdays', label: 'Weekdays (M-F)' },
                { value: 'weekends', label: 'Weekends' },
                { value: 'daily', label: 'Daily' },
              ].map((option) => (
                <Button
                  key={option.value}
                  type="button"
                  variant="ghost"
                  className={`w-full justify-start text-sm ${
                    repeatMode === option.value ? 'text-primary font-medium' : 'text-muted-foreground'
                  }`}
                  onClick={() => handleRepeatModeChange(option.value as typeof repeatMode)}
                  data-testid={`alarm-form-repeat-${option.value}`}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Sound Selection */}
          <div>
            <Label className="block text-sm font-medium text-foreground mb-3">Sound</Label>
            <div className="space-y-2">
              {defaultTones.map((tone) => (
                <Button
                  key={tone.id}
                  type="button"
                  variant="outline"
                  className={`w-full justify-between p-3 ${
                    selectedTone === tone.id ? 'border-primary' : ''
                  }`}
                  onClick={() => {
                    setSelectedTone(tone.id);
                    form.setValue('tone', tone.id);
                  }}
                  data-testid={`alarm-form-tone-${tone.id}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="material-icons text-primary">volume_up</span>
                    <span className="text-foreground">{tone.name}</span>
                  </div>
                  {selectedTone === tone.id && (
                    <span className="material-icons text-primary">check_circle</span>
                  )}
                </Button>
              ))}
            </div>
            <div>
              <Label htmlFor="alarm-form-tone">Alarm tone</Label>
              <select
                id="alarm-form-tone"
                className="form-select"
                {...form.register('tone')}
                data-testid="alarm-form-tone-select"
              >
                <option value="gentle-chimes">Gentle Chimes</option>
                <option value="classic-bell">Classic Bell</option>
                <option value="digital-beep">Digital Beep</option>
                <option value="nature-sounds">Nature Sounds</option>
                <option value="piano-melody">Piano Melody</option>
                <optgroup label="Custom Recordings">
                  {getCustomRecordings().map(recording => (
                    <option key={recording.id} value={`custom-${recording.id}`}>
                      {recording.name}
                    </option>
                  ))}
                </optgroup>
              </select>

              <div className="mt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => window.open('/sound-recorder', '_blank')}
                  className="text-xs"
                >
                  <span className="material-icons mr-1 text-sm">mic</span>
                  Record Custom Sound
                </Button>
              </div>
            </div>
          </div>

          {/* Advanced Options */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-foreground">Basic Options</h3>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-foreground">Vibration</div>
                <div className="text-xs text-muted-foreground">Vibrate when alarm sounds</div>
              </div>
              <input
                type="checkbox"
                className="toggle-switch"
                {...form.register('vibration')}
                data-testid="alarm-form-vibration-toggle"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-foreground">Gradual volume increase</div>
                <div className="text-xs text-muted-foreground">Start soft and increase volume</div>
              </div>
              <input
                type="checkbox"
                className="toggle-switch"
                {...form.register('gradualVolume')}
                data-testid="alarm-form-gradual-volume-toggle"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-foreground">Snooze enabled</div>
                <div className="text-xs text-muted-foreground">Allow snoozing this alarm</div>
              </div>
              <input
                type="checkbox"
                className="toggle-switch"
                {...form.register('snoozeEnabled')}
                data-testid="alarm-form-snooze-toggle"
              />
            </div>

            <h3 className="text-sm font-medium text-foreground mt-6">Smart Features</h3>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-foreground">Smart snooze</div>
                <div className="text-xs text-muted-foreground">Increase snooze duration each time</div>
              </div>
              <input
                type="checkbox"
                className="toggle-switch"
                {...form.register('smartSnooze')}
                data-testid="alarm-form-smart-snooze-toggle"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-foreground">Weather-based timing</div>
                <div className="text-xs text-muted-foreground">Adjust wake time based on weather</div>
              </div>
              <input
                type="checkbox"
                className="toggle-switch"
                {...form.register('weatherBased')}
                data-testid="alarm-form-weather-toggle"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-foreground">Location-based</div>
                <div className="text-xs text-muted-foreground">Adapt to timezone changes</div>
              </div>
              <input
                type="checkbox"
                className="toggle-switch"
                {...form.register('locationBased')}
                data-testid="alarm-form-location-toggle"
              />
            </div>

            <div>
              <Label className="text-sm font-medium text-foreground">Dismiss Method</Label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                <Button
                  type="button"
                  variant={form.watch('dismissMethod') === 'tap' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => form.setValue('dismissMethod', 'tap')}
                  data-testid="dismiss-method-tap"
                >
                  Tap
                </Button>
                <Button
                  type="button"
                  variant={form.watch('dismissMethod') === 'math' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => form.setValue('dismissMethod', 'math')}
                  data-testid="dismiss-method-math"
                >
                  Math
                </Button>
                <Button
                  type="button"
                  variant={form.watch('dismissMethod') === 'shake' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => form.setValue('dismissMethod', 'shake')}
                  data-testid="dismiss-method-shake"
                >
                  Shake
                </Button>
              </div>
            </div>

            {form.watch('dismissMethod') === 'math' && (
              <div>
                <Label className="text-sm font-medium text-foreground">Math Difficulty</Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  <Button
                    type="button"
                    variant={form.watch('mathDifficulty') === 'easy' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => form.setValue('mathDifficulty', 'easy')}
                    data-testid="math-difficulty-easy"
                  >
                    Easy
                  </Button>
                  <Button
                    type="button"
                    variant={form.watch('mathDifficulty') === 'medium' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => form.setValue('mathDifficulty', 'medium')}
                    data-testid="math-difficulty-medium"
                  >
                    Medium
                  </Button>
                  <Button
                    type="button"
                    variant={form.watch('mathDifficulty') === 'hard' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => form.setValue('mathDifficulty', 'hard')}
                    data-testid="math-difficulty-hard"
                  >
                    Hard
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onCancel}
              data-testid="alarm-form-cancel"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              data-testid="alarm-form-save"
            >
              Save Alarm
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}