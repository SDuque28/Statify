import { BadRequestException, Controller, Get, Query, Res } from '@nestjs/common';
import type { Response } from 'express';
import { GetTopArtistsQueryDto } from './dto/get-top-artists-query.dto';
import {
  SpotifyService,
  type SpotifyTopArtistsResponse,
  type SpotifyTokenResponse,
} from './spotify.service';

@Controller('spotify')
export class SpotifyController {
  constructor(private readonly spotifyService: SpotifyService) {}

  @Get('login')
  login(@Res() response: Response) {
    return response.redirect(this.spotifyService.getAuthorizationUrl());
  }

  @Get('callback')
  callback(@Query('code') code?: string): Promise<SpotifyTokenResponse> {
    if (!code) {
      throw new BadRequestException('Missing Spotify authorization code');
    }

    // TODO: Persist tokens here once the callback can resolve the authenticated local Statify user.
    return this.spotifyService.exchangeCodeForTokens(code);
  }

  @Get('top-artists')
  topArtists(
    @Query() query: GetTopArtistsQueryDto,
  ): Promise<SpotifyTopArtistsResponse> {
    if (query.userId === undefined || Number.isNaN(query.userId)) {
      throw new BadRequestException('userId is required');
    }

    // TODO: Replace query.userId with the authenticated user id once JWT auth is connected to request context.
    return this.spotifyService.getTopArtists(query.userId, {
      limit: query.limit,
      time_range: query.time_range,
    });
  }
}
