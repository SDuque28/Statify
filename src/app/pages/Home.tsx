import { motion } from 'motion/react';
import { ArtistCard } from '../components/ArtistCard';
import { TrackItem } from '../components/TrackItem';
import { YearSummaryCard } from '../components/YearSummaryCard';

export function Home() {
  const topArtists = [
    {
      name: 'The Midnight',
      imageUrl:
        'https://images.unsplash.com/photo-1576978264949-aa354035987d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXNpY2lhbiUyMHBvcnRyYWl0JTIwY29uY2VydHxlbnwxfHx8fDE3NzEzNDQwOTZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      name: 'Aurora',
      imageUrl:
        'https://images.unsplash.com/photo-1602026084040-78e6134b2661?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmZW1hbGUlMjBzaW5nZXIlMjBwZXJmb3JtaW5nfGVufDF8fHx8MTc3MTI2ODkyNXww&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      name: 'Tame Impala',
      imageUrl:
        'https://images.unsplash.com/photo-1552595458-e8ad6af8aa10?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYW5kJTIwcGVyZm9ybWluZyUyMHN0YWdlfGVufDF8fHx8MTc3MTM0NDA5N3ww&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      name: 'Bon Iver',
      imageUrl:
        'https://images.unsplash.com/photo-1767000374714-93fab2581f9d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYWxlJTIwYXJ0aXN0JTIwbXVzaWNpYW58ZW58MXx8fHwxNzcxMzQ0MDk3fDA&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      name: 'ODESZA',
      imageUrl:
        'https://images.unsplash.com/photo-1692176548571-86138128e36c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaiUyMGVsZWN0cm9uaWMlMjBtdXNpY3xlbnwxfHx8fDE3NzEyNzEwNDV8MA&ixlib=rb-4.1.0&q=80&w=1080',
    },
  ];

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
          <div className="flex gap-6 overflow-x-auto pb-2">
            {topArtists.map((artist, index) => (
              <motion.div
                key={artist.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + index * 0.1 }}
              >
                <ArtistCard name={artist.name} imageUrl={artist.imageUrl} />
              </motion.div>
            ))}
          </div>
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
                key={track.trackName}
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
