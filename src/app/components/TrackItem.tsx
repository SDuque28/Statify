interface TrackItemProps {
  albumCover: string;
  trackName: string;
  artistName: string;
  albumName: string;
  rank: number;
}

export function TrackItem({
  albumCover,
  trackName,
  artistName,
  albumName,
  rank,
}: TrackItemProps) {
  return (
    <div className="group flex items-center gap-4 rounded-lg p-4 transition-colors hover:bg-[var(--card-hover-bg)]">
      <img src={albumCover} alt={trackName} className="size-14 rounded object-cover" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[var(--text-primary)] transition-colors group-hover:text-[#1db954]">
          {trackName}
        </p>
        <p className="truncate text-sm text-[var(--text-secondary)]">{artistName}</p>
        <p className="truncate text-xs text-[var(--text-secondary)]">Album: {albumName}</p>
      </div>
      <div className="text-right">
        <p className="text-lg text-[var(--text-primary)]">#{rank}</p>
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)]">
          Top Track
        </p>
      </div>
    </div>
  );
}
