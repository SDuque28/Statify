import type { AuthUser, LoginResponse } from './auth.service';

const ACCESS_TOKEN_KEY = 'statify.access_token';
const USER_KEY = 'statify.user';

function isBrowser() {
  return typeof window !== 'undefined';
}

function readUser() {
  if (!isBrowser()) {
    return null;
  }

  const storedUser = window.localStorage.getItem(USER_KEY);

  if (!storedUser) {
    return null;
  }

  try {
    return JSON.parse(storedUser) as AuthUser;
  } catch {
    window.localStorage.removeItem(USER_KEY);
    return null;
  }
}

export const authStorage = {
  setSession(session: LoginResponse) {
    if (!isBrowser()) {
      return;
    }

    window.localStorage.setItem(ACCESS_TOKEN_KEY, session.access_token);
    window.localStorage.setItem(USER_KEY, JSON.stringify(session.user));
  },
  getToken() {
    if (!isBrowser()) {
      return null;
    }

    return window.localStorage.getItem(ACCESS_TOKEN_KEY);
  },
  getUser() {
    return readUser();
  },
  isAuthenticated() {
    return Boolean(this.getToken());
  },
  logout() {
    if (!isBrowser()) {
      return;
    }

    window.localStorage.removeItem(ACCESS_TOKEN_KEY);
    window.localStorage.removeItem(USER_KEY);
  },
};
