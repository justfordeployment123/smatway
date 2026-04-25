import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../database/prisma.service';
import { JwtAdminAuthGuard } from './admin-auth.guard';
import { RequirePermissions } from './admin-permissions.decorator';
import { ADMIN_PERMISSIONS, AdminPermission } from './admin.permissions';
import { CurrentAdmin } from './current-admin.decorator';
import { AdminPrincipal } from './admin.types';
import { AdminAuditService } from './admin-audit.service';
import { AdminRole } from '@prisma/client';

class CreateAdminDto {
  email!: string;
  username!: string;
  /** Password (used directly when OTP_SEND_EMAIL=false). For invite flow leave undefined. */
  password?: string;
  role?: AdminRole;
  permissions?: AdminPermission[];
  /** When true, copy the creator's role+permissions onto the new admin. */
  cloneFromMe?: boolean;
}

class UpdateAdminDto {
  role?: AdminRole;
  permissions?: AdminPermission[];
  isActive?: boolean;
}

const SALT_ROUNDS = 12;

@Controller('admin/admins')
@UseGuards(JwtAdminAuthGuard)
export class AdminManagementController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AdminAuditService,
  ) {}

  @Get()
  @RequirePermissions(ADMIN_PERMISSIONS.ADMINS_READ)
  async list() {
    const admins = await this.prisma.admin.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        permissions: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        createdById: true,
        createdBy: { select: { id: true, username: true } },
      },
    });
    return { admins };
  }

  @Post()
  @RequirePermissions(ADMIN_PERMISSIONS.ADMINS_CREATE)
  async create(
    @Body() dto: CreateAdminDto,
    @CurrentAdmin() principal: AdminPrincipal,
    @Req() req: Request,
  ) {
    const email = (dto.email || '').trim().toLowerCase();
    const username = (dto.username || '').trim();
    if (!email || !email.includes('@')) {
      throw new BadRequestException('Valid email required');
    }
    if (username.length < 3) {
      throw new BadRequestException('Username must be at least 3 characters');
    }

    const existing = await this.prisma.admin.findFirst({
      where: { OR: [{ email }, { username }] },
    });
    if (existing) {
      throw new BadRequestException('Email or username already in use');
    }

    // Resolve role + perms. Three modes:
    //  - cloneFromMe = true → copy creator's role + permissions
    //  - explicit dto.role / dto.permissions → use those
    //  - neither → default ADMIN role with no permissions (login-only)
    let role: AdminRole;
    let permissions: AdminPermission[];

    if (dto.cloneFromMe) {
      role = principal.role;
      permissions = [...principal.permissions];
    } else {
      role = dto.role ?? AdminRole.ADMIN;
      permissions = dto.permissions ?? [];
    }

    // Only a SUPER_ADMIN can mint another SUPER_ADMIN.
    if (role === AdminRole.SUPER_ADMIN && principal.role !== AdminRole.SUPER_ADMIN) {
      throw new ForbiddenException('Only a SUPER_ADMIN can create another SUPER_ADMIN');
    }
    // Non-super-admin creators can't grant permissions they don't themselves hold.
    if (principal.role !== AdminRole.SUPER_ADMIN) {
      const overreach = permissions.filter((p) => !principal.permissions.includes(p));
      if (overreach.length > 0) {
        throw new ForbiddenException(
          `You cannot grant permissions you do not hold: ${overreach.join(', ')}`,
        );
      }
    }

    // OTP_SEND_EMAIL gating decides direct-create vs invite-link flow. The
    // invite-token table is in place for the email flow; for now we always
    // require a password (direct create) since the invite mailer wiring lives
    // in a follow-up. Frontend disables the password field when invite mode.
    const otpSendEmail = process.env.OTP_SEND_EMAIL === 'true';
    if (otpSendEmail && !dto.password) {
      throw new BadRequestException(
        'Email invite flow not yet implemented — pass a password directly while OTP_SEND_EMAIL is true.',
      );
    }
    if (!dto.password || dto.password.length < 8) {
      throw new BadRequestException('Password must be at least 8 characters');
    }

    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);
    const created = await this.prisma.admin.create({
      data: {
        email,
        username,
        passwordHash,
        role,
        permissions,
        createdById: principal.id,
      },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        permissions: true,
        isActive: true,
        createdAt: true,
      },
    });

    await this.audit.write({
      principal,
      action: 'admin.create',
      targetType: 'Admin',
      targetId: created.id,
      metadata: { email, username, role, permissions },
      ipAddress: req.ip ?? null,
      userAgent: req.headers['user-agent'] ?? null,
    });
    return { admin: created };
  }

  @Patch(':id')
  @RequirePermissions(ADMIN_PERMISSIONS.ADMINS_EDIT)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateAdminDto,
    @CurrentAdmin() principal: AdminPrincipal,
    @Req() req: Request,
  ) {
    const existing = await this.prisma.admin.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException();

    // Only SUPER_ADMIN can edit another SUPER_ADMIN, or promote to SUPER_ADMIN.
    if (
      (existing.role === AdminRole.SUPER_ADMIN || dto.role === AdminRole.SUPER_ADMIN) &&
      principal.role !== AdminRole.SUPER_ADMIN
    ) {
      throw new ForbiddenException('Only a SUPER_ADMIN can modify SUPER_ADMIN admins');
    }
    if (principal.role !== AdminRole.SUPER_ADMIN && dto.permissions) {
      const overreach = dto.permissions.filter((p) => !principal.permissions.includes(p));
      if (overreach.length > 0) {
        throw new ForbiddenException(
          `You cannot grant permissions you do not hold: ${overreach.join(', ')}`,
        );
      }
    }

    const updated = await this.prisma.admin.update({
      where: { id },
      data: {
        ...(dto.role !== undefined ? { role: dto.role } : {}),
        ...(dto.permissions !== undefined ? { permissions: dto.permissions } : {}),
        ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
      },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        permissions: true,
        isActive: true,
      },
    });
    await this.audit.write({
      principal,
      action: 'admin.update',
      targetType: 'Admin',
      targetId: id,
      metadata: { changes: dto },
      ipAddress: req.ip ?? null,
      userAgent: req.headers['user-agent'] ?? null,
    });
    return { admin: updated };
  }

  @Delete(':id')
  @RequirePermissions(ADMIN_PERMISSIONS.ADMINS_DELETE)
  async remove(
    @Param('id') id: string,
    @CurrentAdmin() principal: AdminPrincipal,
    @Req() req: Request,
  ) {
    const existing = await this.prisma.admin.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException();
    if (existing.role === AdminRole.SUPER_ADMIN && principal.role !== AdminRole.SUPER_ADMIN) {
      throw new ForbiddenException('Only a SUPER_ADMIN can delete a SUPER_ADMIN');
    }
    if (principal.id === id) {
      throw new BadRequestException('Cannot delete your own admin account');
    }
    await this.prisma.admin.delete({ where: { id } });
    await this.audit.write({
      principal,
      action: 'admin.delete',
      targetType: 'Admin',
      targetId: id,
      metadata: { email: existing.email, username: existing.username },
      ipAddress: req.ip ?? null,
      userAgent: req.headers['user-agent'] ?? null,
    });
    return { ok: true };
  }
}
