import { User } from 'lucide-react';
import { useNavigate } from 'react-router';
import logoWhite from '../../imports/LogoWhite.svg';
import logoBlack from '../../imports/LogoBlack.svg';
import { useTheme } from '../context/theme';
  
export function Header() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const logo = theme === 'dark' ? logoWhite : logoBlack;

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border-color)] bg-[var(--bg-primary)]/95 backdrop-blur-sm">
      <div className="flex items-center justify-between px-8 py-5">
        <div className="flex cursor-pointer items-center gap-4" onClick={() => navigate('/home')}>
          <img src={logo} alt="Statify Logo" className="h-10 w-auto" />
          <h1 className="text-3xl tracking-tight text-[var(--text-primary)]">
            <span className="font-bold">Statify</span>
          </h1>
        </div>
        <button
          onClick={() => navigate('/settings')}
          className="flex size-11 items-center justify-center rounded-full bg-[#1db954] shadow-lg transition-colors hover:bg-[#1ed760]"
          aria-label="Profile settings"
        >
          <User className="size-5.5 text-white" />
        </button>
      </div>
    </header>
  );
}
