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
    <div className="group flex flex-col gap-3 rounded-lg p-3 transition-colors hover:bg-[var(--card-hover-bg)] sm:flex-row sm:items-center sm:gap-4 sm:p-4">
      <div className="flex items-center gap-3 sm:flex-1 sm:gap-4">
        <img src={albumCover} alt={trackName} className="size-12 rounded object-cover sm:size-14" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm text-[var(--text-primary)] transition-colors group-hover:text-[#1db954] sm:text-base">
            {trackName}
          </p>
          <p className="truncate text-sm text-[var(--text-secondary)]">{artistName}</p>
          <p className="truncate text-xs text-[var(--text-secondary)]">Album: {albumName}</p>
        </div>
      </div>
      <div className="border-t border-[var(--border-color)] pt-3 text-left sm:border-t-0 sm:pt-0 sm:text-right">
        <p className="text-base text-[var(--text-primary)] sm:text-lg">#{rank}</p>
        <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-secondary)] sm:text-xs">
          Top Track
        </p>
      </div>
    </div>
  );
}
