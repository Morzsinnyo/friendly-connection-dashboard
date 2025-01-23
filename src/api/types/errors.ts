export interface CalendarError extends Error {
  code: string;
  status?: number;
}

export interface ReminderError extends Error {
  type: 'deletion' | 'creation' | 'search';
  originalError?: unknown;
}

export interface TransitionError extends Error {
  state: string;
  targetState: string;
  reason: string;
}

export type ApiErrorResponse = {
  message: string;
  code: string;
  details?: unknown;
};

// Type guards
export const isCalendarError = (error: unknown): error is CalendarError => {
  return error instanceof Error && 'code' in error;
};

export const isReminderError = (error: unknown): error is ReminderError => {
  return error instanceof Error && 'type' in error;
};

export const isTransitionError = (error: unknown): error is TransitionError => {
  return error instanceof Error && 'state' in error && 'targetState' in error;
};