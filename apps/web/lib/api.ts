/**
 * API client wrapper for making HTTP requests to the backend API
 * Handles base URL configuration, error handling, and response parsing
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3002';

export type ApiErrorResponse = {
  message?: string;
  statusCode?: number;
  error?: string;
};

export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly response: ApiErrorResponse;

  constructor(message: string, statusCode: number, response: ApiErrorResponse = {}) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.response = response;
  }
}

export type ApiRequestInit = Omit<RequestInit, 'headers'> & {
  headers?: Record<string, string>;
};

/**
 * Make an API request with automatic error handling and response parsing
 * @param endpoint - The API endpoint path (e.g., '/users', '/auth/me')
 * @param options - Fetch options (method, headers, body, etc.)
 * @returns Parsed JSON response
 * @throws ApiError on request failure
 */
export async function apiRequest<T = unknown>(
  endpoint: string,
  options: ApiRequestInit = {},
): Promise<T> {
  const url = new URL(endpoint, API_BASE_URL).toString();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Add auth token if available (e.g., from cookies or localStorage)
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(
        data.message || `API Error: ${response.status}`,
        response.status,
        data,
      );
    }

    return data as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    if (error instanceof TypeError) {
      // Network error
      throw new ApiError('Network error: Failed to connect to API', 0, {
        message: error.message,
      });
    }

    throw new ApiError('Unknown error occurred', 0, {
      message: String(error),
    });
  }
}

/**
 * GET request helper
 */
export async function apiGet<T = unknown>(endpoint: string, options?: ApiRequestInit) {
  return apiRequest<T>(endpoint, { ...options, method: 'GET' });
}

/**
 * POST request helper
 */
export async function apiPost<T = unknown>(endpoint: string, data?: unknown, options?: ApiRequestInit) {
  return apiRequest<T>(endpoint, {
    ...options,
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  });
}

/**
 * PUT request helper
 */
export async function apiPut<T = unknown>(endpoint: string, data?: unknown, options?: ApiRequestInit) {
  return apiRequest<T>(endpoint, {
    ...options,
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
  });
}

/**
 * PATCH request helper
 */
export async function apiPatch<T = unknown>(endpoint: string, data?: unknown, options?: ApiRequestInit) {
  return apiRequest<T>(endpoint, {
    ...options,
    method: 'PATCH',
    body: data ? JSON.stringify(data) : undefined,
  });
}

/**
 * DELETE request helper
 */
export async function apiDelete<T = unknown>(endpoint: string, options?: ApiRequestInit) {
  return apiRequest<T>(endpoint, { ...options, method: 'DELETE' });
}

/**
 * Get authentication token from storage
 * This is a placeholder implementation - adjust based on your auth strategy
 * (cookies, localStorage, sessionStorage, etc.)
 */
function getAuthToken(): string | null {
  // Try to get token from localStorage (client-side only)
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth_token');
  }
  return null;
}

export const api = {
  get: apiGet,
  post: apiPost,
  put: apiPut,
  patch: apiPatch,
  delete: apiDelete,
};
