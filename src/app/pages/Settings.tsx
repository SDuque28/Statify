import { Moon, SunMedium } from 'lucide-react';
import { useTheme } from '../context/theme';

export function Settings() {
  const { theme, toggleTheme } = useTheme();

  return (
    <section className="max-w-2xl rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
      <p className="mb-2 text-sm uppercase tracking-[0.3em] text-[#1db954]">Settings</p>
      <h1 className="text-3xl font-semibold tracking-tight">Appearance</h1>
      <p className="mt-3 text-gray-400">
        Your theme context is already set up, so this screen now gives it a visible control.
      </p>

      <div className="mt-8 flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 p-4">
        <div>
          <p className="font-medium">Current theme</p>
          <p className="text-sm text-gray-400">
            {theme === 'dark' ? 'Dark mode is active.' : 'Light mode is active.'}
          </p>
        </div>
        <button
          onClick={toggleTheme}
          className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-black transition-transform hover:scale-[1.02]"
        >
          {theme === 'dark' ? <SunMedium className="size-4" /> : <Moon className="size-4" />}
          Toggle theme
        </button>
      </div>
    </section>
  );
}
