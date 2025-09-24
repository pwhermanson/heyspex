// API-related type definitions

export interface ApiResponse<T = unknown> {
   data: T;
   success: boolean;
   message?: string;
   error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
   pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
   };
}

export interface ApiError {
   message: string;
   code: string;
   details?: Record<string, unknown>;
}

// Common API endpoints
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface ApiRequest {
   method: HttpMethod;
   url: string;
   data?: unknown;
   headers?: Record<string, string>;
}
