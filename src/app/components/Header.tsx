import { User } from 'lucide-react';
import { useNavigate } from 'react-router';
import logo from '../../imports/LogoWhite.svg';

export function Header() {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border-color)] bg-[var(--bg-primary)]/95 backdrop-blur-sm">
      <div className="flex items-center justify-between px-8 py-4">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/home')}>
          <img src={logo} alt="Statify Logo" className="h-8 w-auto" />
          <h1 className="text-2xl text-[var(--text-primary)] tracking-tight">
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
