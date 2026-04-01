interface UserProfileCardProps {
  profileImage: string;
  displayName: string;
  email: string;
}

export function UserProfileCard({ profileImage, displayName, email }: UserProfileCardProps) {
  return (
    <div className="bg-[var(--card-bg)] rounded-lg p-6 border border-[var(--border-color)]">
      <div className="flex items-center gap-4">
        <img
          src={profileImage}
          alt={displayName}
          className="size-20 rounded-full object-cover ring-2 ring-[#1db954]"
        />
        <div>
          <h2 className="text-2xl text-[var(--text-primary)] mb-1">{displayName}</h2>
          <p className="text-[var(--text-secondary)]">{email}</p>
        </div>
      </div>
    </div>
  );
}