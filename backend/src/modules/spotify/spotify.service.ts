import { randomBytes } from 'node:crypto';
import {
  BadGatewayException,
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import '../../config/load-env';
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

interface SpotifyTopTrackItem {
  id: string;
  name: string;
  popularity: number;
  external_urls?: {
    spotify?: string;
  };
  artists: Array<{
    name: string;
  }>;
  album: {
    name: string;
    images: Array<{
      url: string;
      height: number | null;
      width: number | null;
    }>;
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

interface SpotifyTopTracksResponse {
  items: SpotifyTopTrackItem[];
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
  country?: string;
  product?: string;
  images?: Array<{
    url: string;
    height: number | null;
    width: number | null;
  }>;
}

interface SpotifyStoredTokenInfo {
  spotifyAccessToken: string | null;
  spotifyRefreshToken: string | null;
  spotifyTokenExpiresAt: Date | null;
}

export interface SpotifyConnectionStatusResponse {
  connected: boolean;
  spotifyAccountId: string | null;
  spotifyDisplayName: string | null;
  spotifyEmail: string | null;
  spotifyProfileImageUrl: string | null;
  spotifyCountry: string | null;
  spotifyProduct: string | null;
  spotifyConnectedAt: Date | null;
  spotifyTokenExpiresAt: Date | null;
}

export interface SimplifiedSpotifyTrack {
  id: string;
  name: string;
  artists: string[];
  album: string;
  image: string | null;
  popularity: number;
  spotifyUrl: string | null;
}

export interface SimplifiedSpotifyArtist {
  id: string;
  name: string;
  genres: string[];
  image: string | null;
  popularity: number;
}

export interface SpotifyYearInMusicSummary {
  period: {
    type: 'spotify_long_term';
    description: string;
    generatedAt: string;
  };
  topGenre: string | null;
  topGenreFrequency: number;
  topTracksAvailable: number;
  topArtistsAvailable: number;
  topTracks: SimplifiedSpotifyTrack[];
  topArtists: SimplifiedSpotifyArtist[];
  unsupportedMetrics: {
    minutesListened: string;
    monthlyMinutes: string;
    totalTracksListened: string;
  };
  sources: Array<{
    endpoint: string;
    use: string;
  }>;
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
      show_dialog: 'true',
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

  async refreshAccessTokenForUser(
    userId: number,
    storedTokenInfo?: SpotifyStoredTokenInfo,
  ) {
    const tokenInfo =
      storedTokenInfo ??
      (await this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          spotifyAccessToken: true,
          spotifyRefreshToken: true,
          spotifyTokenExpiresAt: true,
        },
      }));

    if (!tokenInfo?.spotifyRefreshToken) {
      throw new UnauthorizedException(
        'Spotify token expired and no refresh token is available. Please reconnect your account.',
      );
    }

    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(
          `${this.clientId}:${this.clientSecret}`,
        ).toString('base64')}`,
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: tokenInfo.spotifyRefreshToken,
      }),
    });

    const responseBody = (await response.json().catch(() => null)) as
      | SpotifyTokenResponse
      | SpotifyErrorResponse
      | null;

    if (!response.ok) {
      const message =
        this.getSpotifyErrorMessage(
          responseBody,
          'Unable to refresh Spotify access token',
        ) ?? 'Unable to refresh Spotify access token';

      throw new UnauthorizedException(
        message === 'invalid_grant'
          ? 'Spotify refresh token is no longer valid. Please reconnect your account.'
          : message,
      );
    }

    if (
      !responseBody ||
      typeof responseBody !== 'object' ||
      !('access_token' in responseBody) ||
      !('expires_in' in responseBody)
    ) {
      throw new InternalServerErrorException('Spotify refresh token response is invalid');
    }

    const spotifyTokenExpiresAt = new Date(Date.now() + responseBody.expires_in * 1000);

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        spotifyAccessToken: responseBody.access_token,
        spotifyRefreshToken:
          responseBody.refresh_token ?? tokenInfo.spotifyRefreshToken,
        spotifyTokenExpiresAt,
      },
    });

    return responseBody.access_token;
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
      spotifyProfileImageUrl: profile.images?.[0]?.url ?? null,
      spotifyCountry: profile.country ?? null,
      spotifyProduct: profile.product ?? null,
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
    const connectedAt = new Date();

    try {
      return await this.prisma.$transaction(async (tx) => {
        if (profile?.id) {
          await tx.user.updateMany({
            where: {
              spotifyAccountId: profile.id,
              NOT: {
                id: userId,
              },
            },
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
        }

        return tx.user.update({
          where: { id: userId },
          data: {
            spotifyAccountId: profile?.id,
            spotifyEmail: profile?.email ?? null,
            spotifyDisplayName: profile?.display_name ?? null,
            spotifyAccessToken: tokens.access_token,
            spotifyRefreshToken: tokens.refresh_token ?? null,
            spotifyTokenExpiresAt,
            spotifyConnectedAt: connectedAt,
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
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'This Spotify account is already linked to another Statify user.',
        );
      }

      throw error;
    }
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

    let profile: SpotifyProfileResponse | null = null;

    if (user.spotifyAccessToken) {
      profile = await this.makeSpotifyRequest<SpotifyProfileResponse>(userId, 'me');
    }

    return {
      connected: Boolean(user.spotifyAccessToken),
      spotifyAccountId: profile?.id ?? user.spotifyAccountId ?? null,
      spotifyDisplayName: profile?.display_name ?? user.spotifyDisplayName ?? null,
      spotifyEmail: profile?.email ?? user.spotifyEmail ?? null,
      spotifyProfileImageUrl: profile?.images?.[0]?.url ?? null,
      spotifyCountry: profile?.country ?? null,
      spotifyProduct: profile?.product ?? null,
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
      spotifyProfileImageUrl: null,
      spotifyCountry: null,
      spotifyProduct: null,
      spotifyConnectedAt: null,
      spotifyTokenExpiresAt: null,
    };
  }

  async getAccessToken(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        spotifyAccessToken: true,
        spotifyRefreshToken: true,
        spotifyTokenExpiresAt: true,
      },
    });

    if (!user || !user.spotifyAccessToken) {
      throw new UnauthorizedException(
        'Spotify access token is missing. Please connect your Spotify account.',
      );
    }

    if (
      user.spotifyTokenExpiresAt &&
      user.spotifyTokenExpiresAt.getTime() <= Date.now()
    ) {
      return this.refreshAccessTokenForUser(userId, user);
    }

    return user.spotifyAccessToken;
  }

  async getTopTracks(
    accessToken: string,
    options?: {
      limit?: number;
      time_range?: 'short_term' | 'medium_term' | 'long_term';
    },
  ): Promise<SimplifiedSpotifyTrack[]> {
    const searchParams = new URLSearchParams();

    if (options?.limit !== undefined) {
      searchParams.set('limit', String(options.limit));
    }

    if (options?.time_range) {
      searchParams.set('time_range', options.time_range);
    }

    const endpoint = searchParams.size
      ? `me/top/tracks?${searchParams.toString()}`
      : 'me/top/tracks';

    const response = await this.makeSpotifyRequestWithAccessToken<SpotifyTopTracksResponse>(
      accessToken,
      endpoint,
    );

    return response.items.map((track) => ({
      id: track.id,
      name: track.name,
      artists: track.artists.map((artist) => artist.name),
      album: track.album.name,
      image: track.album.images[0]?.url ?? null,
      popularity: track.popularity,
      spotifyUrl: track.external_urls?.spotify ?? null,
    }));
  }

  async getTopTracksForUser(
    userId: number,
    options?: {
      limit?: number;
      time_range?: 'short_term' | 'medium_term' | 'long_term';
    },
  ): Promise<SimplifiedSpotifyTrack[]> {
    let accessToken = await this.getAccessToken(userId);

    try {
      return await this.getTopTracks(accessToken, options);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        accessToken = await this.refreshAccessTokenForUser(userId);
        return this.getTopTracks(accessToken, options);
      }

      throw error;
    }
  }

  async makeSpotifyRequest<T>(userId: number, endpoint: string): Promise<T> {
    let accessToken = await this.getAccessToken(userId);

    try {
      return await this.makeSpotifyRequestWithAccessToken<T>(accessToken, endpoint);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        accessToken = await this.refreshAccessTokenForUser(userId);
        return this.makeSpotifyRequestWithAccessToken<T>(accessToken, endpoint);
      }

      throw error;
    }
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

  async getYearInMusicSummary(userId: number): Promise<SpotifyYearInMusicSummary> {
    const [topTracksResponse, topArtistsResponse] = await Promise.all([
      this.makeSpotifyRequest<SpotifyTopTracksResponse>(
        userId,
        'me/top/tracks?time_range=long_term&limit=10',
      ),
      this.getTopArtists(userId, {
        limit: 10,
        time_range: 'long_term',
      }),
    ]);

    const topTrackItems = Array.isArray(topTracksResponse?.items)
      ? topTracksResponse.items
      : [];
    const topArtistItems = Array.isArray(topArtistsResponse?.items)
      ? topArtistsResponse.items
      : [];

    const simplifiedTopTracks = topTrackItems.map((track) => ({
      id: typeof track?.id === 'string' ? track.id : '',
      name: typeof track?.name === 'string' ? track.name : 'Unknown track',
      artists: Array.isArray(track?.artists)
        ? track.artists
            .map((artist) => (typeof artist?.name === 'string' ? artist.name : ''))
            .filter((artistName) => artistName.length > 0)
        : [],
      album:
        track?.album && typeof track.album.name === 'string'
          ? track.album.name
          : 'Unknown album',
      image:
        track?.album && Array.isArray(track.album.images)
          ? track.album.images[0]?.url ?? null
          : null,
      popularity: typeof track?.popularity === 'number' ? track.popularity : 0,
      spotifyUrl:
        track?.external_urls && typeof track.external_urls.spotify === 'string'
          ? track.external_urls.spotify
          : null,
    }));

    const simplifiedTopArtists = topArtistItems.map((artist) => ({
      id: typeof artist?.id === 'string' ? artist.id : '',
      name: typeof artist?.name === 'string' ? artist.name : 'Unknown artist',
      genres: Array.isArray(artist?.genres)
        ? artist.genres.filter((genre): genre is string => typeof genre === 'string')
        : [],
      image: Array.isArray(artist?.images) ? artist.images[0]?.url ?? null : null,
      popularity: typeof artist?.popularity === 'number' ? artist.popularity : 0,
    }));

    const genreCounts = new Map<string, number>();

    for (const artist of topArtistItems) {
      const genres = Array.isArray(artist?.genres) ? artist.genres : [];

      for (const genre of genres) {
        genreCounts.set(genre, (genreCounts.get(genre) ?? 0) + 1);
      }
    }

    const [topGenre = null, topGenreFrequency = 0] =
      [...genreCounts.entries()].sort((left, right) => right[1] - left[1])[0] ?? [];

    return {
      period: {
        type: 'spotify_long_term',
        description:
          'Based on Spotify long_term affinity data, which Spotify documents as approximately the last 1 year rather than a strict calendar year.',
        generatedAt: new Date().toISOString(),
      },
      topGenre,
      topGenreFrequency,
      topTracksAvailable:
        typeof topTracksResponse?.total === 'number'
          ? topTracksResponse.total
          : simplifiedTopTracks.length,
      topArtistsAvailable:
        typeof topArtistsResponse?.total === 'number'
          ? topArtistsResponse.total
          : simplifiedTopArtists.length,
      topTracks: simplifiedTopTracks,
      topArtists: simplifiedTopArtists,
      unsupportedMetrics: {
        minutesListened:
          'Spotify Web API does not expose yearly minutes listened for the current user.',
        monthlyMinutes:
          'Spotify Web API does not expose month-by-month listening totals for the current user.',
        totalTracksListened:
          'Spotify Web API does not expose the total number of tracks the current user listened to over a year.',
      },
      sources: [
        {
          endpoint: 'GET /v1/me/top/tracks?time_range=long_term&limit=10',
          use: 'Top tracks for the user over Spotify long_term affinity data.',
        },
        {
          endpoint: 'GET /v1/me/top/artists?time_range=long_term&limit=10',
          use: 'Top artists plus genre inference for the year summary.',
        },
      ],
    };
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
      throw new UnauthorizedException('Spotify token expired');
    }

    if (!response.ok) {
      throw new BadGatewayException(
        this.getSpotifyErrorMessage(responseBody, 'Spotify API request failed'),
      );
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

  private getSpotifyErrorMessage(payload: unknown, fallback: string) {
    if (payload && typeof payload === 'object') {
      if (
        'error_description' in payload &&
        typeof payload.error_description === 'string'
      ) {
        return payload.error_description;
      }

      if (
        'error' in payload &&
        typeof payload.error === 'object' &&
        payload.error &&
        'message' in payload.error &&
        typeof payload.error.message === 'string'
      ) {
        return payload.error.message;
      }

      if ('error' in payload && typeof payload.error === 'string') {
        return payload.error;
      }
    }

    return fallback;
  }

  private getRequiredEnv(name: string) {
    const value = process.env[name];

    if (!value) {
      throw new InternalServerErrorException(`${name} is not defined`);
    }

    return value;
  }
}
