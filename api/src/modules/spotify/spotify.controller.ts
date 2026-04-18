import { BadRequestException, Controller, Get, Query, Res } from '@nestjs/common';
import type { Response } from 'express';
import {
  SpotifyService,
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

    return this.spotifyService.exchangeCodeForTokens(code);
  }
}
