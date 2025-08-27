import { useState, useEffect, useCallback } from 'react';
import { Alarm, InsertAlarm } from '@shared/schema';
import { alarmStorage } from '@/lib/storage';
import { alarmScheduler, AlarmEvent } from '@/lib/alarmScheduler';

export function useAlarms() {
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [ringingAlarm, setRingingAlarm] = useState<AlarmEvent | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadAlarms = useCallback(() => {
    try {
      const loadedAlarms = alarmStorage.getAllAlarms();
      setAlarms(loadedAlarms);
      alarmScheduler.scheduleAlarms(loadedAlarms);
    } catch (error) {
      console.error('Failed to load alarms:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAlarms();
    
    // Set up alarm ring handler
    alarmScheduler.setOnAlarmRing((alarmEvent) => {
      setRingingAlarm(alarmEvent);
    });

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(error => {
        console.error('Service worker registration failed:', error);
      });
    }

    return () => {
      alarmScheduler.clearAllAlarms();
    };
  }, [loadAlarms]);

  const createAlarm = useCallback((insertAlarm: InsertAlarm) => {
    try {
      const newAlarm = alarmStorage.createAlarm(insertAlarm);
      setAlarms(prev => [...prev, newAlarm]);
      
      if (newAlarm.enabled) {
        alarmScheduler.scheduleAlarm(newAlarm);
      }
      
      return newAlarm;
    } catch (error) {
      console.error('Failed to create alarm:', error);
      throw error;
    }
  }, []);

  const updateAlarm = useCallback((id: string, updates: Partial<Omit<Alarm, 'id' | 'createdAt'>>) => {
    try {
      const updatedAlarm = alarmStorage.updateAlarm(id, updates);
      if (!updatedAlarm) return null;
      
      setAlarms(prev => prev.map(alarm => 
        alarm.id === id ? updatedAlarm : alarm
      ));
      
      // Reschedule alarm
      alarmScheduler.clearAlarm(id);
      if (updatedAlarm.enabled) {
        alarmScheduler.scheduleAlarm(updatedAlarm);
      }
      
      return updatedAlarm;
    } catch (error) {
      console.error('Failed to update alarm:', error);
      throw error;
    }
  }, []);

  const deleteAlarm = useCallback((id: string) => {
    try {
      const success = alarmStorage.deleteAlarm(id);
      if (success) {
        setAlarms(prev => prev.filter(alarm => alarm.id !== id));
        alarmScheduler.clearAlarm(id);
        
        // Dismiss if currently ringing
        if (ringingAlarm?.alarm.id === id) {
          alarmScheduler.dismissAlarm(id);
          setRingingAlarm(null);
        }
      }
      return success;
    } catch (error) {
      console.error('Failed to delete alarm:', error);
      throw error;
    }
  }, [ringingAlarm]);

  const toggleAlarm = useCallback((id: string, enabled: boolean) => {
    return updateAlarm(id, { enabled });
  }, [updateAlarm]);

  const snoozeAlarm = useCallback((id: string) => {
    alarmScheduler.snoozeAlarm(id);
    setRingingAlarm(null);
  }, []);

  const dismissAlarm = useCallback((id: string) => {
    alarmScheduler.dismissAlarm(id);
    setRingingAlarm(null);
  }, []);

  return {
    alarms,
    ringingAlarm,
    isLoading,
    createAlarm,
    updateAlarm,
    deleteAlarm,
    toggleAlarm,
    snoozeAlarm,
    dismissAlarm,
    refetch: loadAlarms,
  };
}
