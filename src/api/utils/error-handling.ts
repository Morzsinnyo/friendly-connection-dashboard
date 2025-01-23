export class ApiError extends Error {
  constructor(
    message: string,
    public code: string,
    public status: number
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function handleApiError(error: unknown): ApiError {
  console.error('API Error:', error);

  if (error instanceof ApiError) {
    return error;
  }

  if (error instanceof Error) {
    return new ApiError(
      error.message,
      'UNKNOWN_ERROR',
      500
    );
  }

  return new ApiError(
    'An unexpected error occurred',
    'UNKNOWN_ERROR',
    500
  );
}