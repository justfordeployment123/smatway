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

// Profile API functions
import type {
  ProfileResponse,
  UserProfile,
  ProfileData,
  EmergencyContact,
  NotificationPreferences,
} from '@/types/profile.types';

export async function getProfile(): Promise<ProfileResponse> {
  return apiGet<ProfileResponse>('/users/profile');
}

export async function updateProfile(data: Partial<UserProfile & ProfileData>): Promise<any> {
  return apiPut<any>('/users/profile', data);
}

export async function uploadAvatar(file: File): Promise<{ avatarUrl: string }> {
  const formData = new FormData();
  formData.append('file', file);

  const url = new URL('/users/profile/upload-avatar', API_BASE_URL).toString();
  const token = getAuthToken();

  const response = await fetch(url, {
    method: 'POST',
    body: formData,
    credentials: 'include',
    headers: token ? { 'Authorization': `Bearer ${token}` } : undefined,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new ApiError(error.message || 'Failed to upload avatar', response.status, error);
  }

  return response.json();
}

// Emergency contacts
export async function addEmergencyContact(data: {
  name: string;
  relation: string;
  phone: string;
}): Promise<EmergencyContact> {
  return apiPost<EmergencyContact>('/users/emergency-contacts', data);
}

export async function updateEmergencyContact(
  id: string,
  data: { name: string; relation: string; phone: string },
): Promise<EmergencyContact> {
  return apiPut<EmergencyContact>(`/users/emergency-contacts/${id}`, data);
}

export async function deleteEmergencyContact(id: string): Promise<{ ok: boolean }> {
  return apiDelete<{ ok: boolean }>(`/users/emergency-contacts/${id}`);
}

// Notification preferences
export async function getNotificationPreferences(): Promise<NotificationPreferences> {
  return apiGet<NotificationPreferences>('/users/notification-preferences');
}

export async function updateNotificationPreferences(
  data: Partial<NotificationPreferences>,
): Promise<NotificationPreferences> {
  return apiPut<NotificationPreferences>('/users/notification-preferences', data);
}

// Transport
export async function searchTransports(params: {
  departureCity?: string;
  departureCountry?: string;
  destinationCity?: string;
  destinationCountry?: string;
  transportType?: string;
  date?: string;
}): Promise<any[]> {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => { if (v && v !== 'All Types') query.set(k, v); });
  return apiGet<any[]>(`/transport?${query.toString()}`);
}

export async function getTransport(id: string): Promise<any> {
  return apiGet<any>(`/transport/${id}`);
}

export async function createTransport(data: {
  departureCountry: string;
  departureCity: string;
  destinationCountry: string;
  destinationCity: string;
  price: number;
  availableSeats: number;
  departureDateTime: string;
  maxReachDateTime: string;
  vehicleId: string;
}): Promise<any> {
  return apiPost<any>('/transport', data);
}

export async function getMyRoutes(): Promise<any[]> {
  return apiGet<any[]>('/transport/my');
}

export async function deleteTransport(id: string): Promise<any> {
  return apiDelete<any>(`/transport/${id}`);
}

// Booking
export async function createBooking(data: {
  transportId: string;
  seatsBooked: number;
  paymentMethod?: string;
}): Promise<any> {
  return apiPost<any>('/booking', data);
}

export async function getMyBookings(): Promise<any[]> {
  return apiGet<any[]>('/booking/my');
}

export async function getBooking(id: string): Promise<any> {
  return apiGet<any>(`/booking/${id}`);
}

export async function cancelBooking(id: string): Promise<any> {
  return apiPatch<any>(`/booking/${id}/cancel`);
}

export async function updatePaymentMethod(id: string, paymentMethod: string): Promise<any> {
  return apiPatch<any>(`/booking/${id}/payment-method`, { paymentMethod });
}

export async function getTransportBookings(transportId?: string): Promise<any[]> {
  if (transportId) {
    return apiGet<any[]>(`/booking/transport/${transportId}`);
  }
  return apiGet<any[]>(`/booking/transporter/all`);
}

export async function confirmBooking(id: string): Promise<any> {
  return apiPatch<any>(`/booking/${id}/confirm`);
}

export async function rejectBooking(id: string): Promise<any> {
  return apiPatch<any>(`/booking/${id}/reject`);
}

// Vehicle
export async function createVehicle(data: {
  name: string;
  model: string;
  plateNumber: string;
  transportType: string;
  image?: File;
}): Promise<any> {
  const formData = new FormData();
  formData.append('name', data.name);
  formData.append('model', data.model);
  formData.append('plateNumber', data.plateNumber);
  formData.append('transportType', data.transportType);
  if (data.image) formData.append('image', data.image);

  const url = new URL('/vehicle', API_BASE_URL).toString();
  const token = getAuthToken();

  const response = await fetch(url, {
    method: 'POST',
    body: formData,
    credentials: 'include',
    headers: token ? { 'Authorization': `Bearer ${token}` } : undefined,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new ApiError(error.message || 'Failed to create vehicle', response.status, error);
  }

  return response.json();
}

export async function getMyVehicles(): Promise<any[]> {
  return apiGet<any[]>('/vehicle/my');
}

export async function getVehicle(id: string): Promise<any> {
  return apiGet<any>(`/vehicle/${id}`);
}

export async function updateVehicle(id: string, data: FormData): Promise<any> {
  const url = new URL(`/vehicle/${id}`, process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3002').toString();
  const token = getAuthToken();
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    method: 'PATCH',
    headers,
    credentials: 'include',
    body: data,
  });

  const resData = await response.json();
  if (!response.ok) {
    throw new ApiError(
      resData.message || `API Error: ${response.status}`,
      response.status,
      resData,
    );
  }
  return resData;
}

export async function deleteVehicle(id: string): Promise<any> {
  return apiDelete<any>(`/vehicle/${id}`);
}

// Password
export async function changePassword(data: {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}): Promise<{ ok: boolean }> {
  return apiPut<{ ok: boolean }>('/users/change-password', data);
}

export async function verifyPassword(password: string): Promise<{ ok: boolean }> {
  return apiPost<{ ok: boolean }>('/auth/verify-password', { password });
}

export async function disableRoutesByVehicle(vehicleId: string): Promise<any> {
  return apiDelete<any>(`/transport/vehicle/${vehicleId}`);
}
