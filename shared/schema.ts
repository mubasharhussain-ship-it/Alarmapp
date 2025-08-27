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
  createdAt: z.date(),
  nextRing: z.date().nullable(),
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
