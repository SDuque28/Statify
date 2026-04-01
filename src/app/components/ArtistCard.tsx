interface ArtistCardProps {
  imageUrl: string;
  name: string;
}

export function ArtistCard({ imageUrl, name }: ArtistCardProps) {
  return (
    <div className="flex flex-col items-center gap-3 group cursor-pointer">
      <div className="relative">
        <img
          src={imageUrl}
          alt={name}
          className="size-36 rounded-full object-cover ring-2 ring-transparent group-hover:ring-[#1db954] transition-all"
        />
        <div className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/20 transition-colors" />
      </div>
      <p className="text-[var(--text-primary)] text-center group-hover:text-[#1db954] transition-colors">
        {name}
      </p>
    </div>
  );
}