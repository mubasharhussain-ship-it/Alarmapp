import { z } from "zod";

export const alarmSchema = z.object({
  id: z.string(),
  time: z.string(), // HH:MM format
  label: z.string(),
  enabled: z.boolean(),
  repeatDays: z.array(z.number()).min(0).max(7), // 0-6 for days of week, empty for one-time
  tone: z.string(),
  vibration: z.boolean(),
  gradualVolume: z.boolean(),
  snoozeEnabled: z.boolean(),
  snoozeDuration: z.number(), // minutes
  maxSnoozes: z.number(),
  dismissMethod: z.enum(["tap", "math", "shake"]),
  smartSnooze: z.boolean(), // Increase snooze duration after each snooze
  weatherBased: z.boolean(), // Adjust wake time based on weather
  mathDifficulty: z.enum(["easy", "medium", "hard"]), // Math puzzle difficulty
  locationBased: z.boolean(), // Adapt to timezone changes
  isPreset: z.boolean(), // Quick preset alarm
  presetType: z.enum(["nap-10", "nap-20", "power-nap", "custom"]).optional(),
  createdAt: z.date(),
  nextRing: z.date().nullable(),
  snoozeCount: z.number().default(0), // Track current snooze count
  timesTriggered: z.number().default(0), // Statistics
  totalSnoozes: z.number().default(0), // Statistics
});

export const insertAlarmSchema = alarmSchema.omit({
  id: true,
  createdAt: true,
  nextRing: true,
});

export type Alarm = z.infer<typeof alarmSchema>;
export type InsertAlarm = z.infer<typeof insertAlarmSchema>;

export const alarmToneSchema = z.object({
  id: z.string(),
  name: z.string(),
  url: z.string(),
  isDefault: z.boolean(),
});

export type AlarmTone = z.infer<typeof alarmToneSchema>;

// Sleep Cycle Calculation Schema
export const sleepCycleSchema = z.object({
  bedtime: z.string(), // HH:MM format
  wakeTime: z.string(), // HH:MM format
  cycleLength: z.number().default(90), // minutes per cycle
  fallAsleepTime: z.number().default(15), // minutes to fall asleep
});

export type SleepCycle = z.infer<typeof sleepCycleSchema>;

// Alarm Statistics Schema
export const alarmStatsSchema = z.object({
  totalAlarmsCreated: z.number().default(0),
  totalAlarmsTriggered: z.number().default(0),
  totalSnoozes: z.number().default(0),
  averageSnoozeCount: z.number().default(0),
  mostUsedTone: z.string().default(""),
  longestSleepStreak: z.number().default(0),
  currentSleepStreak: z.number().default(0),
  lastUpdated: z.date(),
});

export type AlarmStats = z.infer<typeof alarmStatsSchema>;

// Quick Preset Schema
export const quickPresetSchema = z.object({
  id: z.string(),
  name: z.string(),
  duration: z.number(), // minutes from now
  tone: z.string(),
  vibration: z.boolean(),
  isCustom: z.boolean(),
});

export type QuickPreset = z.infer<typeof quickPresetSchema>;

// Backup/Restore Schema
export const backupSchema = z.object({
  version: z.string(),
  timestamp: z.date(),
  alarms: z.array(alarmSchema),
  stats: alarmStatsSchema,
  presets: z.array(quickPresetSchema),
});

export type BackupData = z.infer<typeof backupSchema>;
