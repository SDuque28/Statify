import { BadRequestException, Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
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
  @UseGuards(JwtAuthGuard)
  topArtists(
    @Query() query: GetTopArtistsQueryDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<SpotifyTopArtistsResponse> {
    if (!user?.sub) {
      throw new BadRequestException('Authenticated user not found in request');
    }

    return this.spotifyService.getTopArtists(user.sub, {
      limit: query.limit,
      time_range: query.time_range,
    });
  }
}
