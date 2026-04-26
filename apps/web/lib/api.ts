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
      // A 401 from an auth endpoint is "bad credentials / bad reset token" —
      // NOT an expired session — so let it bubble up as a normal ApiError.
      const isAuthAttempt =
        endpoint.startsWith('/auth/login') ||
        endpoint.startsWith('/auth/register') ||
        endpoint.startsWith('/auth/verify-email') ||
        endpoint.startsWith('/auth/resend-otp') ||
        endpoint.startsWith('/auth/forgot-password') ||
        endpoint.startsWith('/auth/reset-password');

      // Token expired or invalid — wipe local auth and send to sign-in so the
      // user sees a clean login screen instead of a crash or broken page.
      if (response.status === 401 && !isAuthAttempt && typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_token_expires_at');
        localStorage.removeItem('auth_user');
        window.location.href = '/signin';
        // Throw anyway so callers awaiting this don't keep running.
        throw new ApiError('Session expired', 401, data);
      }

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
  /** YYYY-MM-DD in the user's local timezone — converted to from/to ISO timestamps below. */
  date?: string;
}): Promise<any[]> {
  const query = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (k === "date") continue; // handled separately so we send local-day bounds
    if (v && v !== "All Types") query.set(k, v);
  }
  // Convert the picked YYYY-MM-DD into the *local* day's UTC boundaries so
  // a route at "04:01 Apr 26 local" matches when the user picks Apr 26 —
  // even though its UTC instant lives on Apr 25. Sending naked `date=` would
  // make the backend treat it as a UTC day, which mis-matches routes near
  // the local midnight boundary.
  if (params.date) {
    const [y, m, d] = params.date.split("-").map(Number);
    if (y && m && d) {
      const from = new Date(y, m - 1, d, 0, 0, 0, 0);
      const to = new Date(y, m - 1, d + 1, 0, 0, 0, 0);
      query.set("from", from.toISOString());
      query.set("to", to.toISOString());
    }
  }
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
  currency?: string;
  availableSeats: number;
  departureDateTime: string;
  maxReachDateTime: string;
  vehicleId: string;
  // Group-ride threshold. When set, the trip "fills" until this many
  // seats are booked, gating payment for travelers and the Confirm
  // button on the transporter side. Omit (or pass undefined) to skip
  // the threshold entirely.
  minSeatsToConfirm?: number;
  // When true and the threshold is reached, every PENDING booking
  // auto-confirms in one shot.
  autoConfirmOnFill?: boolean;
}): Promise<any> {
  return apiPost<any>('/transport', data);
}

export async function getMyRoutes(): Promise<any[]> {
  return apiGet<any[]>('/transport/my');
}

/**
 * Patch a route. Send only the fields you want to change; everything else
 * stays as-is. Used for the inline group-ride threshold edit on the routes
 * page (and any future field-level edits).
 */
export async function updateTransport(
  id: string,
  data: Partial<{
    minSeatsToConfirm: number;
    autoConfirmOnFill: boolean;
    availableSeats: number;
    price: number;
  }>,
): Promise<any> {
  return apiPatch<any>(`/transport/${id}`, data);
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

// completeBooking() removed — the legacy /booking/:id/complete endpoint was
// retired so a transporter can't unilaterally close a trip + trigger their
// own payout. Use requestBookingCompletion() (transporter side) +
// confirmBookingArrival() (traveler side) instead.

export async function createReview(bookingId: string, rating: number, feedback?: string): Promise<any> {
  return apiPost<any>(`/review`, { bookingId, rating, feedback });
}

export async function getTransporterStats(transporterId: string): Promise<any> {
  return apiGet<any>(`/review/transporter/${transporterId}/stats`);
}

export async function getTransporterReviews(transporterId: string, page: number = 1, limit: number = 5): Promise<any> {
  return apiGet<any>(`/review/transporter/${transporterId}/reviews?page=${page}&limit=${limit}`);
}

export async function getTransporterProfile(transporterId: string): Promise<any> {
  return apiGet<any>(`/review/transporter/${transporterId}/profile`);
}

/** Latest reviews across the platform — used by the marketing Testimonials section. */
export async function getRecentReviews(limit: number = 6): Promise<{ reviews: any[] }> {
  return apiGet<{ reviews: any[] }>(`/review/recent?limit=${limit}`);
}

/**
 * Public platform overview — real, live aggregate counts plus latest reviews.
 * Used by the auth left panel so we never display fabricated numbers.
 */
export type PlatformOverview = {
  stats: {
    travelers: number;
    transporters: number;
    activeRoutes: number;
    completedTrips: number;
    reviews: number;
    avgRating: number | null;
    onTimeRate: number | null;
  };
  recentReviews: Array<{
    id: string;
    rating: number;
    feedback: string | null;
    createdAt: string;
    traveler: { name: string | null; country: string | null } | null;
    transporter: { name: string | null } | null;
  }>;
};

export async function getPlatformOverview(reviewLimit: number = 4): Promise<PlatformOverview> {
  return apiGet<PlatformOverview>(`/platform/overview?reviewLimit=${reviewLimit}`);
}

// ─── Popular routes (public, marketing homepage bento) ────────────────────────
export type PopularRoute = {
  from: string;
  to: string;
  fromCountry: string;
  toCountry: string;
  bookings: number;
  minPrice: number;
  currency: string;
  vehicle: string;
  availableSeats: number;
  nextDepartureMinutes: number | null;
};

export async function getPopularRoutes(limit: number = 4): Promise<{ routes: PopularRoute[] }> {
  return apiGet<{ routes: PopularRoute[] }>(`/platform/popular-routes?limit=${limit}`);
}

// ─── Site feedback (about SmatWay itself, surfaced on homepage) ──────────────
export type SiteFeedbackUser = {
  id: string;
  name: string | null;
  country: string | null;
  accountType: "TRAVELER" | "TRANSPORTER" | null;
  avatarUrl: string | null;
};

export type SiteFeedbackEntry = {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  user?: SiteFeedbackUser | null;
};

export type SiteFeedbackStats = {
  count: number;
  avgRating: number | null;
  distribution: number[]; // [1★pct, 2★pct, 3★pct, 4★pct, 5★pct]
  recommendRate: number | null;
};

export async function createSiteFeedback(data: { rating: number; comment: string }): Promise<{
  id: string; rating: number; comment: string; createdAt: string;
}> {
  return apiPost('/feedback', data);
}

export async function getMySiteFeedback(): Promise<{ feedback: SiteFeedbackEntry[] }> {
  return apiGet('/feedback/mine');
}

export async function getRecentSiteFeedback(limit: number = 6): Promise<{ feedback: SiteFeedbackEntry[] }> {
  return apiGet(`/feedback/recent?limit=${limit}`);
}

export async function getSiteFeedbackStats(): Promise<SiteFeedbackStats> {
  return apiGet('/feedback/stats');
}

// ─── Announcements (public read for the user dashboard) ──────────────────────
export type AnnouncementAudience = 'ALL' | 'TRAVELERS_ONLY' | 'TRANSPORTERS_ONLY';

export interface PublicAnnouncement {
  id: string;
  title: string;
  body: string;
  audience: AnnouncementAudience;
  imageKeys?: string[];
  imageUrls?: (string | null)[];
  expiresAt?: string | null;
  createdAt: string;
}

export async function getAnnouncements(audience: 'TRAVELER' | 'TRANSPORTER'): Promise<{
  announcements: PublicAnnouncement[];
}> {
  return apiGet(`/announcements?audience=${audience}`);
}

// ─── Payments ────────────────────────────────────────────────────────────────
// Paystack-backed for now. Same shape will work for Flutterwave / M-Pesa once
// those are added to the backend.

export interface InitializePaymentResponse {
  authorizationUrl: string;
  accessCode: string;
  reference: string;
}

export async function initializePaystackPayment(bookingId: string): Promise<InitializePaymentResponse> {
  return apiPost(`/payments/initialize/paystack/${bookingId}`);
}

export type PaymentVerifyStatus = 'success' | 'failed' | 'pending';

export interface VerifyPaymentResponse {
  status: PaymentVerifyStatus;
  bookingId: string;
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED';
  reason?: string;
}

export async function verifyPaystackPayment(reference: string): Promise<VerifyPaymentResponse> {
  return apiGet(`/payments/verify/paystack/${reference}`);
}

export async function initializeFlutterwavePayment(bookingId: string): Promise<InitializePaymentResponse> {
  return apiPost(`/payments/initialize/flutterwave/${bookingId}`);
}

/**
 * Verify a Flutterwave payment. Pass either our tx_ref (`reference`) or
 * Flutterwave's `transaction_id` — whichever the callback URL gave us.
 */
export async function verifyFlutterwavePayment(input: {
  reference?: string;
  transactionId?: string;
}): Promise<VerifyPaymentResponse> {
  const q = new URLSearchParams();
  if (input.reference) q.set('reference', input.reference);
  if (input.transactionId) q.set('transactionId', input.transactionId);
  return apiGet(`/payments/verify/flutterwave?${q.toString()}`);
}

// ─── Booking lifecycle: pickup verification + arrival ────────────────────────

export interface VerifyPickupResponse {
  booking: { id: string; status: string };
  traveler: { id: string; name: string | null };
  route: string;
  seatsBooked: number;
}

/** Transporter scans/enters the traveler's 10-digit code at pickup. */
export async function verifyPickupCode(code: string): Promise<VerifyPickupResponse> {
  return apiPost('/booking/verify-pickup', { code });
}

/** Traveler taps "I've arrived" to close out the trip. */
export async function confirmBookingArrival(bookingId: string): Promise<{ id: string; status: string }> {
  return apiPatch(`/booking/${bookingId}/arrived`);
}

/**
 * Transporter taps "Ride completed" — pre-flag the trip so the traveler is
 * prompted to confirm. Doesn't end the trip; that still requires the
 * traveler's confirmBookingArrival() call.
 */
export async function requestBookingCompletion(bookingId: string): Promise<{ id: string; completionRequestedAt: string }> {
  return apiPatch(`/booking/${bookingId}/request-completion`);
}

// ─── Payouts (transporter side) ──────────────────────────────────────────────

export interface Bank {
  name: string;
  code: string;
  longcode: string;
}

export type PayoutProvider = 'PAYSTACK' | 'FLUTTERWAVE';

export async function listBanks(
  currency: string = 'NGN',
  provider: PayoutProvider = 'PAYSTACK',
): Promise<{ banks: Bank[] }> {
  return apiGet(
    `/payouts/banks?currency=${encodeURIComponent(currency)}&provider=${provider}`,
  );
}

export async function resolveBankAccount(
  bankCode: string,
  accountNumber: string,
  provider: PayoutProvider = 'PAYSTACK',
): Promise<{
  accountName: string;
  accountNumber: string;
}> {
  return apiGet(
    `/payouts/resolve/${encodeURIComponent(bankCode)}/${encodeURIComponent(accountNumber)}?provider=${provider}`,
  );
}

export interface PayoutAccount {
  // Paystack-side bank info
  bankCode: string | null;
  bankAccountNumber: string | null;
  bankAccountName: string | null;
  paystackRecipientCode: string | null;
  // Flutterwave-side bank info (independent of Paystack)
  flwBankCode: string | null;
  flwBankAccountNumber: string | null;
  flwBankAccountName: string | null;
  // Preferred provider (for cases where both are configured); not really
  // load-bearing anymore — actual release uses the provider the booking
  // was charged through.
  payoutProvider: PayoutProvider | null;
  // Derived: which providers are fully configured.
  configuredProviders: PayoutProvider[];
}

export async function setPayoutAccount(data: {
  bankCode: string;
  accountNumber: string;
  currency: string;
  provider?: PayoutProvider;
}): Promise<PayoutAccount> {
  return apiPut('/payouts/account', data);
}

export async function getPayoutAccount(): Promise<PayoutAccount> {
  return apiGet('/payouts/account');
}

/**
 * Disconnect one provider's payout account. Clears only that provider's
 * columns server-side; the other provider's account stays intact.
 */
export async function removePayoutAccount(
  provider: PayoutProvider,
): Promise<PayoutAccount> {
  return apiDelete(`/payouts/account?provider=${encodeURIComponent(provider)}`);
}

export type MyPayoutStatus = 'PENDING' | 'PROCESSING' | 'RELEASED' | 'FAILED';

export interface MyPayout {
  id: string;
  bookingId: string;
  grossAmount: string | number;
  commissionAmount: string | number;
  netAmount: string | number;
  currency: string;
  status: MyPayoutStatus;
  failureReason: string | null;
  createdAt: string;
  releasedAt: string | null;
  booking: {
    id: string;
    transport: { departureCity: string; destinationCity: string };
  };
}

export async function getMyPayouts(): Promise<{ payouts: MyPayout[] }> {
  return apiGet('/payouts/mine');
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

// Chat
export async function initChat(bookingId: string): Promise<any> {
  return apiPost<any>(`/chat/booking/${bookingId}`, {});
}

export async function getChatByBooking(bookingId: string): Promise<any> {
  return apiGet<any>(`/chat/booking/${bookingId}`);
}

export async function getMessages(chatId: string): Promise<any[]> {
  return apiGet<any[]>(`/chat/${chatId}/messages`);
}

export async function sendMessage(chatId: string, content: string): Promise<any> {
  return apiPost<any>(`/chat/${chatId}/messages`, { content });
}

// ─── Bug reports / suggestions ───────────────────────────────────────────────
export type BugReportKind = "BUG" | "SUGGESTION";
export type BugReportStatus = "OPEN" | "REPLIED" | "CLOSED";

export interface BugReport {
  id: string;
  kind: BugReportKind;
  subject: string;
  body: string;
  imageKeys: string[];
  imageUrls: (string | null)[];
  status: BugReportStatus;
  adminReply: string | null;
  repliedAt: string | null;
  createdAt: string;
}

/**
 * Submit a bug report or improvement suggestion. Uses multipart/form-data so
 * we can attach up to 4 image files alongside the text fields.
 */
export async function submitBugReport(input: {
  kind: BugReportKind;
  subject: string;
  body: string;
  images?: File[];
}): Promise<BugReport> {
  const formData = new FormData();
  formData.append("kind", input.kind);
  formData.append("subject", input.subject);
  formData.append("body", input.body);
  for (const file of input.images ?? []) {
    formData.append("images", file);
  }

  const url = new URL("/bug-reports", API_BASE_URL).toString();
  const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
  const response = await fetch(url, {
    method: "POST",
    body: formData,
    credentials: "include",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({} as { message?: string }));
    throw new ApiError(err.message || "Failed to submit report", response.status, err);
  }
  return response.json();
}

export async function listMyBugReports(): Promise<BugReport[]> {
  return apiGet<BugReport[]>("/bug-reports/mine");
}

export async function getMyBugReport(id: string): Promise<BugReport> {
  return apiGet<BugReport>(`/bug-reports/${id}`);
}
