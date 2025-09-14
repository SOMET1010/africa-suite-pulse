// Standard API response types for better error handling and consistency

export interface ApiResponse<T> {
  data: T | null;
  error: Error | null;
  loading?: boolean;
}

export interface ApiMultiResponse<T> {
  data: T[] | null;
  error: Error | null;
  loading?: boolean;
  count?: number;
}

export interface PaginatedResponse<T> extends ApiMultiResponse<T> {
  page: number;
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// Common error types
export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ApiError {
  message: string;
  code: string;
  details?: ValidationError[];
  statusCode?: number;
}

// Success response wrapper
export interface SuccessResponse<T = unknown> {
  success: true;
  data: T;
  message?: string;
}

// Error response wrapper
export interface ErrorResponse {
  success: false;
  error: ApiError;
  data?: null;
}

// Combined response type
export type StandardResponse<T = unknown> = SuccessResponse<T> | ErrorResponse;

// Operation status
export interface OperationResult {
  success: boolean;
  message: string;
  data?: unknown;
}

// Async operation wrapper
export interface AsyncOperation<T> {
  execute: () => Promise<T>;
  loading: boolean;
  error: Error | null;
  data: T | null;
}