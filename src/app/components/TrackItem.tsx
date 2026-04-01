import { Bar, BarChart } from 'recharts';

interface TrackItemProps {
  albumCover: string;
  trackName: string;
  artistName: string;
  playCount: number;
}

export function TrackItem({
  albumCover,
  trackName,
  artistName,
  playCount,
}: TrackItemProps) {
  const chartData = Array.from({ length: 7 }, (_, i) => ({
    day: i,
    plays: Math.floor(Math.random() * playCount) + playCount / 2,
  }));

  return (
    <div className="group flex items-center gap-4 rounded-lg p-4 transition-colors hover:bg-[var(--card-hover-bg)]">
      <img src={albumCover} alt={trackName} className="size-14 rounded object-cover" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[var(--text-primary)] transition-colors group-hover:text-[#1db954]">
          {trackName}
        </p>
        <p className="truncate text-sm text-[var(--text-secondary)]">{artistName}</p>
      </div>
      <div className="flex items-center gap-4">
        <div className="h-12 w-24">
          <BarChart width={96} height={48} data={chartData}>
            <Bar dataKey="plays" fill="#1db954" radius={[2, 2, 0, 0]} />
          </BarChart>
        </div>
        <p className="w-20 text-right text-sm text-[var(--text-secondary)]">
          {playCount.toLocaleString()} plays
        </p>
      </div>
    </div>
  );
}
