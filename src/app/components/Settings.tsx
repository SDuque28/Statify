import { ArrowLeft, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router';
import { ThemePreference } from '../components/ThemePreference';
import { UserProfileCard } from '../components/UserProfileCard';

export function Settings() {
  const navigate = useNavigate();
  const userData = {
    profileImage:
      'https://images.unsplash.com/photo-1576558656222-ba66febe3dec?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBoZWFkc2hvdCUyMHBvcnRyYWl0fGVufDF8fHx8MTc3MTI5Mzg0MHww&ixlib=rb-4.1.0&q=80&w=1080',
    displayName: 'Alex Thompson',
    email: 'alex.thompson@email.com',
  };

  const handleLogout = () => {
    navigate('/');
  };

  return (
    <div className="mx-auto max-w-4xl p-8">
      <button
        onClick={() => navigate('/home')}
        className="mb-6 flex items-center gap-2 text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
      >
        <ArrowLeft className="size-5" />
        Back to Dashboard
      </button>

      <div className="mb-8">
        <h1 className="mb-2 text-3xl text-[var(--text-primary)]">Settings</h1>
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
          className="flex items-center gap-3 rounded-lg border border-red-600/30 bg-red-600/10 px-6 py-3 text-red-500 transition-colors hover:bg-red-600/20"
        >
          <LogOut className="size-5" />
          Log Out
        </button>
      </div>
    </div>
  );
}
