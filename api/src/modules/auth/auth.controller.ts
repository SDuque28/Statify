import { Body, Controller, Post } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import {
  AuthService,
  type LoginResponse,
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
}
