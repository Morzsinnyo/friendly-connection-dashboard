import { ValidationRule } from './validation';

export const required = (message = 'This field is required'): ValidationRule => ({
  validate: (value: any) => {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string') return value.trim().length > 0;
    if (value instanceof Date) return !isNaN(value.getTime());
    return true;
  },
  message
});

export const minLength = (length: number, message?: string): ValidationRule => ({
  validate: (value: string) => value.length >= length,
  message: message || `Must be at least ${length} characters`
});

export const maxLength = (length: number, message?: string): ValidationRule => ({
  validate: (value: string) => value.length <= length,
  message: message || `Must not exceed ${length} characters`
});

export const dateRange = (message = 'Invalid date range'): ValidationRule => ({
  validate: (value: { start: Date; end: Date }) => {
    if (!value.start || !value.end) return false;
    return value.start <= value.end;
  },
  message
});

export const url = (message = 'Invalid URL format'): ValidationRule => ({
  validate: (value: string) => {
    if (!value) return true; // Allow empty values, use required() if needed
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  },
  message
});