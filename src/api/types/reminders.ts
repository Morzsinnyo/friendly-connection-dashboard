
export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;
export type ReminderFrequency = 'Every week' | 'Every 2 weeks' | 'Monthly' | 'Every 2 months' | 'Every 3 months' | null;

export const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' }
] as const;

export const REMINDER_FREQUENCIES: ReminderFrequency[] = [
  'Every week',
  'Every 2 weeks',
  'Monthly',
  'Every 2 months',
  'Every 3 months'
];
