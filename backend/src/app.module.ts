import { Module } from '@nestjs/common';
import './config/load-env';
import { PrismaModule } from './common/prisma/prisma.module';
import { HealthModule } from './modules/health/health.module';
import { AuthModule } from './modules/auth/auth.module';
import { SpotifyModule } from './modules/spotify/spotify.module';

@Module({
  imports: [PrismaModule, HealthModule, AuthModule, SpotifyModule],
})
export class AppModule {}
