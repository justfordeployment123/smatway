// Admin API client. Attaches the admin Bearer token to every request, with a
// 401 interceptor that clears local state and bounces to /login.
import { clearAdminAuth, getAdminToken, AdminProfile } from './auth';

export const ADMIN_API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3002';

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getAdminToken();
  const headers = new Headers(init.headers ?? {});
  if (!headers.has('Content-Type') && init.body) {
    headers.set('Content-Type', 'application/json');
  }
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  const url = path.startsWith('http')
    ? path
    : `${ADMIN_API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;

  const res = await fetch(url, { ...init, headers, credentials: 'include' });
  if (res.status === 401) {
    if (typeof window !== 'undefined') {
      clearAdminAuth();
      // Don't redirect during the login request itself.
      if (!path.includes('/admin/auth/login')) {
        window.location.href = '/login';
      }
    }
  }
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = (await res.json()) as { message?: string | string[] };
      if (typeof body.message === 'string') message = body.message;
      else if (Array.isArray(body.message) && body.message.length > 0) message = body.message[0];
    } catch {
      /* leave default message */
    }
    throw new ApiError(res.status, message);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

const get = <T>(path: string) => request<T>(path);
const post = <T>(path: string, data?: unknown) =>
  request<T>(path, { method: 'POST', body: data ? JSON.stringify(data) : undefined });
const patch = <T>(path: string, data?: unknown) =>
  request<T>(path, { method: 'PATCH', body: data ? JSON.stringify(data) : undefined });
const put = <T>(path: string, data?: unknown) =>
  request<T>(path, { method: 'PUT', body: data ? JSON.stringify(data) : undefined });
const del = <T>(path: string) => request<T>(path, { method: 'DELETE' });

// ─── Auth ────────────────────────────────────────────────────────────────────

export async function adminLogin(username: string, password: string): Promise<{
  accessToken: string;
  admin: AdminProfile;
}> {
  return post('/admin/auth/login', { username, password });
}

export async function adminMe(): Promise<AdminProfile> {
  return get('/admin/auth/me');
}

// ─── Overview ────────────────────────────────────────────────────────────────

export interface AdminOverview {
  stats: {
    totalUsers: number;
    travelers: number;
    transporters: number;
    activeRoutes: number;
    totalBookings: number;
    pendingBookings: number;
    completedBookings: number;
    paidBookings: number;
    siteFeedback: number;
    reviews: number;
    publishedAnnouncements: number;
  };
  recentSignups: Array<{
    id: string;
    name: string | null;
    email: string;
    accountType: 'TRAVELER' | 'TRANSPORTER' | null;
    country: string | null;
    createdAt: string;
  }>;
  recentBookings: Array<{
    id: string;
    status: string;
    paymentStatus: string;
    totalPrice: string | number;
    seatsBooked: number;
    createdAt: string;
    traveler: { id: string; name: string | null } | null;
    transport: {
      id: string;
      departureCity: string;
      destinationCity: string;
      currency: string;
    };
  }>;
}

export async function getAdminOverview(): Promise<AdminOverview> {
  return get('/admin/overview');
}

// ─── Users ───────────────────────────────────────────────────────────────────

export interface AdminUserRow {
  id: string;
  email: string;
  name: string | null;
  phoneNumber: string | null;
  country: string | null;
  accountType: 'TRAVELER' | 'TRANSPORTER' | null;
  emailVerified: boolean;
  createdAt: string;
  _count: { bookings: number; transports: number; reviewsGiven: number };
}

export async function listAdminUsers(params: {
  search?: string;
  accountType?: 'TRAVELER' | 'TRANSPORTER';
  cursor?: string;
  limit?: number;
} = {}): Promise<{ users: AdminUserRow[]; nextCursor: string | null }> {
  const q = new URLSearchParams();
  if (params.search) q.set('search', params.search);
  if (params.accountType) q.set('accountType', params.accountType);
  if (params.cursor) q.set('cursor', params.cursor);
  if (params.limit) q.set('limit', String(params.limit));
  return get(`/admin/users?${q.toString()}`);
}

export interface AdminUserDetail {
  id: string;
  email: string;
  name: string | null;
  phoneNumber: string | null;
  country: string | null;
  accountType: 'TRAVELER' | 'TRANSPORTER' | null;
  emailVerified: boolean;
  emailVerifiedAt: string | null;
  preferredCurrency: string | null;
  createdAt: string;
  updatedAt: string;
  avatarUrl: string | null;
  profileImageUrl: string | null;
  role: 'USER' | 'ADMIN';
  profile: {
    bio: string | null;
    travelerBio: string | null;
    companyName: string | null;
    licenseNumber: string | null;
    licenseExpiry: string | null;
    vehicleType: string | null;
    emergencyContactName: string | null;
    emergencyContactPhone: string | null;
  } | null;
  _count: {
    bookings: number;
    transports: number;
    reviewsGiven: number;
    reviewsReceived: number;
    vehicles: number;
  };
  vehicles: Array<{
    id: string;
    name: string;
    model: string;
    plateNumber: string;
    transportType: 'CAR' | 'BUS' | 'VAN' | 'MINIBUS' | 'TRUCK';
    imageUrl: string | null;
    createdAt: string;
    _count: { transports: number };
  }>;
  transports: Array<{
    id: string;
    departureCity: string;
    departureCountry: string;
    destinationCity: string;
    destinationCountry: string;
    status: 'ACTIVE' | 'INACTIVE' | 'FULL';
    price: string | number;
    currency: string;
    availableSeats: number;
    departureDateTime: string;
    createdAt: string;
    vehicle: { id: string; name: string; plateNumber: string } | null;
    _count: { bookings: number };
  }>;
  bookings: Array<{
    id: string;
    status: string;
    paymentStatus: string;
    totalPrice: string | number;
    seatsBooked: number;
    createdAt: string;
    transport: {
      id: string;
      departureCity: string;
      destinationCity: string;
      currency: string;
      transporter: { id: string; name: string | null; email: string } | null;
    };
  }>;
}

export async function getAdminUser(id: string) {
  return get<{ user: AdminUserDetail }>(`/admin/users/${id}`);
}

// ─── Route detail ────────────────────────────────────────────────────────────
export interface AdminRouteDetail extends Omit<AdminRouteRow, 'transporter' | 'vehicle'> {
  bookings: Array<{
    id: string;
    status: string;
    paymentStatus: string;
    totalPrice: string | number;
    seatsBooked: number;
    createdAt: string;
    traveler: { id: string; name: string | null; email: string } | null;
  }>;
  transporter: {
    id: string;
    name: string | null;
    email: string;
    phoneNumber: string | null;
    country: string | null;
    avatarUrl: string | null;
  };
  vehicle: {
    id: string;
    name: string;
    plateNumber: string;
    model: string;
    transportType: string;
    imageUrl: string | null;
  } | null;
}

export async function getAdminRoute(id: string) {
  return get<{ route: AdminRouteDetail }>(`/admin/routes/${id}`);
}

// ─── Vehicles ────────────────────────────────────────────────────────────────
export interface AdminVehicleRow {
  id: string;
  name: string;
  model: string;
  plateNumber: string;
  transportType: 'CAR' | 'BUS' | 'VAN' | 'MINIBUS' | 'TRUCK';
  imageUrl: string | null;
  createdAt: string;
  transporter: { id: string; name: string | null; email: string } | null;
  _count: { transports: number };
}

export interface AdminVehicleDetail extends AdminVehicleRow {
  transports: Array<{
    id: string;
    departureCity: string;
    destinationCity: string;
    status: 'ACTIVE' | 'INACTIVE' | 'FULL';
    price: string | number;
    currency: string;
    availableSeats: number;
    departureDateTime: string;
  }>;
  transporter: {
    id: string;
    name: string | null;
    email: string;
    country: string | null;
    phoneNumber: string | null;
  } | null;
}

export async function listAdminVehicles(params: {
  search?: string;
  transportType?: 'CAR' | 'BUS' | 'VAN' | 'MINIBUS' | 'TRUCK';
  cursor?: string;
  limit?: number;
} = {}): Promise<{ vehicles: AdminVehicleRow[]; nextCursor: string | null }> {
  const q = new URLSearchParams();
  if (params.search) q.set('search', params.search);
  if (params.transportType) q.set('transportType', params.transportType);
  if (params.cursor) q.set('cursor', params.cursor);
  if (params.limit) q.set('limit', String(params.limit));
  return get(`/admin/vehicles?${q.toString()}`);
}

export async function getAdminVehicle(id: string) {
  return get<{ vehicle: AdminVehicleDetail }>(`/admin/vehicles/${id}`);
}

// ─── Routes ──────────────────────────────────────────────────────────────────

export interface AdminRouteRow {
  id: string;
  departureCity: string;
  departureCountry: string;
  destinationCity: string;
  destinationCountry: string;
  transportType: string;
  status: 'ACTIVE' | 'INACTIVE' | 'FULL';
  price: string | number;
  currency: string;
  availableSeats: number;
  departureDateTime: string;
  maxReachDateTime: string;
  createdAt: string;
  transporter: { id: string; name: string | null; email: string } | null;
  vehicle: { id: string; name: string; plateNumber: string } | null;
  _count: { bookings: number };
}

export async function listAdminRoutes(params: {
  search?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'FULL';
  from?: string;
  to?: string;
  cursor?: string;
  limit?: number;
} = {}): Promise<{ routes: AdminRouteRow[]; nextCursor: string | null }> {
  const q = new URLSearchParams();
  if (params.search) q.set('search', params.search);
  if (params.status) q.set('status', params.status);
  if (params.from) q.set('from', params.from);
  if (params.to) q.set('to', params.to);
  if (params.cursor) q.set('cursor', params.cursor);
  if (params.limit) q.set('limit', String(params.limit));
  return get(`/admin/routes?${q.toString()}`);
}

export async function deactivateAdminRoute(id: string) {
  return patch(`/admin/routes/${id}/deactivate`);
}

export async function activateAdminRoute(id: string) {
  return patch(`/admin/routes/${id}/activate`);
}

// ─── Bookings ────────────────────────────────────────────────────────────────

export interface AdminBookingRow {
  id: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string | null;
  totalPrice: string | number;
  seatsBooked: number;
  createdAt: string;
  traveler: { id: string; name: string | null; email: string } | null;
  transport: {
    id: string;
    departureCity: string;
    destinationCity: string;
    currency: string;
    transporter: { id: string; name: string | null } | null;
  };
  // Drives the derived "RECEIVED" stage on the row pill. Null when no payout
  // exists yet (booking hasn't reached COMPLETED) or when the payout is
  // still PENDING/PROCESSING/FAILED.
  payout?: { status: string; releasedAt: string | null } | null;
}

export async function listAdminBookings(params: {
  status?: string;
  paymentStatus?: string;
  from?: string;
  to?: string;
  cursor?: string;
  limit?: number;
} = {}): Promise<{ bookings: AdminBookingRow[]; nextCursor: string | null }> {
  const q = new URLSearchParams();
  if (params.status) q.set('status', params.status);
  if (params.paymentStatus) q.set('paymentStatus', params.paymentStatus);
  if (params.from) q.set('from', params.from);
  if (params.to) q.set('to', params.to);
  if (params.cursor) q.set('cursor', params.cursor);
  if (params.limit) q.set('limit', String(params.limit));
  return get(`/admin/bookings?${q.toString()}`);
}

export interface AdminBookingStats {
  byStatus: Record<"PENDING" | "CONFIRMED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED", number>;
  byPayment: Record<"PENDING" | "PAID" | "FAILED", number>;
}

/**
 * Admin force-cancel a booking. Backend refunds the seats and notifies both
 * traveler + transporter. Returns `refundRequired: true` if the booking was
 * already PAID — finance still has to issue the money refund manually.
 */
export async function adminCancelBooking(
  id: string,
  reason?: string,
): Promise<{ booking: AdminBookingRow; refundRequired: boolean }> {
  return patch(`/admin/bookings/${id}/cancel`, { reason });
}

export async function getAdminBookingStats(params: {
  status?: string;
  paymentStatus?: string;
  from?: string;
  to?: string;
} = {}): Promise<AdminBookingStats> {
  const q = new URLSearchParams();
  if (params.status) q.set('status', params.status);
  if (params.paymentStatus) q.set('paymentStatus', params.paymentStatus);
  if (params.from) q.set('from', params.from);
  if (params.to) q.set('to', params.to);
  return get(`/admin/bookings/stats?${q.toString()}`);
}

// ─── Finance ─────────────────────────────────────────────────────────────────

export interface AdminFinanceSummary {
  currencies: Array<{
    currency: string;
    paidGross: number;
    paidBookings: number;
    completedGross: number;
    completedBookings: number;
    /** Platform revenue from completed bookings — sum of commissionAmount on the payouts. */
    completedCommission: number;
  }>;
  pendingPayments: number;
  failedPayments: number;
  totalBookings: number;
}

export async function getAdminFinanceSummary(): Promise<AdminFinanceSummary> {
  return get('/admin/finance/summary');
}

export interface AdminTopTransporter {
  transporterId: string;
  name: string | null;
  email: string;
  bookings: number;
  byCurrency: Record<string, number>;
}

export async function getAdminTopTransporters(limit = 10): Promise<{
  transporters: AdminTopTransporter[];
}> {
  return get(`/admin/finance/top-transporters?limit=${limit}`);
}

// ─── Feedback (site) ─────────────────────────────────────────────────────────

export interface AdminSiteFeedback {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    accountType: 'TRAVELER' | 'TRANSPORTER' | null;
    country: string | null;
  } | null;
}

export async function listAdminFeedback(params: { cursor?: string; limit?: number } = {}): Promise<{
  feedback: AdminSiteFeedback[];
  nextCursor: string | null;
}> {
  const q = new URLSearchParams();
  if (params.cursor) q.set('cursor', params.cursor);
  if (params.limit) q.set('limit', String(params.limit));
  return get(`/admin/feedback?${q.toString()}`);
}

export async function deleteAdminFeedback(id: string) {
  return del(`/admin/feedback/${id}`);
}

// ─── Reviews (per-trip) ──────────────────────────────────────────────────────

export interface AdminReviewRow {
  id: string;
  rating: number;
  feedback: string | null;
  createdAt: string;
  traveler: { id: string; name: string | null; email: string; country: string | null } | null;
  transporter: { id: string; name: string | null; email: string } | null;
  booking: { id: string };
}

export async function listAdminReviews(params: { cursor?: string; limit?: number } = {}): Promise<{
  reviews: AdminReviewRow[];
  nextCursor: string | null;
}> {
  const q = new URLSearchParams();
  if (params.cursor) q.set('cursor', params.cursor);
  if (params.limit) q.set('limit', String(params.limit));
  return get(`/admin/reviews?${q.toString()}`);
}

export async function deleteAdminReview(id: string) {
  return del(`/admin/reviews/${id}`);
}

// ─── Announcements ───────────────────────────────────────────────────────────

export type AnnouncementAudience = 'ALL' | 'TRAVELERS_ONLY' | 'TRANSPORTERS_ONLY';

export interface AdminAnnouncement {
  id: string;
  title: string;
  body: string;
  audience: AnnouncementAudience;
  isPublished: boolean;
  imageKeys: string[];
  imageUrls: (string | null)[];
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
  createdByAdmin: { id: string; username: string; email: string } | null;
}

export async function listAdminAnnouncements(audience?: AnnouncementAudience): Promise<{
  announcements: AdminAnnouncement[];
}> {
  const q = audience ? `?audience=${audience}` : '';
  return get(`/admin/announcements${q}`);
}

/**
 * Create an announcement. Multipart so up to 4 images can ride along with
 * the text fields. `expiresInDays` defaults to 7 server-side; pass 0 (or
 * undefined) to keep that default; pass a negative number to disable
 * expiry entirely (super-admin pinned banner case).
 */
export async function createAdminAnnouncement(data: {
  title: string;
  body: string;
  audience: AnnouncementAudience;
  isPublished?: boolean;
  expiresInDays?: number;
  images?: File[];
}): Promise<{ announcement: AdminAnnouncement }> {
  const formData = new FormData();
  formData.append('title', data.title);
  formData.append('body', data.body);
  formData.append('audience', data.audience);
  if (data.isPublished !== undefined) formData.append('isPublished', String(data.isPublished));
  if (data.expiresInDays !== undefined) formData.append('expiresInDays', String(data.expiresInDays));
  for (const file of data.images ?? []) formData.append('images', file);

  const url = `${ADMIN_API_BASE_URL}/admin/announcements`;
  const token = getAdminToken();
  const res = await fetch(url, {
    method: 'POST',
    body: formData,
    credentials: 'include',
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({} as { message?: string }));
    throw new ApiError(res.status, err.message || 'Failed to create announcement');
  }
  return res.json();
}

export async function updateAdminAnnouncement(id: string, data: Partial<{
  title: string;
  body: string;
  audience: AnnouncementAudience;
  isPublished: boolean;
  expiresInDays: number;
  clearExpiry: boolean;
}>) {
  return patch<{ announcement: AdminAnnouncement }>(`/admin/announcements/${id}`, data);
}

export async function deleteAdminAnnouncement(id: string) {
  return del(`/admin/announcements/${id}`);
}

// ─── Admin management ────────────────────────────────────────────────────────

export interface AdminManagementRow {
  id: string;
  email: string;
  username: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'MODERATOR';
  permissions: string[];
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  createdById: string | null;
  createdBy: { id: string; username: string } | null;
}

export async function listAdmins(): Promise<{ admins: AdminManagementRow[] }> {
  return get('/admin/admins');
}

export async function createAdmin(data: {
  email: string;
  username: string;
  password?: string;
  role?: 'SUPER_ADMIN' | 'ADMIN' | 'MODERATOR';
  permissions?: string[];
  cloneFromMe?: boolean;
}) {
  return post<{ admin: AdminManagementRow }>('/admin/admins', data);
}

export async function updateAdmin(id: string, data: Partial<{
  role: 'SUPER_ADMIN' | 'ADMIN' | 'MODERATOR';
  permissions: string[];
  isActive: boolean;
}>) {
  return patch<{ admin: AdminManagementRow }>(`/admin/admins/${id}`, data);
}

export async function deleteAdmin(id: string) {
  return del(`/admin/admins/${id}`);
}

// ─── Audit log ───────────────────────────────────────────────────────────────

export interface AdminAuditEntry {
  id: string;
  adminId: string | null;
  adminLabel: string;
  action: string;
  targetType: string | null;
  targetId: string | null;
  metadata: Record<string, unknown> | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}

export async function listAdminAuditLog(params: {
  cursor?: string;
  limit?: number;
  from?: string;
  to?: string;
} = {}): Promise<{
  logs: AdminAuditEntry[];
  nextCursor: string | null;
}> {
  const q = new URLSearchParams();
  if (params.cursor) q.set('cursor', params.cursor);
  if (params.limit) q.set('limit', String(params.limit));
  if (params.from) q.set('from', params.from);
  if (params.to) q.set('to', params.to);
  return get(`/admin/audit?${q.toString()}`);
}

// ─── Payouts ─────────────────────────────────────────────────────────────────

export type PayoutStatus = 'PENDING' | 'PROCESSING' | 'RELEASED' | 'FAILED';

export type PayoutTrigger = 'AUTO' | 'MANUAL';

export interface AdminPayoutRow {
  id: string;
  bookingId: string;
  transporterId: string;
  grossAmount: string | number;
  commissionRate: string | number;
  commissionAmount: string | number;
  netAmount: string | number;
  currency: string;
  status: PayoutStatus;
  releaseTrigger: PayoutTrigger | null;
  paystackRecipientCode: string | null;
  paystackTransferCode: string | null;
  paystackTransferReference: string | null;
  failureReason: string | null;
  createdAt: string;
  releasedAt: string | null;
  failedAt: string | null;
  transporter: { id: string; name: string | null; email: string; paystackRecipientCode: string | null } | null;
  booking: {
    id: string;
    seatsBooked: number;
    transport: { id: string; departureCity: string; destinationCity: string };
  };
}

export async function listAdminPayouts(params: {
  status?: PayoutStatus;
  cursor?: string;
  limit?: number;
} = {}): Promise<{ payouts: AdminPayoutRow[]; nextCursor: string | null }> {
  const q = new URLSearchParams();
  if (params.status) q.set('status', params.status);
  if (params.cursor) q.set('cursor', params.cursor);
  if (params.limit) q.set('limit', String(params.limit));
  return get(`/admin/payouts?${q.toString()}`);
}

export async function releaseAdminPayout(id: string) {
  return post(`/admin/payouts/${id}/release`);
}

export async function reconcileAdminPayout(id: string) {
  return post<{ status: PayoutStatus }>(`/admin/payouts/${id}/reconcile`);
}

export async function markAdminPayoutFailed(id: string, reason: string) {
  return post<{ payout: AdminPayoutRow }>(`/admin/payouts/${id}/mark-failed`, { reason });
}

// ─── Platform settings ───────────────────────────────────────────────────────
export interface PlatformSettings {
  commissionRate: number;       // 0..0.5 (0% .. 50%)
  autoPayoutEnabled: boolean;
  updatedAt: string | null;
  updatedByAdminId: string | null;
}

export async function getPlatformSettings(): Promise<PlatformSettings> {
  return get('/admin/settings');
}

export async function updatePlatformSettings(input: {
  commissionRate?: number;
  autoPayoutEnabled?: boolean;
}): Promise<{ settings: PlatformSettings }> {
  return put('/admin/settings', input);
}

// ─── Bug reports ─────────────────────────────────────────────────────────────
export type BugReportKind = "BUG" | "SUGGESTION";
export type BugReportStatus = "OPEN" | "REPLIED" | "CLOSED";

export interface AdminBugReportRow {
  id: string;
  kind: BugReportKind;
  subject: string;
  body: string;
  imageKeys: string[];
  imageUrls: (string | null)[];
  status: BugReportStatus;
  adminReply: string | null;
  repliedAt: string | null;
  repliedByAdminId: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    accountType: 'TRAVELER' | 'TRANSPORTER' | null;
    country?: string | null;
  };
}

export async function listAdminBugReports(params: {
  kind?: BugReportKind;
  status?: BugReportStatus;
  cursor?: string;
  limit?: number;
} = {}): Promise<{ reports: AdminBugReportRow[]; nextCursor: string | null }> {
  const q = new URLSearchParams();
  if (params.kind) q.set('kind', params.kind);
  if (params.status) q.set('status', params.status);
  if (params.cursor) q.set('cursor', params.cursor);
  if (params.limit) q.set('limit', String(params.limit));
  return get(`/admin/bug-reports?${q.toString()}`);
}

export async function getAdminBugReportCounts(): Promise<Record<BugReportStatus, number>> {
  return get('/admin/bug-reports/counts');
}

export async function getAdminBugReport(id: string): Promise<AdminBugReportRow> {
  return get(`/admin/bug-reports/${id}`);
}

export async function replyAdminBugReport(id: string, reply: string): Promise<AdminBugReportRow> {
  return patch(`/admin/bug-reports/${id}/reply`, { reply });
}

export async function closeAdminBugReport(id: string): Promise<AdminBugReportRow> {
  return patch(`/admin/bug-reports/${id}/close`);
}
