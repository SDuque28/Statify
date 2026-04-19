import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { ArtistCard } from '../components/ArtistCard';
import { TrackItem } from '../components/TrackItem';
import { YearSummaryCard } from '../components/YearSummaryCard';
import {
  SpotifyServiceError,
  spotifyService,
  type SpotifyArtist,
  type SpotifyTopTrack,
} from '../../services/spotify.service';
import { authStorage } from '../../services/auth-storage';

export function Home() {
  const navigate = useNavigate();
  const [topArtists, setTopArtists] = useState<SpotifyArtist[]>([]);
  const [topTracks, setTopTracks] = useState<SpotifyTopTrack[]>([]);
  const [isLoadingTopArtists, setIsLoadingTopArtists] = useState(true);
  const [isLoadingTopTracks, setIsLoadingTopTracks] = useState(true);
  const [topArtistsError, setTopArtistsError] = useState<string | null>(null);
  const [topTracksError, setTopTracksError] = useState<string | null>(null);
  const artistSlots = topArtists.length > 0 ? topArtists.length : 5;
  const trackSlots = topTracks.length > 0 ? topTracks.length : 5;

  useEffect(() => {
    let isActive = true;

    function handleSpotifyError(
      error: unknown,
      fallbackMessage: string,
      missingConnectionMessage: string,
      setError: (message: string | null) => void,
    ) {
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

        if (error.status === 404) {
          setError(missingConnectionMessage);
          return;
        }

        setError(error.message);
        return;
      }

      setError(fallbackMessage);
    }

    async function loadTopArtists() {
      setIsLoadingTopArtists(true);
      setTopArtistsError(null);

      try {
        const response = await spotifyService.getTopArtists(5, 'short_term');

        if (!isActive) {
          return;
        }

        setTopArtists(response.items);
      } catch (error) {
        if (!isActive) {
          return;
        }

        handleSpotifyError(
          error,
          'We could not load your Spotify top artists right now.',
          'Connect your Spotify account to see your real top artists here.',
          setTopArtistsError,
        );
      } finally {
        if (isActive) {
          setIsLoadingTopArtists(false);
        }
      }
    }

    async function loadTopTracks() {
      setIsLoadingTopTracks(true);
      setTopTracksError(null);

      try {
        const response = await spotifyService.getTopTracks(5, 'short_term');

        if (!isActive) {
          return;
        }

        setTopTracks(response);
      } catch (error) {
        if (!isActive) {
          return;
        }

        handleSpotifyError(
          error,
          'We could not load your Spotify top tracks right now.',
          'Connect your Spotify account to see your real top tracks here.',
          setTopTracksError,
        );
      } finally {
        if (isActive) {
          setIsLoadingTopTracks(false);
        }
      }
    }

    void Promise.all([loadTopArtists(), loadTopTracks()]);

    return () => {
      isActive = false;
    };
  }, [navigate]);

  return (
    <div className="h-full w-full px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
      <div className="mb-6 sm:mb-8">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-2 text-3xl text-[var(--text-primary)] sm:text-4xl"
        >
          Dashboard
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-[var(--text-secondary)]"
        >
          Your personalized music insights
        </motion.p>
      </div>

      <div className="space-y-8">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] p-4 sm:p-6"
        >
          <h2 className="mb-5 text-xl text-[var(--text-primary)] sm:mb-6 sm:text-2xl">
            Top Artists This Month
          </h2>
          {isLoadingTopArtists ? (
            <div
              className="grid gap-4"
              style={{
                gridTemplateColumns: 'repeat(auto-fit, minmax(132px, 1fr))',
              }}
            >
              {Array.from({ length: artistSlots }).map((_, index) => (
                <div
                  key={`artist-skeleton-${index}`}
                  className="flex min-w-0 flex-col items-center gap-4 rounded-3xl px-3 py-4"
                >
                  <div className="aspect-square w-full max-w-48 animate-pulse rounded-full bg-[var(--border-color)]/60" />
                  <div className="h-4 w-full max-w-28 animate-pulse rounded bg-[var(--border-color)]/60" />
                </div>
              ))}
            </div>
          ) : topArtistsError ? (
            <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] px-5 py-4 text-sm text-[var(--text-secondary)]">
              {topArtistsError}
            </div>
          ) : topArtists.length === 0 ? (
            <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] px-5 py-4 text-sm text-[var(--text-secondary)]">
              No top artists available yet for this time range.
            </div>
          ) : (
            <div
              className="grid gap-4"
              style={{
                gridTemplateColumns: 'repeat(auto-fit, minmax(132px, 1fr))',
              }}
            >
              {topArtists.map((artist, index) => (
                <motion.a
                  key={artist.id}
                  href={artist.external_urls.spotify}
                  target="_blank"
                  rel="noreferrer"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="block min-w-0"
                >
                  <ArtistCard
                    name={artist.name}
                    imageUrl={
                      artist.images[0]?.url ??
                      `https://placehold.co/288x288/1f2937/f9fafb?text=${encodeURIComponent(artist.name)}`
                    }
                  />
                </motion.a>
              ))}
            </div>
          )}
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] p-4 sm:p-6"
        >
          <h2 className="mb-5 text-xl text-[var(--text-primary)] sm:mb-6 sm:text-2xl">
            Your Top Tracks
          </h2>
          {isLoadingTopTracks ? (
            <div className="space-y-2">
              {Array.from({ length: trackSlots }).map((_, index) => (
                <div
                  key={`track-skeleton-${index}`}
                  className="flex items-center gap-4 rounded-lg p-4"
                >
                  <div className="size-14 animate-pulse rounded bg-[var(--border-color)]/60" />
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="h-4 w-1/3 animate-pulse rounded bg-[var(--border-color)]/60" />
                    <div className="h-3 w-1/4 animate-pulse rounded bg-[var(--border-color)]/50" />
                  </div>
                  <div className="h-12 w-24 animate-pulse rounded bg-[var(--border-color)]/50" />
                  <div className="h-4 w-16 animate-pulse rounded bg-[var(--border-color)]/50" />
                </div>
              ))}
            </div>
          ) : topTracksError ? (
            <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] px-5 py-4 text-sm text-[var(--text-secondary)]">
              {topTracksError}
            </div>
          ) : topTracks.length === 0 ? (
            <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] px-5 py-4 text-sm text-[var(--text-secondary)]">
              No top tracks available yet for this time range.
            </div>
          ) : (
            <div className="space-y-2">
              {topTracks.map((track, index) => (
                <motion.div
                  key={track.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                >
                  <TrackItem
                    trackName={track.name}
                    artistName={track.artists.join(', ')}
                    albumName={track.album}
                    albumCover={
                      track.image ??
                      `https://placehold.co/96x96/1f2937/f9fafb?text=${encodeURIComponent(track.album)}`
                    }
                    rank={index + 1}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <YearSummaryCard />
        </motion.section>
      </div>
    </div>
  );
}
