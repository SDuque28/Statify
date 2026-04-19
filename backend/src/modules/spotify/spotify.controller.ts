import {
  BadRequestException,
  Controller,
  Get,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { SpotifyQueryOptionsDto } from './dto/spotify-query-options.dto';
import {
  SpotifyService,
  type SpotifyConnectionStatusResponse,
  type SpotifyTopArtistsResponse,
} from './spotify.service';

@Controller('spotify')
export class SpotifyController {
  constructor(private readonly spotifyService: SpotifyService) {}

  @Get('connect-url')
  @UseGuards(JwtAuthGuard)
  connectUrl(@CurrentUser() user: JwtPayload) {
    return {
      authUrl: this.spotifyService.getConnectAuthorizationUrl(user.sub),
    };
  }

  @Get('connect')
  @UseGuards(JwtAuthGuard)
  connect(@CurrentUser() user: JwtPayload, @Res() response: Response) {
    return response.redirect(
      this.spotifyService.getConnectAuthorizationUrl(user.sub),
    );
  }

  @Get('callback')
  async callback(
    @Query('code') code?: string,
    @Query('state') state?: string,
    @Query('error') error?: string,
    @Res() response?: Response,
  ): Promise<void> {
    if (error) {
      throw new BadRequestException(`Spotify authorization failed: ${error}`);
    }

    if (!state) {
      throw new BadRequestException('Missing Spotify state');
    }

    if (!code) {
      throw new BadRequestException('Missing Spotify authorization code');
    }

    await this.spotifyService.connectSpotifyAccount(code, state);
    response?.redirect(this.getFrontendRedirectUrl('/home', { spotify: 'connected' }));
  }

  @Get('top-artists')
  @UseGuards(JwtAuthGuard)
  topArtists(
    @Query() query: SpotifyQueryOptionsDto,
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

  @Get('status')
  @UseGuards(JwtAuthGuard)
  status(@CurrentUser() user: JwtPayload): Promise<SpotifyConnectionStatusResponse> {
    return this.spotifyService.getSpotifyConnectionStatus(user.sub);
  }

  @Post('disconnect')
  @UseGuards(JwtAuthGuard)
  disconnect(
    @CurrentUser() user: JwtPayload,
  ): Promise<SpotifyConnectionStatusResponse> {
    return this.spotifyService.disconnectSpotifyAccount(user.sub);
  }

  private getFrontendRedirectUrl(
    path: string,
    params?: Record<string, string>,
  ) {
    const frontendAppUrl = process.env.FRONTEND_APP_URL ?? 'http://localhost:5173';
    const redirectUrl = new URL(path, frontendAppUrl);

    if (params) {
      for (const [key, value] of Object.entries(params)) {
        redirectUrl.searchParams.set(key, value);
      }
    }

    return redirectUrl.toString();
  }
}
