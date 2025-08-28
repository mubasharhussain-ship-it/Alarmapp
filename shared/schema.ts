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

// Enhanced Alarm Schema with new features
export const enhancedAlarmSchema = alarmSchema.extend({
  biometricLock: z.boolean().default(false),
  emergencyContact: z.string().optional(),
  healthReminder: z.boolean().default(false),
  aiOptimized: z.boolean().default(false),
  socialShare: z.boolean().default(false),
  challengeLevel: z.enum(['easy', 'medium', 'hard', 'extreme']).default('medium'),
  productivityMode: z.boolean().default(false),
  weatherSync: z.boolean().default(false)
});

export type EnhancedAlarm = z.infer<typeof enhancedAlarmSchema>;

// AI Sleep Data Schema
export const sleepDataSchema = z.object({
  date: z.string(),
  bedtime: z.string(),
  wakeTime: z.string(),
  sleepDuration: z.number(),
  sleepQuality: z.number().min(1).max(10),
  mood: z.number().min(1).max(10),
  energy: z.number().min(1).max(10),
  weather: z.string(),
  caffeine: z.number(),
  exercise: z.boolean(),
  screenTime: z.number(),
  stress: z.number().min(1).max(10)
});

export type SleepData = z.infer<typeof sleepDataSchema>;

// Medical Reminder Schema
export const medicalReminderSchema = z.object({
  id: z.string(),
  medication: z.string(),
  dosage: z.string(),
  times: z.array(z.string()),
  frequency: z.enum(['daily', 'weekly', 'as_needed']),
  important: z.boolean().default(false),
  doctor: z.string(),
  notes: z.string().optional()
});

export type MedicalReminder = z.infer<typeof medicalReminderSchema>;

// Emergency Contact Schema
export const emergencyContactSchema = z.object({
  id: z.string(),
  name: z.string(),
  relationship: z.string(),
  phone: z.string(),
  priority: z.number()
});

export type EmergencyContact = z.infer<typeof emergencyContactSchema>;

// Focus Session Schema
export const focusSessionSchema = z.object({
  id: z.string(),
  type: z.enum(['pomodoro', 'deep_work', 'break', 'meditation']),
  duration: z.number(),
  startTime: z.date(),
  endTime: z.date().optional(),
  completed: z.boolean(),
  productivity_score: z.number().optional()
});

export type FocusSession = z.infer<typeof focusSessionSchema>;

// Family Member Schema
export const familyMemberSchema = z.object({
  id: z.string(),
  name: z.string(),
  avatar: z.string().optional(),
  alarms: z.array(z.string()),
  status: z.enum(['awake', 'sleeping', 'snoozing'])
});

export type FamilyMember = z.infer<typeof familyMemberSchema>;
