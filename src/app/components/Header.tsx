import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import logoWhite from '../../imports/LogoWhite.svg';
import logoBlack from '../../imports/LogoBlack.svg';
import { authStorage } from '../../services/auth-storage';
import {
  SpotifyServiceError,
  spotifyService,
  type SpotifyConnectionStatusResponse,
} from '../../services/spotify.service';
import { useTheme } from '../context/theme';

function getInitial(value: string) {
  return value.trim().charAt(0).toUpperCase() || 'S';
}

export function Header() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const logo = theme === 'dark' ? logoWhite : logoBlack;
  const user = authStorage.getUser();
  const [spotifyStatus, setSpotifyStatus] = useState<SpotifyConnectionStatusResponse | null>(null);

  useEffect(() => {
    let isActive = true;

    async function loadProfile() {
      if (!authStorage.isAuthenticated()) {
        return;
      }

      try {
        const response = await spotifyService.getConnectionStatus();

        if (!isActive) {
          return;
        }

        setSpotifyStatus(response);
      } catch (error) {
        if (!isActive) {
          return;
        }

        if (error instanceof SpotifyServiceError && error.status === 401) {
          authStorage.logout();
        }
      }
    }

    void loadProfile();

    return () => {
      isActive = false;
    };
  }, []);

  const email = spotifyStatus?.spotifyEmail ?? user?.email ?? '';
  const displayName =
    spotifyStatus?.spotifyDisplayName ??
    user?.email?.split('@')[0] ??
    'Profile';
  const profileImage = spotifyStatus?.spotifyProfileImageUrl;

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border-color)] bg-[var(--bg-primary)]/95 backdrop-blur-sm">
      <div className="flex w-full items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <div
          className="flex cursor-pointer items-center gap-3 sm:gap-4"
          onClick={() => navigate('/home')}
        >
          <img src={logo} alt="Statify Logo" className="h-8 w-auto sm:h-10" />
          <h1 className="text-2xl tracking-tight text-[var(--text-primary)] sm:text-3xl">
            <span className="font-bold">Statify</span>
          </h1>
        </div>
        <button
          onClick={() => navigate('/settings')}
          className="flex size-10 items-center justify-center overflow-hidden rounded-full border border-[var(--border-color)] bg-[var(--card-bg)] shadow-lg transition-colors hover:border-[#1db954]/50 sm:size-11"
          aria-label="Profile settings"
          title={displayName}
        >
          {profileImage ? (
            <img
              src={profileImage}
              alt={displayName}
              className="size-full object-cover"
            />
          ) : (
            <span className="flex size-full items-center justify-center bg-[#1db954] text-sm font-semibold text-white sm:text-base">
              {getInitial(email)}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
