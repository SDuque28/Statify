interface UserProfileCardProps {
  profileImage?: string | null;
  displayName: string;
  email: string;
  details: Array<{
    label: string;
    value: string;
  }>;
}

function getInitial(value: string) {
  return value.trim().charAt(0).toUpperCase() || 'S';
}

export function UserProfileCard({
  profileImage,
  displayName,
  email,
  details,
}: UserProfileCardProps) {
  return (
    <div className="rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] p-5 sm:p-6">
      <div className="flex flex-col gap-5 text-center sm:text-left">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
          {profileImage ? (
            <img
              src={profileImage}
              alt={displayName}
              className="size-[4.5rem] rounded-full object-cover ring-2 ring-[#1db954] sm:size-20"
            />
          ) : (
            <div className="flex size-[4.5rem] items-center justify-center rounded-full bg-[#1db954] text-2xl font-semibold text-white ring-2 ring-[#1db954] sm:size-20 sm:text-3xl">
              {getInitial(email)}
            </div>
          )}
          <div>
          <h2 className="mb-1 text-xl text-[var(--text-primary)] sm:text-2xl">{displayName}</h2>
          <p className="text-[var(--text-secondary)]">{email}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {details.map((detail) => (
            <div
              key={detail.label}
              className="rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] px-4 py-3"
            >
              <p className="mb-1 text-xs uppercase tracking-[0.18em] text-[var(--text-secondary)]">
                {detail.label}
              </p>
              <p className="text-sm text-[var(--text-primary)]">{detail.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
