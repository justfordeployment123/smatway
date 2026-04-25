import {
  BadRequestException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../database/prisma.service';
import { AdminPrincipal } from './admin.types';
import { AdminPermission, ALL_ADMIN_PERMISSIONS } from './admin.permissions';

@Injectable()
export class AdminAuthService {
  private readonly logger = new Logger(AdminAuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  /**
   * Login flow:
   *  1. If username + password match ADMIN_USERNAME / ADMIN_PASSWORD env vars
   *     exactly, issue a SUPER_ADMIN token bound to a synthetic "env" principal.
   *     This is the lockout escape hatch — never touches the DB.
   *  2. Otherwise, look up the admin by username OR email, verify bcrypt
   *     password, return a token with the principal's role + permissions.
   */
  async login(usernameOrEmail: string, password: string) {
    if (!usernameOrEmail || !password) {
      throw new BadRequestException('Username and password required');
    }

    const envUsername = process.env.ADMIN_USERNAME;
    const envPassword = process.env.ADMIN_PASSWORD;

    // 1) env bootstrap path
    if (
      envUsername &&
      envPassword &&
      usernameOrEmail === envUsername &&
      password === envPassword
    ) {
      const principal: AdminPrincipal = {
        id: null,
        username: envUsername,
        email: null,
        role: 'SUPER_ADMIN',
        permissions: ALL_ADMIN_PERMISSIONS,
        isEnvBootstrap: true,
      };
      return {
        accessToken: this.signToken(principal),
        principal,
      };
    }

    // 2) DB path
    const admin = await this.prisma.admin.findFirst({
      where: {
        OR: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
      },
    });
    if (!admin || !admin.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const ok = await bcrypt.compare(password, admin.passwordHash);
    if (!ok) {
      throw new UnauthorizedException('Invalid credentials');
    }

    await this.prisma.admin.update({
      where: { id: admin.id },
      data: { lastLoginAt: new Date() },
    });

    const principal: AdminPrincipal = {
      id: admin.id,
      username: admin.username,
      email: admin.email,
      role: admin.role,
      permissions: admin.permissions as AdminPermission[],
      isEnvBootstrap: false,
    };
    return { accessToken: this.signToken(principal), principal };
  }

  signToken(principal: AdminPrincipal): string {
    return this.jwt.sign(
      {
        sub: principal.id ?? `env:${principal.username}`,
        username: principal.username,
        email: principal.email,
        role: principal.role,
        permissions: principal.permissions,
        isEnvBootstrap: principal.isEnvBootstrap,
      },
      {
        secret: this.requireSecret(),
        // Cast: process.env is `string | undefined` but JwtSignOptions wants the
        // narrower `StringValue`. Same pattern used in apps/api auth.module.ts.
        expiresIn: (process.env.ADMIN_JWT_EXPIRES_IN ?? '1h') as unknown as number,
      },
    );
  }

  /**
   * Verifies the token and returns the principal. Used by JwtAdminAuthGuard.
   * For DB-backed admins, also re-fetches the row so a deactivated admin
   * cannot use a still-fresh token to keep operating.
   */
  async verify(token: string): Promise<AdminPrincipal> {
    let payload: {
      sub: string;
      username: string;
      email: string | null;
      role: AdminPrincipal['role'];
      permissions: AdminPermission[];
      isEnvBootstrap: boolean;
    };
    try {
      payload = this.jwt.verify(token, { secret: this.requireSecret() });
    } catch {
      throw new UnauthorizedException('Invalid or expired admin token');
    }

    if (payload.isEnvBootstrap) {
      // Confirm env vars haven't been rotated since the token was issued.
      const envUsername = process.env.ADMIN_USERNAME;
      if (!envUsername || envUsername !== payload.username) {
        throw new UnauthorizedException('Bootstrap admin no longer valid');
      }
      return {
        id: null,
        username: payload.username,
        email: null,
        role: 'SUPER_ADMIN',
        permissions: ALL_ADMIN_PERMISSIONS,
        isEnvBootstrap: true,
      };
    }

    const admin = await this.prisma.admin.findUnique({
      where: { id: payload.sub },
    });
    if (!admin || !admin.isActive) {
      throw new UnauthorizedException('Admin not found or deactivated');
    }
    return {
      id: admin.id,
      username: admin.username,
      email: admin.email,
      role: admin.role,
      permissions: admin.permissions as AdminPermission[],
      isEnvBootstrap: false,
    };
  }

  private requireSecret(): string {
    const secret = process.env.ADMIN_JWT_SECRET;
    if (!secret) {
      this.logger.error('ADMIN_JWT_SECRET is not set in env');
      throw new Error('ADMIN_JWT_SECRET missing');
    }
    return secret;
  }
}
