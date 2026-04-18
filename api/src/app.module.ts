import { Module } from '@nestjs/common';
import { PrismaModule } from './common/prisma/prisma.module';
import { HealthModule } from './modules/health/health.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [PrismaModule, HealthModule, AuthModule],
})
export class AppModule {}
