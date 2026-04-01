import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/theme';

export function ThemePreference() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] p-6">
      <h3 className="mb-4 text-xl text-[var(--text-primary)]">Theme Preference</h3>

      <div className="flex gap-4">
        <button
          onClick={() => setTheme('dark')}
          className={`flex-1 rounded-lg border-2 p-6 transition-all ${
            theme === 'dark'
              ? 'border-[#1db954] bg-[var(--card-hover-bg)]'
              : 'border-[var(--border-color)] bg-[var(--bg-primary)] hover:border-[var(--border-hover)]'
          }`}
        >
          <div className="flex flex-col items-center gap-3">
            <div
              className={`rounded-full p-3 ${
                theme === 'dark' ? 'bg-[#1db954]' : 'bg-[var(--icon-bg)]'
              }`}
            >
              <Moon
                className={`size-6 ${
                  theme === 'dark' ? 'text-white' : 'text-[var(--text-secondary)]'
                }`}
              />
            </div>
            <div className="text-center">
              <p
                className={`mb-1 ${
                  theme === 'dark' ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'
                }`}
              >
                Dark Mode
              </p>
              {theme === 'dark' && <span className="text-xs text-[#1db954]">Selected</span>}
            </div>
          </div>
        </button>

        <button
          onClick={() => setTheme('light')}
          className={`flex-1 rounded-lg border-2 p-6 transition-all ${
            theme === 'light'
              ? 'border-[#1db954] bg-white'
              : 'border-[var(--border-color)] bg-[var(--bg-primary)] hover:border-[var(--border-hover)]'
          }`}
        >
          <div className="flex flex-col items-center gap-3">
            <div
              className={`rounded-full p-3 ${
                theme === 'light' ? 'bg-[#1db954]' : 'bg-[var(--icon-bg)]'
              }`}
            >
              <Sun
                className={`size-6 ${
                  theme === 'light' ? 'text-white' : 'text-[var(--text-secondary)]'
                }`}
              />
            </div>
            <div className="text-center">
              <p
                className={`mb-1 ${
                  theme === 'light' ? 'text-black' : 'text-[var(--text-secondary)]'
                }`}
              >
                Light Mode
              </p>
              {theme === 'light' && <span className="text-xs text-[#1db954]">Selected</span>}
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}
