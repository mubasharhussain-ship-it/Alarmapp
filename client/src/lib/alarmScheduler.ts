import { Alarm } from '@shared/schema';
import { audioManager } from './audioManager';

export interface AlarmEvent {
  alarm: Alarm;
  snoozeCount: number;
}

export class AlarmScheduler {
  private activeTimeouts = new Map<string, NodeJS.Timeout>();
  private ringingAlarms = new Map<string, AlarmEvent>();
  private onAlarmRing?: (event: AlarmEvent) => void;
  private wakeLock: WakeLockSentinel | null = null;

  setOnAlarmRing(callback: (event: AlarmEvent) => void): void {
    this.onAlarmRing = callback;
  }

  scheduleAlarm(alarm: Alarm): void {
    this.clearAlarm(alarm.id);
    
    if (!alarm.enabled) return;

    const nextRingTime = this.calculateNextRingTime(alarm);
    if (!nextRingTime) return;

    const now = Date.now();
    const delay = nextRingTime.getTime() - now;

    if (delay <= 0) {
      // Alarm should ring immediately
      this.triggerAlarm(alarm);
      return;
    }

    const timeout = setTimeout(() => {
      this.triggerAlarm(alarm);
    }, delay);

    this.activeTimeouts.set(alarm.id, timeout);
  }

  scheduleAlarms(alarms: Alarm[]): void {
    alarms.forEach(alarm => this.scheduleAlarm(alarm));
  }

  clearAlarm(alarmId: string): void {
    const timeout = this.activeTimeouts.get(alarmId);
    if (timeout) {
      clearTimeout(timeout);
      this.activeTimeouts.delete(alarmId);
    }
  }

  clearAllAlarms(): void {
    this.activeTimeouts.forEach(timeout => clearTimeout(timeout));
    this.activeTimeouts.clear();
  }

  private calculateNextRingTime(alarm: Alarm): Date | null {
    const now = new Date();
    const [hours, minutes] = alarm.time.split(':').map(Number);

    if (alarm.repeatDays.length === 0) {
      // One-time alarm
      const alarmTime = new Date(now);
      alarmTime.setHours(hours, minutes, 0, 0);
      
      if (alarmTime <= now) {
        alarmTime.setDate(alarmTime.getDate() + 1);
      }
      
      return alarmTime;
    }

    // Repeating alarm
    const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const alarmTimeMinutes = hours * 60 + minutes;

    // Check if alarm should ring today
    if (alarm.repeatDays.includes(currentDay) && alarmTimeMinutes > currentTime) {
      const today = new Date(now);
      today.setHours(hours, minutes, 0, 0);
      return today;
    }

    // Find next day the alarm should ring
    for (let i = 1; i <= 7; i++) {
      const checkDay = (currentDay + i) % 7;
      if (alarm.repeatDays.includes(checkDay)) {
        const nextDate = new Date(now);
        nextDate.setDate(nextDate.getDate() + i);
        nextDate.setHours(hours, minutes, 0, 0);
        return nextDate;
      }
    }

    return null;
  }

  private async triggerAlarm(alarm: Alarm): Promise<void> {
    const alarmEvent: AlarmEvent = {
      alarm,
      snoozeCount: 0
    };

    this.ringingAlarms.set(alarm.id, alarmEvent);

    // Request wake lock to prevent device sleep
    await this.requestWakeLock();

    // Vibrate if enabled
    if (alarm.vibration && 'vibrate' in navigator) {
      navigator.vibrate([1000, 500, 1000, 500, 1000]);
    }

    // Play alarm sound
    const toneUrl = this.getToneUrl(alarm.tone);
    await audioManager.playAlarmSound(toneUrl, alarm.gradualVolume);

    // Show notification
    await this.showNotification(alarm);

    // Trigger callback
    if (this.onAlarmRing) {
      this.onAlarmRing(alarmEvent);
    }

    // Schedule next ring if repeating
    if (alarm.repeatDays.length > 0) {
      this.scheduleAlarm(alarm);
    }
  }

  private getToneUrl(toneId: string): string {
    const defaultTones = audioManager.getDefaultTones();
    const tone = defaultTones.find(t => t.id === toneId);
    return tone?.url || defaultTones[0].url;
  }

  private async showNotification(alarm: Alarm): Promise<void> {
    if ('Notification' in window && Notification.permission === 'granted') {
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'SHOW_ALARM_NOTIFICATION',
          alarm
        });
      }
    }
  }

  private async requestWakeLock(): Promise<void> {
    if ('wakeLock' in navigator) {
      try {
        this.wakeLock = await (navigator as any).wakeLock.request('screen');
      } catch (err) {
        console.error('Failed to request wake lock:', err);
      }
    }
  }

  async snoozeAlarm(alarmId: string): Promise<void> {
    const alarmEvent = this.ringingAlarms.get(alarmId);
    if (!alarmEvent) return;

    const { alarm } = alarmEvent;
    
    if (!alarm.snoozeEnabled || alarmEvent.snoozeCount >= alarm.maxSnoozes) {
      this.dismissAlarm(alarmId);
      return;
    }

    // Stop current alarm
    audioManager.stopAlarmSound();
    
    // Increment snooze count
    alarmEvent.snoozeCount++;
    
    // Schedule snooze
    const snoozeDelay = alarm.snoozeDuration * 60 * 1000; // Convert minutes to milliseconds
    const timeout = setTimeout(() => {
      this.triggerAlarm(alarm);
    }, snoozeDelay);

    this.activeTimeouts.set(`${alarmId}-snooze-${alarmEvent.snoozeCount}`, timeout);
  }

  dismissAlarm(alarmId: string): void {
    // Stop alarm sound
    audioManager.stopAlarmSound();
    
    // Clear any snooze timeouts
    for (const [key, timeout] of this.activeTimeouts.entries()) {
      if (key.startsWith(alarmId)) {
        clearTimeout(timeout);
        this.activeTimeouts.delete(key);
      }
    }
    
    // Remove from ringing alarms
    this.ringingAlarms.delete(alarmId);
    
    // Release wake lock
    if (this.wakeLock) {
      this.wakeLock.release();
      this.wakeLock = null;
    }
  }

  getRingingAlarms(): AlarmEvent[] {
    return Array.from(this.ringingAlarms.values());
  }

  isAlarmRinging(alarmId: string): boolean {
    return this.ringingAlarms.has(alarmId);
  }
}

export const alarmScheduler = new AlarmScheduler();
