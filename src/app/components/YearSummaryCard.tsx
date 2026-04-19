import { Calendar, Disc3, Music, Sparkles, TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  SpotifyServiceError,
  spotifyService,
  type SpotifyYearInMusicSummary,
} from '../../services/spotify.service';
import { authStorage } from '../../services/auth-storage';
import { useTheme } from '../context/theme';

function formatGeneratedAt(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Recently generated';
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

export function YearSummaryCard() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [summary, setSummary] = useState<SpotifyYearInMusicSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    async function loadYearSummary() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await spotifyService.getYearSummary();

        if (!isActive) {
          return;
        }

        setSummary(response);
      } catch (loadError) {
        if (!isActive) {
          return;
        }

        if (loadError instanceof SpotifyServiceError) {
          if (loadError.status === 401) {
            authStorage.logout();
            navigate('/auth', {
              replace: true,
              state: {
                reason: 'session_expired',
              },
            });
            return;
          }

          if (loadError.status === 404) {
            setError('Connect your Spotify account to generate your year in music summary.');
            return;
          }

          setError(loadError.message);
          return;
        }

        setError('We could not load your year in music summary right now.');
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    void loadYearSummary();

    return () => {
      isActive = false;
    };
  }, [navigate]);

  const panelClass =
    theme === 'light'
      ? 'rounded-lg border border-[var(--border-color)] bg-white/50 p-5 backdrop-blur-sm'
      : 'rounded-lg border border-[var(--border-color)] bg-black/30 p-5 backdrop-blur-sm';

  if (isLoading) {
    return (
      <div className="overflow-hidden rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] p-5 sm:p-6 lg:p-8">
        <div className="mb-6">
          <div className="mb-3 h-8 w-56 animate-pulse rounded bg-[var(--border-color)]/60" />
          <div className="h-4 w-72 animate-pulse rounded bg-[var(--border-color)]/50" />
        </div>

        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className={panelClass}>
              <div className="mb-4 h-5 w-24 animate-pulse rounded bg-[var(--border-color)]/50" />
              <div className="h-8 w-20 animate-pulse rounded bg-[var(--border-color)]/60" />
            </div>
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {Array.from({ length: 2 }).map((_, index) => (
            <div key={index} className={panelClass}>
              <div className="mb-4 h-6 w-32 animate-pulse rounded bg-[var(--border-color)]/50" />
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, row) => (
                  <div key={row} className="h-12 animate-pulse rounded bg-[var(--border-color)]/50" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="overflow-hidden rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] p-5 sm:p-6 lg:p-8">
        <div className="mb-4">
          <h2 className="mb-2 text-2xl text-[var(--text-primary)] sm:text-3xl">My Year in Music</h2>
          <p className="text-[var(--text-secondary)]">Spotify long-term listening summary</p>
        </div>
        <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] px-5 py-4 text-sm text-[var(--text-secondary)]">
          {error ?? 'Year summary unavailable.'}
        </div>
      </div>
    );
  }

  const stats = [
    ...(() => {
      const uniqueGenres = new Set(summary.topArtists.flatMap((artist) => artist.genres));
      const uniqueTrackArtists = new Set(summary.topTracks.flatMap((track) => track.artists));
      const uniqueAlbums = new Set(summary.topTracks.map((track) => track.album));
      const hasGenreData = uniqueGenres.size > 0;

      return [
        {
          icon: Calendar,
          label: 'Summary Window',
          value: 'Approx. 1 year',
          detail: `Generated ${formatGeneratedAt(summary.period.generatedAt)}`,
        },
        {
          icon: Music,
          label: hasGenreData ? 'Top Genre' : 'Artist Variety',
          value: hasGenreData ? (summary.topGenre ?? 'Unavailable') : uniqueTrackArtists.size.toString(),
          detail: hasGenreData
            ? summary.topGenre && summary.topGenreFrequency > 0
              ? `Appears on ${summary.topGenreFrequency} top artist${summary.topGenreFrequency === 1 ? '' : 's'}`
              : 'No genre data returned by Spotify'
            : 'Unique artists represented across your top tracks',
        },
        {
          icon: TrendingUp,
          label: hasGenreData ? 'Genre Breadth' : 'Album Variety',
          value: hasGenreData ? uniqueGenres.size.toString() : uniqueAlbums.size.toString(),
          detail: hasGenreData
            ? 'Unique genres found across your top artists'
            : 'Unique albums represented across your top tracks',
        },
        {
          icon: Disc3,
          label: 'Top Artists Ranked',
          value: summary.topArtistsAvailable.toString(),
          detail: 'Based on Spotify long_term artist affinity',
        },
      ];
    })(),
  ];

  const topTrackArtistCounts = new Map<string, number>();

  for (const track of summary.topTracks) {
    for (const artist of track.artists) {
      topTrackArtistCounts.set(artist, (topTrackArtistCounts.get(artist) ?? 0) + 1);
    }
  }

  const [mostFeaturedArtist = 'Unavailable', mostFeaturedArtistCount = 0] =
    [...topTrackArtistCounts.entries()].sort((left, right) => right[1] - left[1])[0] ?? [];

  const albumCounts = new Map<string, number>();

  for (const track of summary.topTracks) {
    albumCounts.set(track.album, (albumCounts.get(track.album) ?? 0) + 1);
  }

  const [topAlbum = 'Unavailable', topAlbumCount = 0] =
    [...albumCounts.entries()].sort((left, right) => right[1] - left[1])[0] ?? [];

  const genreBreakdown = [...summary.topArtists
    .reduce((counts, artist) => {
      for (const genre of artist.genres) {
        counts.set(genre, (counts.get(genre) ?? 0) + 1);
      }

      return counts;
    }, new Map<string, number>())
    .entries()]
    .sort((left, right) => right[1] - left[1])
    .slice(0, 6);

  const artistPresenceBreakdown = [...topTrackArtistCounts.entries()]
    .sort((left, right) => right[1] - left[1])
    .slice(0, 6);
  const secondaryBreakdown =
    genreBreakdown.length > 0 ? genreBreakdown : artistPresenceBreakdown;

  return (
    <div className="overflow-hidden rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] p-5 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h2 className="mb-2 text-2xl text-[var(--text-primary)] sm:text-3xl">My Year in Music</h2>
        <p className="text-[var(--text-secondary)]">{summary.period.description}</p>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 }}
            className={panelClass}
          >
            <div className="mb-4 flex items-start gap-3">
              <div className="rounded-lg bg-[#1db954]/20 p-2">
                <stat.icon className="size-5 text-[#1db954]" />
              </div>
              <div>
                <p className="mb-1 text-sm text-[var(--text-secondary)]">{stat.label}</p>
                <p className="text-2xl text-[var(--text-primary)]">{stat.value}</p>
              </div>
            </div>
            <p className="text-sm text-[var(--text-secondary)]">{stat.detail}</p>
          </motion.div>
        ))}
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className={panelClass}
        >
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xl text-[var(--text-primary)]">Listening Highlights</h3>
            <span className="text-sm text-[var(--text-secondary)]">Derived from top items</span>
          </div>
          <div className="space-y-3">
            <div className="rounded-lg border border-[var(--border-color)]/70 px-4 py-3">
              <p className="mb-1 text-sm text-[var(--text-secondary)]">Most Featured Artist In Top Tracks</p>
              <p className="text-lg text-[var(--text-primary)]">{mostFeaturedArtist}</p>
              <p className="text-sm text-[var(--text-secondary)]">
                Appears on {mostFeaturedArtistCount} of your top tracks
              </p>
            </div>
            <div className="rounded-lg border border-[var(--border-color)]/70 px-4 py-3">
              <p className="mb-1 text-sm text-[var(--text-secondary)]">Most Featured Album</p>
              <p className="text-lg text-[var(--text-primary)]">{topAlbum}</p>
              <p className="text-sm text-[var(--text-secondary)]">
                Appears {topAlbumCount} time{topAlbumCount === 1 ? '' : 's'} in your top tracks
              </p>
            </div>
            <div className="rounded-lg border border-[var(--border-color)]/70 px-4 py-3">
              <p className="mb-1 text-sm text-[var(--text-secondary)]">#1 Track</p>
              <p className="text-lg text-[var(--text-primary)]">
                {summary.topTracks[0]?.name ?? 'Unavailable'}
              </p>
              <p className="text-sm text-[var(--text-secondary)]">
                {summary.topTracks[0]?.artists.join(', ') ?? 'No artist data'}
              </p>
            </div>
            <div className="rounded-lg border border-[var(--border-color)]/70 px-4 py-3">
              <p className="mb-1 text-sm text-[var(--text-secondary)]">#1 Artist</p>
              <p className="text-lg text-[var(--text-primary)]">
                {summary.topArtists[0]?.name ?? 'Unavailable'}
              </p>
              <p className="text-sm text-[var(--text-secondary)]">
                {summary.topArtists[0]?.genres[0] ?? 'No genre data'}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.32 }}
          className={panelClass}
        >
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xl text-[var(--text-primary)]">
              {genreBreakdown.length > 0 ? 'Genre Breakdown' : 'Artist Presence'}
            </h3>
            <span className="text-sm text-[var(--text-secondary)]">
              {genreBreakdown.length > 0 ? 'From top artists' : 'Across top tracks'}
            </span>
          </div>
          <div className="space-y-3">
            {secondaryBreakdown.map(([label, count], index) => (
              <div
                key={label}
                className="flex items-center gap-4 rounded-lg border border-[var(--border-color)]/70 px-4 py-3"
              >
                <div className="rounded-lg bg-[#1db954]/15 p-2">
                  <Sparkles className="size-5 text-[#1db954]" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[var(--text-primary)]">{label}</p>
                  <p className="truncate text-sm text-[var(--text-secondary)]">
                    {genreBreakdown.length > 0
                      ? `Found on ${count} top artist${count === 1 ? '' : 's'}`
                      : `Appears on ${count} top track${count === 1 ? '' : 's'}`}
                  </p>
                </div>
                <span className="text-sm text-[var(--text-secondary)]">#{index + 1}</span>
              </div>
            ))}
            {genreBreakdown.length === 0 && artistPresenceBreakdown.length === 0 ? (
              <div className="rounded-lg border border-[var(--border-color)]/70 px-4 py-3 text-sm text-[var(--text-secondary)]">
                Spotify did not return enough year-summary data to build this breakdown.
              </div>
            ) : null}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
