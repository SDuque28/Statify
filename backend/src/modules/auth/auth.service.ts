import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { createHash, randomBytes } from 'node:crypto';
import { PrismaService } from '../../common/prisma/prisma.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

export interface RegisterResponse {
  id: number;
  email: string;
  createdAt: Date;
}

export interface AuthUserResponse {
  id: number;
  email: string;
}

export interface LoginResponse {
  access_token: string;
  user: AuthUserResponse;
}

export interface ForgotPasswordResponse {
  message: string;
  resetUrl: string | null;
  expiresAt: Date | null;
}

export interface ResetPasswordResponse {
  message: string;
}

@Injectable()
export class AuthService {
  private readonly resetTokenTtlMs = 30 * 60 * 1000;
  private readonly forgotPasswordMessage =
    'If an account exists for that email, password reset instructions have been prepared.';

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register({ email, password }: RegisterDto): Promise<RegisterResponse> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    return this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        createdAt: true,
      },
    });
  }

  async login({ email, password }: LoginDto): Promise<LoginResponse> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const access_token = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
    });

    return {
      access_token,
      user: {
        id: user.id,
        email: user.email,
      },
    };
  }

  async forgotPassword({
    email,
  }: ForgotPasswordDto): Promise<ForgotPasswordResponse> {
    const user = await this.prisma.user.findUnique({
      where: { email: email.trim() },
      select: { id: true, email: true },
    });

    if (!user) {
      return {
        message: this.forgotPasswordMessage,
        resetUrl: null,
        expiresAt: null,
      };
    }

    const token = randomBytes(32).toString('hex');
    const tokenHash = this.hashResetToken(token);
    const expiresAt = new Date(Date.now() + this.resetTokenTtlMs);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetTokenHash: tokenHash,
        passwordResetExpiresAt: expiresAt,
      },
    });

    const resetUrl = this.shouldExposeResetLink() ? this.buildResetUrl(token) : null;

    return {
      message: this.forgotPasswordMessage,
      resetUrl,
      expiresAt: resetUrl ? expiresAt : null,
    };
  }

  async resetPassword({
    token,
    password,
  }: ResetPasswordDto): Promise<ResetPasswordResponse> {
    const trimmedToken = token.trim();

    if (!trimmedToken) {
      throw new BadRequestException('Password reset token is required');
    }

    const tokenHash = this.hashResetToken(trimmedToken);
    const user = await this.prisma.user.findFirst({
      where: {
        passwordResetTokenHash: tokenHash,
        passwordResetExpiresAt: {
          gt: new Date(),
        },
      },
      select: {
        id: true,
      },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired password reset link');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetTokenHash: null,
        passwordResetExpiresAt: null,
      },
    });

    return {
      message: 'Password reset successful. You can now log in.',
    };
  }

  private hashResetToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }

  private buildResetUrl(token: string) {
    const frontendAppUrl = this.getFrontendAppUrl();
    const resetUrl = new URL('/reset-password', frontendAppUrl);
    resetUrl.searchParams.set('token', token);
    return resetUrl.toString();
  }

  private getFrontendAppUrl() {
    const configuredUrl = process.env.FRONTEND_APP_URL?.trim();

    if (configuredUrl) {
      try {
        return new URL(configuredUrl).toString();
      } catch {
        return 'http://localhost:5173/';
      }
    }

    return 'http://localhost:5173/';
  }

  private shouldExposeResetLink() {
    if (process.env.PASSWORD_RESET_DEV_LINKS === 'true') {
      return true;
    }

    if (process.env.PASSWORD_RESET_DEV_LINKS === 'false') {
      return false;
    }

    return process.env.NODE_ENV !== 'production';
  }
}
