import { Music2 } from 'lucide-react';
import { useNavigate } from 'react-router';

export function Auth() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0a0a0a] px-6 py-12 text-white">
      <div className="mx-auto flex min-h-[calc(100vh-6rem)] max-w-xl flex-col items-center justify-center rounded-3xl border border-white/10 bg-white/5 p-10 text-center backdrop-blur-sm">
        <div className="mb-6 rounded-full bg-[#1db954]/15 p-4">
          <Music2 className="size-10 text-[#1db954]" />
        </div>
        <h1 className="mb-4 text-4xl font-semibold tracking-tight">Connect your account</h1>
        <p className="mb-8 max-w-md text-gray-300">
          This placeholder keeps the current router working while you wire up the real
          Spotify authentication flow.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            onClick={() => navigate('/home')}
            className="rounded-full bg-[#1db954] px-6 py-3 font-medium text-black transition-transform hover:scale-[1.02]"
          >
            Continue to app
          </button>
          <button
            onClick={() => navigate('/')}
            className="rounded-full border border-white/15 px-6 py-3 font-medium text-white transition-colors hover:bg-white/5"
          >
            Back to landing
          </button>
        </div>
      </div>
    </div>
  );
}
