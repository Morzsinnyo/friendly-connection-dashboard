import { ApiResponse } from '../types/common';
import { handleApiError } from './error-handling';

export async function formatApiResponse<T>(
  promise: Promise<T>
): Promise<ApiResponse<T>> {
  try {
    const data = await promise;
    return { data, error: null };
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