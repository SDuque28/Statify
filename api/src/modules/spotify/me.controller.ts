import { BadRequestException, Controller, Get, Query, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { SpotifyQueryOptionsDto } from './dto/spotify-query-options.dto';
import {
  SpotifyService,
  type SimplifiedSpotifyTrack,
  type SpotifyYearInMusicSummary,
} from './spotify.service';

@Controller('me')
export class MeController {
  constructor(private readonly spotifyService: SpotifyService) {}

  @Get('top-tracks')
  @UseGuards(JwtAuthGuard)
  topTracks(
    @Query() query: SpotifyQueryOptionsDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<SimplifiedSpotifyTrack[]> {
    if (!user?.sub) {
      throw new BadRequestException('Authenticated user not found in request');
    }

    return this.spotifyService.getTopTracksForUser(user.sub, {
      limit: query.limit,
      time_range: query.time_range,
    });
  }

  @Get('year-summary')
  @UseGuards(JwtAuthGuard)
  yearSummary(@CurrentUser() user: JwtPayload): Promise<SpotifyYearInMusicSummary> {
    if (!user?.sub) {
      throw new BadRequestException('Authenticated user not found in request');
    }

    return this.spotifyService.getYearInMusicSummary(user.sub);
  }
}
