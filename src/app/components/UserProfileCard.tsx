interface UserProfileCardProps {
  profileImage: string;
  displayName: string;
  email: string;
}

export function UserProfileCard({ profileImage, displayName, email }: UserProfileCardProps) {
  return (
    <div className="rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] p-5 sm:p-6">
      <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-center sm:text-left">
        <img
          src={profileImage}
          alt={displayName}
          className="size-[4.5rem] rounded-full object-cover ring-2 ring-[#1db954] sm:size-20"
        />
        <div>
          <h2 className="mb-1 text-xl text-[var(--text-primary)] sm:text-2xl">{displayName}</h2>
          <p className="text-[var(--text-secondary)]">{email}</p>
        </div>
      </div>
    </div>
  );
}
