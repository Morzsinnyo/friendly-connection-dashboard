export interface ApiResponse<T> {
  data: T | null;
  error: Error | null;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface ApiError {
  message: string;
  code: string;
  status: number;
}