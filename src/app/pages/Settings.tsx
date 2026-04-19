import { ArrowLeft, LogOut } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { authStorage } from '../../services/auth-storage';
import {
  SpotifyServiceError,
  spotifyService,
  type SpotifyConnectionStatusResponse,
} from '../../services/spotify.service';
import { ThemePreference } from '../components/ThemePreference';
import { UserProfileCard } from '../components/UserProfileCard';

function formatDate(value: string | null) {
  if (!value) {
    return 'Unavailable';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Unavailable';
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

export function Settings() {
  const navigate = useNavigate();
  const user = authStorage.getUser();
  const [spotifyStatus, setSpotifyStatus] = useState<SpotifyConnectionStatusResponse | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    async function loadProfile() {
      setIsLoadingProfile(true);
      setProfileError(null);

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

        if (error instanceof SpotifyServiceError) {
          if (error.status === 401) {
            authStorage.logout();
            navigate('/auth', {
              replace: true,
              state: {
                reason: 'session_expired',
              },
            });
            return;
          }

          setProfileError(error.message);
          return;
        }

        setProfileError('We could not load your profile right now.');
      } finally {
        if (isActive) {
          setIsLoadingProfile(false);
        }
      }
    }

    void loadProfile();

    return () => {
      isActive = false;
    };
  }, [navigate]);

  const handleLogout = () => {
    authStorage.logout();
    navigate('/auth');
  };

  const displayName =
    spotifyStatus?.spotifyDisplayName ??
    user?.email?.split('@')[0] ??
    'Statify User';
  const email =
    spotifyStatus?.spotifyEmail ??
    user?.email ??
    'No active session';
  const profileDetails = [
    {
      label: 'Account Source',
      value: spotifyStatus?.connected ? 'Spotify Connected' : 'Local Account',
    },
    {
      label: 'Spotify ID',
      value: spotifyStatus?.spotifyAccountId ?? 'Unavailable',
    },
    {
      label: 'Connected Since',
      value: formatDate(spotifyStatus?.spotifyConnectedAt ?? null),
    },
    {
      label: 'Token Expires',
      value: formatDate(spotifyStatus?.spotifyTokenExpiresAt ?? null),
    },
  ];

  return (
    <div className="w-full px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
      <button
        onClick={() => navigate('/home')}
        className="mb-6 flex items-center gap-2 text-sm text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)] sm:text-base"
      >
        <ArrowLeft className="size-5" />
        Back to Dashboard
      </button>

      <div className="mb-8">
        <h1 className="mb-2 text-2xl text-[var(--text-primary)] sm:text-3xl">Settings</h1>
        <p className="text-[var(--text-secondary)]">Manage your profile and preferences</p>
      </div>

      <div className="space-y-6">
        {isLoadingProfile ? (
          <div className="rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] p-5 sm:p-6">
            <div className="mb-5 flex flex-col items-center gap-4 sm:flex-row">
              <div className="size-[4.5rem] animate-pulse rounded-full bg-[var(--border-color)]/60 sm:size-20" />
              <div className="w-full space-y-2">
                <div className="mx-auto h-6 w-40 animate-pulse rounded bg-[var(--border-color)]/60 sm:mx-0" />
                <div className="mx-auto h-4 w-56 animate-pulse rounded bg-[var(--border-color)]/50 sm:mx-0" />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] px-4 py-3"
                >
                  <div className="mb-2 h-3 w-20 animate-pulse rounded bg-[var(--border-color)]/50" />
                  <div className="h-4 w-24 animate-pulse rounded bg-[var(--border-color)]/60" />
                </div>
              ))}
            </div>
          </div>
        ) : profileError ? (
          <div className="rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] p-5 text-sm text-[var(--text-secondary)] sm:p-6">
            {profileError}
          </div>
        ) : (
          <UserProfileCard
            profileImage={spotifyStatus?.spotifyProfileImageUrl}
            displayName={displayName}
            email={email}
            details={profileDetails}
          />
        )}
        <ThemePreference />
        <button
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-3 rounded-lg border border-red-600/30 bg-red-600/10 px-6 py-3 text-red-500 transition-colors hover:bg-red-600/20 sm:w-auto sm:justify-start"
        >
          <LogOut className="size-5" />
          Log Out
        </button>
      </div>
    </div>
  );
}
