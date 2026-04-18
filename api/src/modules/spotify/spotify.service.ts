import 'dotenv/config';
import { BadGatewayException, Injectable, InternalServerErrorException } from '@nestjs/common';

export interface SpotifyTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type?: string;
  scope?: string;
}

@Injectable()
export class SpotifyService {
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly redirectUri: string;
  private readonly scopes = [
    'user-read-email',
    'user-read-private',
    'user-top-read',
  ];

  constructor() {
    this.clientId = this.getRequiredEnv('SPOTIFY_CLIENT_ID');
    this.clientSecret = this.getRequiredEnv('SPOTIFY_CLIENT_SECRET');
    this.redirectUri = this.getRequiredEnv('SPOTIFY_REDIRECT_URI');
  }

  getAuthorizationUrl() {
    const searchParams = new URLSearchParams({
      client_id: this.clientId,
      response_type: 'code',
      redirect_uri: this.redirectUri,
      scope: this.scopes.join(' '),
    });

    return `https://accounts.spotify.com/authorize?${searchParams.toString()}`;
  }

  async exchangeCodeForTokens(code: string): Promise<SpotifyTokenResponse> {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: this.redirectUri,
        client_id: this.clientId,
        client_secret: this.clientSecret,
      }),
    });

    const responseBody = (await response.json().catch(() => null)) as
      | SpotifyTokenResponse
      | { error?: string; error_description?: string }
      | null;

    if (!response.ok) {
      const message =
        responseBody &&
        typeof responseBody === 'object' &&
        'error_description' in responseBody &&
        typeof responseBody.error_description === 'string'
          ? responseBody.error_description
          : 'Unable to exchange Spotify authorization code for tokens';

      throw new BadGatewayException(message);
    }

    if (
      !responseBody ||
      typeof responseBody !== 'object' ||
      !('access_token' in responseBody) ||
      !('expires_in' in responseBody)
    ) {
      throw new InternalServerErrorException('Spotify token response is invalid');
    }

    return responseBody;
  }

  private getRequiredEnv(name: string) {
    const value = process.env[name];

    if (!value) {
      throw new InternalServerErrorException(`${name} is not defined`);
    }

    return value;
  }
}
