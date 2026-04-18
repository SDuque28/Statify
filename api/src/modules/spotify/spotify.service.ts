import 'dotenv/config';
import {
  BadGatewayException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

export interface SpotifyTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type?: string;
  scope?: string;
}

interface SpotifyErrorResponse {
  error?: {
    status?: number;
    message?: string;
  };
  error_description?: string;
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

  constructor(private readonly prisma: PrismaService) {
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

  async saveSpotifyTokensForUser(userId: number, tokens: SpotifyTokenResponse) {
    const spotifyTokenExpiresAt = new Date(Date.now() + tokens.expires_in * 1000);

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        spotifyAccessToken: tokens.access_token,
        spotifyRefreshToken: tokens.refresh_token ?? null,
        spotifyTokenExpiresAt,
        spotifyConnectedAt: new Date(),
      },
      select: {
        id: true,
        email: true,
        spotifyTokenExpiresAt: true,
        spotifyConnectedAt: true,
      },
    });
  }

  async getAccessToken(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        spotifyAccessToken: true,
        spotifyTokenExpiresAt: true,
      },
    });

    if (!user || !user.spotifyAccessToken) {
      throw new NotFoundException('Spotify account not connected for this user');
    }

    if (
      user.spotifyTokenExpiresAt &&
      user.spotifyTokenExpiresAt.getTime() <= Date.now()
    ) {
      // TODO: Refresh the Spotify access token with the stored refresh token.
      throw new UnauthorizedException('Spotify token expired');
    }

    return user.spotifyAccessToken;
  }

  async makeSpotifyRequest<T>(userId: number, endpoint: string): Promise<T> {
    const accessToken = await this.getAccessToken(userId);
    const normalizedEndpoint = endpoint.replace(/^\/+/, '');

    let response: Response;

    try {
      response = await fetch(`https://api.spotify.com/v1/${normalizedEndpoint}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
    } catch {
      throw new BadGatewayException('Unable to reach Spotify API');
    }

    const responseBody = (await response.json().catch(() => null)) as
      | SpotifyErrorResponse
      | T
      | null;

    if (response.status === 401) {
      // TODO: Trigger refresh flow when refresh-token support is implemented.
      throw new UnauthorizedException('Spotify token expired');
    }

    if (!response.ok) {
      const message =
        responseBody &&
        typeof responseBody === 'object' &&
        'error' in responseBody &&
        responseBody.error &&
        typeof responseBody.error === 'object' &&
        'message' in responseBody.error &&
        typeof responseBody.error.message === 'string'
          ? responseBody.error.message
          : 'Spotify API request failed';

      throw new BadGatewayException(message);
    }

    return responseBody as T;
  }

  private getRequiredEnv(name: string) {
    const value = process.env[name];

    if (!value) {
      throw new InternalServerErrorException(`${name} is not defined`);
    }

    return value;
  }
}
