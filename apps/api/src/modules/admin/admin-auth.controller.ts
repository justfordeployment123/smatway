import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { AdminAuthService } from './admin-auth.service';
import { AdminAuditService } from './admin-audit.service';
import { JwtAdminAuthGuard } from './admin-auth.guard';
import { CurrentAdmin } from './current-admin.decorator';
import { AdminPrincipal } from './admin.types';

class AdminLoginDto {
  username!: string;
  password!: string;
}

@Controller('admin/auth')
export class AdminAuthController {
  constructor(
    private readonly authService: AdminAuthService,
    private readonly auditService: AdminAuditService,
  ) {}

  @Post('login')
  @HttpCode(200)
  async login(@Body() dto: AdminLoginDto, @Req() req: Request) {
    const result = await this.authService.login(dto.username, dto.password);
    await this.auditService.write({
      principal: result.principal,
      action: 'admin.login',
      ipAddress: req.ip ?? null,
      userAgent: req.headers['user-agent'] ?? null,
    });
    return {
      accessToken: result.accessToken,
      admin: {
        id: result.principal.id,
        username: result.principal.username,
        email: result.principal.email,
        role: result.principal.role,
        permissions: result.principal.permissions,
        isEnvBootstrap: result.principal.isEnvBootstrap,
      },
    };
  }

  @Get('me')
  @UseGuards(JwtAdminAuthGuard)
  me(@CurrentAdmin() principal: AdminPrincipal) {
    return {
      id: principal.id,
      username: principal.username,
      email: principal.email,
      role: principal.role,
      permissions: principal.permissions,
      isEnvBootstrap: principal.isEnvBootstrap,
    };
  }
}
