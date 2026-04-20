import { Body, Controller, Post } from '@nestjs/common';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import {
  AuthService,
  type ForgotPasswordResponse,
  type LoginResponse,
  type ResetPasswordResponse,
  type RegisterResponse,
} from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() registerDto: RegisterDto): Promise<RegisterResponse> {
    return this.authService.register(registerDto);
  }

  @Post('login')
  login(@Body() loginDto: LoginDto): Promise<LoginResponse> {
    return this.authService.login(loginDto);
  }

  @Post('forgot-password')
  forgotPassword(
    @Body() forgotPasswordDto: ForgotPasswordDto,
  ): Promise<ForgotPasswordResponse> {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Post('reset-password')
  resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
  ): Promise<ResetPasswordResponse> {
    return this.authService.resetPassword(resetPasswordDto);
  }
}
