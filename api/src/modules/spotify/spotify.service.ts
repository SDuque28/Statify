import 'dotenv/config';
import { randomBytes } from 'node:crypto';
import {
  BadGatewayException,
  BadRequestException,
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

interface SpotifyTopArtistItem {
  id: string;
  name: string;
  genres: string[];
  popularity: number;
  followers: {
    total: number;
  };
  images: Array<{
    url: string;
    height: number | null;
    width: number | null;
  }>;
  external_urls: {
    spotify: string;
  };
}

export interface SpotifyTopArtistsResponse {
  items: SpotifyTopArtistItem[];
  total: number;
  limit: number;
  offset: number;
  next: string | null;
  previous: string | null;
  href: string;
}

interface SpotifyProfileResponse {
  id: string;
  email?: string;
  display_name?: string | null;
}

export interface SpotifyConnectionStatusResponse {
  connected: boolean;
  spotifyAccountId: string | null;
  spotifyDisplayName: string | null;
  spotifyEmail: string | null;
  spotifyConnectedAt: Date | null;
  spotifyTokenExpiresAt: Date | null;
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
  private readonly stateStore = new Map<
    string,
    { userId: number; expiresAt: number }
  >();
  private readonly stateTtlMs = 10 * 60 * 1000;

  constructor(private readonly prisma: PrismaService) {
    this.clientId = this.getRequiredEnv('SPOTIFY_CLIENT_ID');
    this.clientSecret = this.getRequiredEnv('SPOTIFY_CLIENT_SECRET');
    this.redirectUri = this.getRequiredEnv('SPOTIFY_REDIRECT_URI');
  }

  getConnectAuthorizationUrl(userId: number) {
    const state = this.createState(userId);
    const searchParams = new URLSearchParams({
      client_id: this.clientId,
      response_type: 'code',
      redirect_uri: this.redirectUri,
      scope: this.scopes.join(' '),
      state,
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

  async connectSpotifyAccount(
    code: string,
    state: string,
  ): Promise<SpotifyConnectionStatusResponse> {
    const userId = this.consumeState(state);
    const tokens = await this.exchangeCodeForTokens(code);
    const profile = await this.makeSpotifyRequestWithAccessToken<SpotifyProfileResponse>(
      tokens.access_token,
      'me',
    );

    const user = await this.saveSpotifyTokensForUser(userId, tokens, profile);

    return {
      connected: true,
      spotifyAccountId: user.spotifyAccountId ?? null,
      spotifyDisplayName: user.spotifyDisplayName ?? null,
      spotifyEmail: user.spotifyEmail ?? null,
      spotifyConnectedAt: user.spotifyConnectedAt,
      spotifyTokenExpiresAt: user.spotifyTokenExpiresAt,
    };
  }

  async saveSpotifyTokensForUser(
    userId: number,
    tokens: SpotifyTokenResponse,
    profile?: SpotifyProfileResponse,
  ) {
    const spotifyTokenExpiresAt = new Date(Date.now() + tokens.expires_in * 1000);

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        spotifyAccountId: profile?.id,
        spotifyEmail: profile?.email ?? null,
        spotifyDisplayName: profile?.display_name ?? null,
        spotifyAccessToken: tokens.access_token,
        spotifyRefreshToken: tokens.refresh_token ?? null,
        spotifyTokenExpiresAt,
        spotifyConnectedAt: new Date(),
      },
      select: {
        id: true,
        email: true,
        spotifyAccountId: true,
        spotifyEmail: true,
        spotifyDisplayName: true,
        spotifyTokenExpiresAt: true,
        spotifyConnectedAt: true,
      },
    });
  }

  async getSpotifyConnectionStatus(
    userId: number,
  ): Promise<SpotifyConnectionStatusResponse> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        spotifyAccountId: true,
        spotifyEmail: true,
        spotifyDisplayName: true,
        spotifyAccessToken: true,
        spotifyConnectedAt: true,
        spotifyTokenExpiresAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      connected: Boolean(user.spotifyAccessToken),
      spotifyAccountId: user.spotifyAccountId ?? null,
      spotifyDisplayName: user.spotifyDisplayName ?? null,
      spotifyEmail: user.spotifyEmail ?? null,
      spotifyConnectedAt: user.spotifyConnectedAt,
      spotifyTokenExpiresAt: user.spotifyTokenExpiresAt,
    };
  }

  async disconnectSpotifyAccount(
    userId: number,
  ): Promise<SpotifyConnectionStatusResponse> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        spotifyAccountId: null,
        spotifyEmail: null,
        spotifyDisplayName: null,
        spotifyAccessToken: null,
        spotifyRefreshToken: null,
        spotifyTokenExpiresAt: null,
        spotifyConnectedAt: null,
      },
    });

    return {
      connected: false,
      spotifyAccountId: null,
      spotifyDisplayName: null,
      spotifyEmail: null,
      spotifyConnectedAt: null,
      spotifyTokenExpiresAt: null,
    };
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
    return this.makeSpotifyRequestWithAccessToken<T>(accessToken, endpoint);
  }

  getTopArtists(
    userId: number,
    options?: {
      limit?: number;
      time_range?: 'short_term' | 'medium_term' | 'long_term';
    },
  ) {
    const searchParams = new URLSearchParams();

    if (options?.limit !== undefined) {
      searchParams.set('limit', String(options.limit));
    }

    if (options?.time_range) {
      searchParams.set('time_range', options.time_range);
    }

    const endpoint = searchParams.size
      ? `me/top/artists?${searchParams.toString()}`
      : 'me/top/artists';

    return this.makeSpotifyRequest<SpotifyTopArtistsResponse>(userId, endpoint);
  }

  private async makeSpotifyRequestWithAccessToken<T>(
    accessToken: string,
    endpoint: string,
  ): Promise<T> {
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

  private createState(userId: number) {
    this.cleanupExpiredStates();

    const state = randomBytes(24).toString('hex');

    this.stateStore.set(state, {
      userId,
      expiresAt: Date.now() + this.stateTtlMs,
    });

    return state;
  }

  private consumeState(state: string) {
    this.cleanupExpiredStates();

    const storedState = this.stateStore.get(state);

    if (!storedState || storedState.expiresAt <= Date.now()) {
      this.stateStore.delete(state);
      throw new BadRequestException('Invalid or expired Spotify state');
    }

    this.stateStore.delete(state);

    return storedState.userId;
  }

  private cleanupExpiredStates() {
    const now = Date.now();

    for (const [state, value] of this.stateStore.entries()) {
      if (value.expiresAt <= now) {
        this.stateStore.delete(state);
      }
    }
  }

  private getRequiredEnv(name: string) {
    const value = process.env[name];

    if (!value) {
      throw new InternalServerErrorException(`${name} is not defined`);
    }

    return value;
  }
}
