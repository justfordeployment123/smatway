import { SetMetadata, applyDecorators } from '@nestjs/common';
import { AdminPermission } from './admin.permissions';

export const PERMISSIONS_METADATA_KEY = 'admin:permissions';
export const PERMISSIONS_MODE_KEY = 'admin:permissions:mode';

/**
 * Decorate a route or controller with the permissions an admin must hold to
 * call it. By default ALL listed permissions must be present; pass `{ mode: 'any' }`
 * to require just one. SUPER_ADMIN bypasses these checks entirely.
 */
export function RequirePermissions(
  ...permissions: AdminPermission[]
): MethodDecorator & ClassDecorator;
export function RequirePermissions(
  options: { mode: 'all' | 'any' },
  ...permissions: AdminPermission[]
): MethodDecorator & ClassDecorator;
export function RequirePermissions(
  ...args: unknown[]
): MethodDecorator & ClassDecorator {
  let mode: 'all' | 'any' = 'all';
  let permissions: AdminPermission[];
  if (
    args.length > 0 &&
    typeof args[0] === 'object' &&
    args[0] !== null &&
    'mode' in (args[0] as object)
  ) {
    mode = (args[0] as { mode: 'all' | 'any' }).mode;
    permissions = args.slice(1) as AdminPermission[];
  } else {
    permissions = args as AdminPermission[];
  }
  return applyDecorators(
    SetMetadata(PERMISSIONS_METADATA_KEY, permissions),
    SetMetadata(PERMISSIONS_MODE_KEY, mode),
  );
}
