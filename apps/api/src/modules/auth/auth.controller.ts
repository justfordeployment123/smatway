import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { RegisterDto } from './dto/register.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { User } from '@prisma/client';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto, @Res({ passthrough: false }) res: Response) {
    const result = await this.authService.register(dto, res);
    res.json(result);
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(200)
  async login(@Req() req: Request, @Res({ passthrough: false }) res: Response) {
    await this.authService.issueTokens(req.user as User, res);
    res.json({ user: this.authService.safeUser(req.user as User) });
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  googleAuth() {
    // Passport redirects
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleCallback(@Req() req: Request, @Res({ passthrough: false }) res: Response) {
    const profile = req.user as { providerId: string; email: string; name: string };
    await this.authService.handleGoogleCallback(profile, res);
    const redirectTo = (req.query['redirectTo'] as string) || process.env.WEB_URL || 'http://localhost:3000';
    const allowed = (process.env.ALLOWED_REDIRECT_URLS ?? '').split(',').map(u => u.trim());
    const safeRedirect = allowed.includes(redirectTo) ? redirectTo : (process.env.WEB_URL ?? 'http://localhost:3000');
    res.redirect(safeRedirect);
  }

  @Post('refresh')
  @HttpCode(200)
  async refresh(@Req() req: Request, @Res({ passthrough: false }) res: Response) {
    await this.authService.refreshTokens(req.cookies?.refresh_token, res);
    res.json({ ok: true });
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(200)
  async logout(
    @CurrentUser() user: User,
    @Req() req: Request,
    @Res({ passthrough: false }) res: Response,
  ) {
    await this.authService.logout(user.id, req.cookies?.refresh_token, res);
    res.json({ ok: true });
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@CurrentUser() user: User) {
    return this.authService.safeUser(user);
  }

  @Throttle({ default: { limit: 3, ttl: 60000 * 15 } })
  @Post('forgot-password')
  @HttpCode(200)
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    await this.authService.forgotPassword(dto.email);
    return { message: 'If that email exists, a reset link was sent.' };
  }

  @Post('reset-password')
  @HttpCode(200)
  async resetPassword(@Body() dto: ResetPasswordDto, @Res({ passthrough: false }) res: Response) {
    await this.authService.resetPassword(dto, res);
    res.json({ ok: true });
  }
}
