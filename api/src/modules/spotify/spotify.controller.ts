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
  callback(
    @Query('code') code?: string,
    @Query('state') state?: string,
    @Query('error') error?: string,
  ): Promise<SpotifyConnectionStatusResponse> {
    if (error) {
      throw new BadRequestException(`Spotify authorization failed: ${error}`);
    }

    if (!state) {
      throw new BadRequestException('Missing Spotify state');
    }

    if (!code) {
      throw new BadRequestException('Missing Spotify authorization code');
    }

    return this.spotifyService.connectSpotifyAccount(code, state);
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
}
