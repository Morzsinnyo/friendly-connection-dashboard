import { ApiResponse } from '../types/common';
import { handleApiError } from './error-handling';
import { PostgrestError } from '@supabase/supabase-js';

export async function formatApiResponse<T>(
  promise: Promise<{ data: T | null; error: PostgrestError | null }>
): Promise<ApiResponse<T>> {
  try {
    const { data, error } = await promise;
    if (error) throw error;
    return { data: data as T, error: null };
  } catch (error) {
    return { data: null, error: handleApiError(error) };
  }
}

export function createSuccessResponse<T>(data: T): ApiResponse<T> {
  return { data, error: null };
}

export function createErrorResponse<T>(error: Error): ApiResponse<T> {
  return { data: null, error: handleApiError(error) };
}