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
} from '../../services/spotify.service';
import { authStorage } from '../../services/auth-storage';

export function Home() {
  const navigate = useNavigate();
  const [topArtists, setTopArtists] = useState<SpotifyArtist[]>([]);
  const [isLoadingTopArtists, setIsLoadingTopArtists] = useState(true);
  const [topArtistsError, setTopArtistsError] = useState<string | null>(null);
  const artistSlots = topArtists.length > 0 ? topArtists.length : 5;

  const topTracks = [
    {
      trackName: 'Los Angeles',
      artistName: 'The Midnight',
      albumCover:
        'https://images.unsplash.com/photo-1616663395403-2e0052b8e595?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbGJ1bSUyMGNvdmVyJTIwdmlueWwlMjByZWNvcmR8ZW58MXx8fHwxNzcxMzQ0MDk4fDA&ixlib=rb-4.1.0&q=80&w=1080',
      playCount: 247,
    },
    {
      trackName: 'Runaway',
      artistName: 'Aurora',
      albumCover:
        'https://images.unsplash.com/photo-1644855640845-ab57a047320e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXNpYyUyMGFsYnVtJTIwYXJ0fGVufDF8fHx8MTc3MTM0NDA5OXww&ixlib=rb-4.1.0&q=80&w=1080',
      playCount: 198,
    },
    {
      trackName: 'The Less I Know The Better',
      artistName: 'Tame Impala',
      albumCover:
        'https://images.unsplash.com/photo-1761098524085-c20c0a1d6220?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpZSUyMGFsYnVtJTIwY292ZXJ8ZW58MXx8fHwxNzcxMzQ0MDk5fDA&ixlib=rb-4.1.0&q=80&w=1080',
      playCount: 176,
    },
    {
      trackName: 'Holocene',
      artistName: 'Bon Iver',
      albumCover:
        'https://images.unsplash.com/photo-1761814684971-fa0e7fd606e2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyb2NrJTIwYWxidW0lMjBhcnR3b3JrfGVufDF8fHx8MTc3MTM0NDA5OXww&ixlib=rb-4.1.0&q=80&w=1080',
      playCount: 154,
    },
  ];

  useEffect(() => {
    let isActive = true;

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

        if (error instanceof SpotifyServiceError) {
          if (error.status === 404) {
            setTopArtistsError('Connect your Spotify account to see your real top artists here.');
            return;
          }

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

          setTopArtistsError(error.message);
          return;
        }

        setTopArtistsError('We could not load your Spotify top artists right now.');
      } finally {
        if (isActive) {
          setIsLoadingTopArtists(false);
        }
      }
    }

    void loadTopArtists();

    return () => {
      isActive = false;
    };
  }, [navigate]);

  return (
    <div className="h-full w-full p-8">
      <div className="mb-8">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-2 text-4xl text-[var(--text-primary)]"
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
          className="rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] p-6"
        >
          <h2 className="mb-6 text-2xl text-[var(--text-primary)]">Top Artists This Month</h2>
          {isLoadingTopArtists ? (
            <div
              className="grid gap-4"
              style={{
                gridTemplateColumns: `repeat(${artistSlots}, minmax(0, 1fr))`,
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
                gridTemplateColumns: `repeat(${topArtists.length}, minmax(0, 1fr))`,
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
          className="rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] p-6"
        >
          <h2 className="mb-6 text-2xl text-[var(--text-primary)]">Your Top Tracks</h2>
          <div className="space-y-2">
            {topTracks.map((track, index) => (
              <motion.div
                key={`${track.trackName}-${track.artistName}-${index}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
              >
                <TrackItem
                  trackName={track.trackName}
                  artistName={track.artistName}
                  albumCover={track.albumCover}
                  playCount={track.playCount}
                />
              </motion.div>
            ))}
          </div>
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
