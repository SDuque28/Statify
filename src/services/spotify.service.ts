import { authStorage } from './auth-storage';

export interface SpotifyImage {
  url: string;
  height: number | null;
  width: number | null;
}

export interface SpotifyArtist {
  id: string;
  name: string;
  genres: string[];
  popularity: number;
  followers: {
    total: number;
  };
  images: SpotifyImage[];
  external_urls: {
    spotify: string;
  };
}

export interface SpotifyTopArtistsResponse {
  items: SpotifyArtist[];
  total: number;
  limit: number;
  offset: number;
  next: string | null;
  previous: string | null;
  href: string;
}

export interface SpotifyConnectionStatusResponse {
  connected: boolean;
  spotifyAccountId: string | null;
  spotifyDisplayName: string | null;
  spotifyEmail: string | null;
  spotifyConnectedAt: string | null;
  spotifyTokenExpiresAt: string | null;
}

interface SpotifyConnectUrlResponse {
  authUrl: string;
}

export class SpotifyServiceError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'SpotifyServiceError';
    this.status = status;
  }
}

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '/api').replace(/\/$/, '');

function extractErrorMessage(payload: unknown, fallback: string) {
  if (payload && typeof payload === 'object' && 'message' in payload) {
    const { message } = payload as { message?: string | string[] };

    if (Array.isArray(message) && message.length > 0) {
      return message[0];
    }

    if (typeof message === 'string' && message.trim().length > 0) {
      return message;
    }
  }

  return fallback;
}

function getAuthToken() {
  const token = authStorage.getToken();

  if (!token) {
    throw new SpotifyServiceError('Your session has expired. Please log in again.', 401);
  }

  return token;
}

async function get<T>(path: string, query?: Record<string, string | number | undefined>) {
  const searchParams = new URLSearchParams();

  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined) {
        searchParams.set(key, String(value));
      }
    }
  }

  const queryString = searchParams.toString();
  const response = await fetch(
    `${API_BASE_URL}${path}${queryString ? `?${queryString}` : ''}`,
    {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    },
  );

  const data = (await response.json().catch(() => null)) as unknown;

  if (!response.ok) {
    throw new SpotifyServiceError(
      extractErrorMessage(data, 'We could not load your Spotify data right now.'),
      response.status,
    );
  }

  return data as T;
}

export const spotifyService = {
  getTopArtists(limit = 5, timeRange: 'short_term' | 'medium_term' | 'long_term' = 'medium_term') {
    return get<SpotifyTopArtistsResponse>('/spotify/top-artists', {
      limit,
      time_range: timeRange,
    });
  },
  getConnectionStatus() {
    return get<SpotifyConnectionStatusResponse>('/spotify/status');
  },
  async getConnectUrl() {
    const response = await get<SpotifyConnectUrlResponse>('/spotify/connect-url');
    return response.authUrl;
  },
};
