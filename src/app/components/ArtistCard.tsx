interface ArtistCardProps {
  imageUrl: string;
  name: string;
}

export function ArtistCard({ imageUrl, name }: ArtistCardProps) {
  return (
    <div className="group flex min-w-0 w-full flex-col items-center gap-4 rounded-3xl px-3 py-4 text-center transition-colors hover:bg-[var(--card-hover-bg)]">
      <div className="relative w-full max-w-48">
        <img
          src={imageUrl}
          alt={name}
          className="aspect-square w-full rounded-full object-cover ring-2 ring-transparent transition-all group-hover:ring-[#1db954]"
        />
        <div className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/20 transition-colors" />
      </div>
      <p className="line-clamp-2 min-h-[3rem] w-full text-sm text-[var(--text-primary)] transition-colors group-hover:text-[#1db954] sm:text-base">
        {name}
      </p>
    </div>
  );
}
