import { User } from 'lucide-react';
import { useNavigate } from 'react-router';

export function Header() {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border-color)] bg-[var(--bg-primary)]/95 backdrop-blur-sm">
      <div className="flex items-center justify-between px-8 py-4">
        <div>
          <h1 className="text-2xl tracking-tight text-[var(--text-primary)]">
            <span className="font-bold">Statify</span>
          </h1>
        </div>

        <button
          onClick={() => navigate('/settings')}
          className="flex size-10 items-center justify-center rounded-full bg-[#1db954] shadow-lg transition-colors hover:bg-[#1ed760]"
          aria-label="Profile settings"
        >
          <User className="size-5 text-white" />
        </button>
      </div>
    </header>
  );
}
