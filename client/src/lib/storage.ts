import { Alarm, InsertAlarm } from '@shared/schema';
import { nanoid } from 'nanoid';

const STORAGE_KEY = 'alarmclock_alarms';

export class LocalStorage {
  private getAlarms(): Alarm[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return [];
      
      const alarms = JSON.parse(stored);
      return alarms.map((alarm: any) => ({
        ...alarm,
        createdAt: new Date(alarm.createdAt),
        nextRing: alarm.nextRing ? new Date(alarm.nextRing) : null,
      }));
    } catch (error) {
      console.error('Error loading alarms:', error);
      return [];
    }
  }

  private saveAlarms(alarms: Alarm[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(alarms));
    } catch (error) {
      console.error('Error saving alarms:', error);
    }
  }

  getAllAlarms(): Alarm[] {
    return this.getAlarms();
  }

  getAlarm(id: string): Alarm | undefined {
    return this.getAlarms().find(alarm => alarm.id === id);
  }

  createAlarm(insertAlarm: InsertAlarm): Alarm {
    const alarm: Alarm = {
      ...insertAlarm,
      id: nanoid(),
      createdAt: new Date(),
      nextRing: null,
    };

    const alarms = this.getAlarms();
    alarms.push(alarm);
    this.saveAlarms(alarms);
    
    return alarm;
  }

  updateAlarm(id: string, updates: Partial<Omit<Alarm, 'id' | 'createdAt'>>): Alarm | undefined {
    const alarms = this.getAlarms();
    const index = alarms.findIndex(alarm => alarm.id === id);
    
    if (index === -1) return undefined;
    
    alarms[index] = { ...alarms[index], ...updates };
    this.saveAlarms(alarms);
    
    return alarms[index];
  }

  deleteAlarm(id: string): boolean {
    const alarms = this.getAlarms();
    const filteredAlarms = alarms.filter(alarm => alarm.id !== id);
    
    if (filteredAlarms.length === alarms.length) return false;
    
    this.saveAlarms(filteredAlarms);
    return true;
  }

  getEnabledAlarms(): Alarm[] {
    return this.getAlarms().filter(alarm => alarm.enabled);
  }
}

export const localStorage = new LocalStorage();
