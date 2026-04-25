import { AdminRole } from '@prisma/client';
import { AdminPermission } from './admin.permissions';

/** What gets baked into the admin JWT and attached to req.user. */
export interface AdminPrincipal {
  /** Admin row id, or null when this is the env-bypass super admin. */
  id: string | null;
  /** Username (or env username for the bootstrap admin). */
  username: string;
  /** Email — null for the env-bypass admin. */
  email: string | null;
  role: AdminRole;
  permissions: AdminPermission[];
  /** True when this principal came from ADMIN_USERNAME / ADMIN_PASSWORD env. */
  isEnvBootstrap: boolean;
}

/** Returns true if the principal is allowed to perform any one of the given permissions. */
export function principalHasPermission(
  principal: AdminPrincipal,
  permission: AdminPermission,
): boolean {
  if (principal.role === 'SUPER_ADMIN') return true;
  return principal.permissions.includes(permission);
}
