// Admin auth token + identity storage. Mirrors the user-side auth helper but
// stores under a distinct key so a logged-in admin can sit alongside a user
// session in the same browser without collision.
//
// We keep the token in BOTH localStorage (for the API client to read) and a
// cookie (for the Next.js middleware to gate /dashboard routes). The cookie is
// not httpOnly because it has to be readable from JS; an httpOnly upgrade is a
// follow-up that requires backend Set-Cookie support.

export type AdminPermission = string;

export interface AdminProfile {
  id: string | null;
  username: string;
  email: string | null;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'MODERATOR';
  permissions: AdminPermission[];
  isEnvBootstrap: boolean;
}

const TOKEN_KEY = 'smatway_admin_token';
const ADMIN_KEY = 'smatway_admin_profile';
const COOKIE_NAME = 'admin_access_token';

export function getAdminToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setAdminToken(token: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
  // Mirror to cookie so middleware can verify before rendering /dashboard.
  // 1h is the default ADMIN_JWT_EXPIRES_IN; pad slightly.
  const maxAge = 60 * 60;
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(token)}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

export function getAdminProfile(): AdminProfile | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(ADMIN_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AdminProfile;
  } catch {
    return null;
  }
}

export function setAdminProfile(profile: AdminProfile) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ADMIN_KEY, JSON.stringify(profile));
}

export function clearAdminAuth() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(ADMIN_KEY);
  document.cookie = `${COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
}

/** SUPER_ADMIN bypass — otherwise check perms[]. */
export function adminCan(profile: AdminProfile | null, permission: AdminPermission): boolean {
  if (!profile) return false;
  if (profile.role === 'SUPER_ADMIN') return true;
  return profile.permissions.includes(permission);
}
