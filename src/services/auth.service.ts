export interface AuthUser {
  id: number;
  email: string;
}

export interface RegisterResponse {
  id: number;
  email: string;
  createdAt: string;
}

export interface LoginResponse {
  access_token: string;
  user: AuthUser;
}

export class AuthServiceError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'AuthServiceError';
    this.status = status;
  }
}

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '/api').replace(/\/$/, '');

interface AuthPayload {
  email: string;
  password: string;
}

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

async function post<T>(path: string, payload: AuthPayload): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = (await response.json().catch(() => null)) as unknown;

  if (!response.ok) {
    throw new AuthServiceError(
      extractErrorMessage(data, 'Something went wrong. Please try again.'),
      response.status,
    );
  }

  return data as T;
}

export const authService = {
  register(email: string, password: string) {
    return post<RegisterResponse>('/auth/register', { email, password });
  },
  login(email: string, password: string) {
    return post<LoginResponse>('/auth/login', { email, password });
  },
};
