import { Outlet } from 'react-router';
import { Header } from '../components/Header';

export function Layout() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <Header />
      <main className="w-full">
        <Outlet />
      </main>
    </div>
  );
}
