import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { MeController } from './me.controller';
import { SpotifyController } from './spotify.controller';
import { SpotifyService } from './spotify.service';

@Module({
  imports: [AuthModule],
  controllers: [SpotifyController, MeController],
  providers: [SpotifyService],
})
export class SpotifyModule {}
