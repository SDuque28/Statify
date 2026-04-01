import { BarChart3, Home, Settings } from 'lucide-react';
import { NavLink, Outlet } from 'react-router';

const navItems = [
  { to: '/home', label: 'Home', icon: Home },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export function Layout() {
  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <header className="border-b border-white/10 bg-black/30 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-[#1db954]/15 p-2">
              <BarChart3 className="size-5 text-[#1db954]" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Statify</p>
              <p className="text-lg font-semibold tracking-tight">Music dashboard</p>
            </div>
          </div>
          <nav className="flex items-center gap-2">
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-full px-4 py-2 text-sm transition-colors ${
                    isActive ? 'bg-white text-black' : 'text-gray-300 hover:bg-white/10'
                  }`
                }
              >
                <Icon className="size-4" />
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <Outlet />
      </main>
    </div>
  );
}
