import { Alarm, InsertAlarm, AlarmStats, QuickPreset, BackupData } from '@shared/schema';
import { nanoid } from 'nanoid';

const STORAGE_KEY = 'alarmclock_alarms';
const STATS_KEY = 'alarmclock_stats';
const PRESETS_KEY = 'alarmclock_presets';

export class LocalStorage {
  private getAlarms(): Alarm[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return [];
      
      const alarms = JSON.parse(stored);
      return alarms.map((alarm: any) => ({
        // Apply defaults for new fields to handle schema migration
        smartSnooze: false,
        weatherBased: false,
        mathDifficulty: 'easy' as const,
        locationBased: false,
        isPreset: false,
        presetType: undefined,
        snoozeCount: 0,
        timesTriggered: 0,
        totalSnoozes: 0,
        // Override with stored data
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
      smartSnooze: false,
      weatherBased: false,
      mathDifficulty: 'easy' as const,
      locationBased: false,
      isPreset: false,
      presetType: undefined,
      snoozeCount: 0,
      timesTriggered: 0,
      totalSnoozes: 0,
      ...insertAlarm,
      id: nanoid(),
      createdAt: new Date(),
      nextRing: null,
    };

    const alarms = this.getAlarms();
    alarms.push(alarm);
    this.saveAlarms(alarms);
    
    // Update stats
    this.updateStats(stats => ({
      ...stats,
      totalAlarmsCreated: stats.totalAlarmsCreated + 1,
      lastUpdated: new Date(),
    }));
    
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

  // Statistics methods
  getStats(): AlarmStats {
    try {
      const stored = localStorage.getItem(STATS_KEY);
      if (!stored) {
        return {
          totalAlarmsCreated: 0,
          totalAlarmsTriggered: 0,
          totalSnoozes: 0,
          averageSnoozeCount: 0,
          mostUsedTone: '',
          longestSleepStreak: 0,
          currentSleepStreak: 0,
          lastUpdated: new Date(),
        };
      }
      
      const stats = JSON.parse(stored);
      return {
        ...stats,
        lastUpdated: new Date(stats.lastUpdated),
      };
    } catch (error) {
      console.error('Error loading stats:', error);
      return {
        totalAlarmsCreated: 0,
        totalAlarmsTriggered: 0,
        totalSnoozes: 0,
        averageSnoozeCount: 0,
        mostUsedTone: '',
        longestSleepStreak: 0,
        currentSleepStreak: 0,
        lastUpdated: new Date(),
      };
    }
  }

  updateStats(updater: (stats: AlarmStats) => AlarmStats): void {
    try {
      const currentStats = this.getStats();
      const updatedStats = updater(currentStats);
      localStorage.setItem(STATS_KEY, JSON.stringify(updatedStats));
    } catch (error) {
      console.error('Error updating stats:', error);
    }
  }

  // Quick presets methods
  getPresets(): QuickPreset[] {
    try {
      const stored = localStorage.getItem(PRESETS_KEY);
      if (!stored) {
        return this.getDefaultPresets();
      }
      return JSON.parse(stored);
    } catch (error) {
      console.error('Error loading presets:', error);
      return this.getDefaultPresets();
    }
  }

  private getDefaultPresets(): QuickPreset[] {
    return [
      {
        id: 'nap-10',
        name: '10 Min Nap',
        duration: 10,
        tone: 'gentle-chimes',
        vibration: false,
        isCustom: false,
      },
      {
        id: 'nap-20',
        name: '20 Min Power Nap',
        duration: 20,
        tone: 'gentle-chimes',
        vibration: true,
        isCustom: false,
      },
      {
        id: 'power-nap',
        name: '90 Min Power Nap',
        duration: 90,
        tone: 'classic-bell',
        vibration: true,
        isCustom: false,
      },
    ];
  }

  savePresets(presets: QuickPreset[]): void {
    try {
      localStorage.setItem(PRESETS_KEY, JSON.stringify(presets));
    } catch (error) {
      console.error('Error saving presets:', error);
    }
  }

  // Backup and restore methods
  createBackup(): BackupData {
    return {
      version: '1.0.0',
      timestamp: new Date(),
      alarms: this.getAlarms(),
      stats: this.getStats(),
      presets: this.getPresets(),
    };
  }

  restoreFromBackup(backup: BackupData): boolean {
    try {
      this.saveAlarms(backup.alarms);
      localStorage.setItem(STATS_KEY, JSON.stringify(backup.stats));
      this.savePresets(backup.presets);
      return true;
    } catch (error) {
      console.error('Error restoring backup:', error);
      return false;
    }
  }

  exportBackup(): string {
    const backup = this.createBackup();
    return JSON.stringify(backup, null, 2);
  }

  importBackup(backupString: string): boolean {
    try {
      const backup = JSON.parse(backupString);
      return this.restoreFromBackup(backup);
    } catch (error) {
      console.error('Error importing backup:', error);
      return false;
    }
  }
}

export const alarmStorage = new LocalStorage();
