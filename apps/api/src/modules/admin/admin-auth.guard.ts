import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { AdminAuthService } from './admin-auth.service';
import {
  PERMISSIONS_METADATA_KEY,
  PERMISSIONS_MODE_KEY,
} from './admin-permissions.decorator';
import { AdminPermission } from './admin.permissions';
import { AdminPrincipal, principalHasPermission } from './admin.types';

@Injectable()
export class JwtAdminAuthGuard implements CanActivate {
  constructor(
    private readonly authService: AdminAuthService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request & { admin?: AdminPrincipal }>();
    const token = this.extractToken(req);
    if (!token) throw new UnauthorizedException('Missing admin token');
    const principal = await this.authService.verify(token);
    req.admin = principal;

    // Permission check (if @RequirePermissions was used)
    const required = this.reflector.getAllAndOverride<AdminPermission[]>(
      PERMISSIONS_METADATA_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!required || required.length === 0) return true;

    const mode =
      this.reflector.getAllAndOverride<'all' | 'any'>(PERMISSIONS_MODE_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ?? 'all';

    const ok =
      mode === 'all'
        ? required.every((p) => principalHasPermission(principal, p))
        : required.some((p) => principalHasPermission(principal, p));

    if (!ok) {
      throw new ForbiddenException(
        `Missing required permission${required.length > 1 ? 's' : ''}: ${required.join(', ')}`,
      );
    }
    return true;
  }

  private extractToken(req: Request): string | null {
    const auth = req.headers.authorization;
    if (auth && auth.startsWith('Bearer ')) return auth.slice(7);
    // Fallback: cookie (for the admin app's middleware-checked routes)
    const cookieToken = (req as Request & { cookies?: Record<string, string> })
      .cookies?.['admin_access_token'];
    return cookieToken ?? null;
  }
}
