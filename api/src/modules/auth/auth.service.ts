import { ConflictException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../common/prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';

export interface RegisterResponse {
  id: number;
  email: string;
  createdAt: Date;
}

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

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
}
