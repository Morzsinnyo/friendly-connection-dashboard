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