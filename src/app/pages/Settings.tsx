import { ArrowLeft, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router';
import { authStorage } from '../../services/auth-storage';
import { ThemePreference } from '../components/ThemePreference';
import { UserProfileCard } from '../components/UserProfileCard';

export function Settings() {
  const navigate = useNavigate();
  const user = authStorage.getUser();
  const userData = {
    profileImage:
      'https://images.unsplash.com/photo-1576558656222-ba66febe3dec?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBoZWFkc2hvdCUyMHBvcnRyYWl0fGVufDF8fHx8MTc3MTI5Mzg0MHww&ixlib=rb-4.1.0&q=80&w=1080',
    displayName: user?.email.split('@')[0] ?? 'Statify User',
    email: user?.email ?? 'No active session',
  };

  const handleLogout = () => {
    authStorage.logout();
    navigate('/auth');
  };

  return (
    <div className="w-full px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
      <button
        onClick={() => navigate('/home')}
        className="mb-6 flex items-center gap-2 text-sm text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)] sm:text-base"
      >
        <ArrowLeft className="size-5" />
        Back to Dashboard
      </button>

      <div className="mb-8">
        <h1 className="mb-2 text-2xl text-[var(--text-primary)] sm:text-3xl">Settings</h1>
        <p className="text-[var(--text-secondary)]">Manage your profile and preferences</p>
      </div>

      <div className="space-y-6">
        <UserProfileCard
          profileImage={userData.profileImage}
          displayName={userData.displayName}
          email={userData.email}
        />
        <ThemePreference />
        <button
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-3 rounded-lg border border-red-600/30 bg-red-600/10 px-6 py-3 text-red-500 transition-colors hover:bg-red-600/20 sm:w-auto sm:justify-start"
        >
          <LogOut className="size-5" />
          Log Out
        </button>
      </div>
    </div>
  );
}
