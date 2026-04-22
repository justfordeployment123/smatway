import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AccountType, Role, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { Response } from 'express';
import { PrismaService } from '../database/prisma.service';
import { StorageService } from '../../common/services/storage.service';
import { generateRawToken, hashToken } from '../../common/utils/token.util';
import { clearAuthCookies, setAuthCookies } from '../../common/utils/cookie.util';
import { MailService } from './mail/mail.service';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

const BCRYPT_ROUNDS = 12;
const RESET_TOKEN_TTL_HOURS = 1;
const REFRESH_TOKEN_TTL_DAYS = 7;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    private readonly storageService: StorageService,
  ) { }

  async validateLocalUser(email: string, password: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user?.passwordHash) return null;
    const valid = await bcrypt.compare(password, user.passwordHash);
    return valid ? user : null;
  }

  async register(dto: RegisterDto, res: Response): Promise<{ user: Omit<User, 'passwordHash'>; accessToken: string }> {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email already registered');

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        name: dto.name,
        phoneNumber: dto.phoneNumber,
        country: dto.country,
        passwordHash,
        accountType: this.normalizeAccountType(dto.accountType),
      },
    });

    const accessToken = await this.issueTokens(user, res);
    const { passwordHash: _ph, ...safeUser } = user;
    return { user: safeUser, accessToken };
  }

  async issueTokens(user: User, res: Response): Promise<string> {
    const accessToken = this.jwtService.sign(
      { sub: user.id, email: user.email, role: user.role } as any,
      { expiresIn: process.env.JWT_EXPIRES_IN ?? '15m' } as any,
    );

    const rawRefresh = generateRawToken(64);
    const tokenHash = hashToken(rawRefresh);
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000);

    await this.prisma.refreshToken.create({ data: { tokenHash, userId: user.id, expiresAt } });
    setAuthCookies(res, accessToken, rawRefresh);
    return accessToken;
  }

  async refreshTokens(rawRefreshToken: string | undefined, res: Response): Promise<void> {
    if (!rawRefreshToken) throw new UnauthorizedException('No refresh token');

    const tokenHash = hashToken(rawRefreshToken);
    const stored = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!stored || stored.expiresAt < new Date()) {
      if (stored) {
        await this.prisma.refreshToken.deleteMany({ where: { userId: stored.userId } });
      }
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    await this.prisma.refreshToken.delete({ where: { tokenHash } });
    await this.issueTokens(stored.user, res);
  }

  async logout(userId: string, rawRefreshToken: string | undefined, res: Response): Promise<void> {
    if (rawRefreshToken) {
      const tokenHash = hashToken(rawRefreshToken);
      await this.prisma.refreshToken.deleteMany({ where: { tokenHash, userId } });
    }
    clearAuthCookies(res);
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return;

    const rawToken = generateRawToken(32);
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_HOURS * 60 * 60 * 1000);

    await this.prisma.passwordResetToken.updateMany({
      where: { userId: user.id, used: false },
      data: { used: true },
    });

    await this.prisma.passwordResetToken.create({ data: { tokenHash, userId: user.id, expiresAt } });

    const resetUrl = `${process.env.WEB_URL ?? 'http://localhost:3000'}/reset-password?token=${rawToken}`;
    await this.mailService.sendPasswordReset(email, resetUrl);
  }

  async resetPassword(dto: ResetPasswordDto, res: Response): Promise<void> {
    if (dto.password !== dto.confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    const tokenHash = hashToken(dto.token);
    const record = await this.prisma.passwordResetToken.findUnique({ where: { tokenHash } });

    if (!record || record.used || record.expiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);

    await this.prisma.$transaction([
      this.prisma.passwordResetToken.update({ where: { tokenHash }, data: { used: true } }),
      this.prisma.user.update({ where: { id: record.userId }, data: { passwordHash } }),
      this.prisma.refreshToken.deleteMany({ where: { userId: record.userId } }),
    ]);

    clearAuthCookies(res);
  }

  async verifyPassword(userId: string, password: string): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.passwordHash) {
      throw new BadRequestException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new BadRequestException('Invalid password');
    }
  }

  private normalizeAccountType(
    accountType?: RegisterDto['accountType'] | 'traveler' | 'transporter',
  ): AccountType | undefined {
    if (!accountType) {
      return undefined;
    }

    const normalized = accountType.toString().toUpperCase();

    if (normalized === 'TRAVELER' || normalized === 'TRANSPORTER') {
      return normalized;
    }

    return undefined;
  }

  safeUser(user: User): Omit<User, 'passwordHash'> {
    const { passwordHash: _ph, ...safe } = user;
    return safe;
  }

  async safeUserWithPresignedUrl(user: User): Promise<Omit<User, 'passwordHash'> & { avatarUrl: string | null }> {
    const { passwordHash: _ph, ...safe } = user;

    let avatarUrl = null;
    if (user.avatarUrl) {
      try {
        avatarUrl = await this.storageService.generatePresignedUrl(user.avatarUrl);
      } catch (error) {
        avatarUrl = null;
      }
    }

    return { ...safe, avatarUrl };
  }
}
