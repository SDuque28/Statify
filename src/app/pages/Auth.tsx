import { Eye, EyeOff, Lock, Mail, X } from 'lucide-react';
import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import logo from '../../imports/LogoWhite.svg';
import { AuthServiceError, authService } from '../../services/auth.service';
import { authStorage } from '../../services/auth-storage';
import { SpotifyServiceError, spotifyService } from '../../services/spotify.service';

const policyContent = {
  terms: {
    title: 'Terms of Use',
    sections: [
      {
        heading: 'Using Statify',
        body:
          'Statify helps you explore your Spotify listening insights. By creating an account, you agree to use the app lawfully and not attempt to misuse, disrupt, or reverse-engineer the service.',
      },
      {
        heading: 'Your Account',
        body:
          'You are responsible for keeping your login credentials secure and for activity that happens under your account. We may suspend access if we detect abuse, fraud, or behavior that puts the platform or other users at risk.',
      },
      {
        heading: 'Spotify Data',
        body:
          'When you connect Spotify, Statify reads the account information and listening insights needed to power your dashboard. Your use of Spotify through Statify must also comply with Spotify’s own terms and platform policies.',
      },
      {
        heading: 'Service Availability',
        body:
          'We aim to keep Statify available and accurate, but we cannot guarantee uninterrupted service or error-free analytics. Features may change, improve, or be removed as the product evolves.',
      },
    ],
  },
  privacy: {
    title: 'Privacy Policy',
    sections: [
      {
        heading: 'What We Collect',
        body:
          'We store the minimum account data needed to authenticate you, such as your email address, encrypted password, and linked Spotify account details when you connect Spotify.',
      },
      {
        heading: 'How We Use Data',
        body:
          'Your data is used to sign you in, connect to Spotify on your behalf, and display personalized music insights like top artists, top tracks, and yearly summaries.',
      },
      {
        heading: 'What We Do Not Sell',
        body:
          'Statify does not sell your personal information. We only process the data necessary to run the product experience you requested.',
      },
      {
        heading: 'Retention and Control',
        body:
          'You can disconnect Spotify or stop using the service at any time. Account and connection data may remain stored as needed for security, legal compliance, and service integrity unless you request deletion.',
      },
    ],
  },
} as const;

export function Auth() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loginFormData, setLoginFormData] = useState({
    email: '',
    password: '',
  });
  const [signupFormData, setSignupFormData] = useState({
    email: '',
    password: '',
  });
  const [submissionState, setSubmissionState] = useState<
    'idle' | 'login' | 'signup' | 'spotify_status' | 'spotify_redirect'
  >('idle');
  const [openPolicy, setOpenPolicy] = useState<keyof typeof policyContent | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (authStorage.isAuthenticated()) {
      navigate('/home', { replace: true });
      return;
    }

    setIsCheckingSession(false);
  }, [navigate]);

  useEffect(() => {
    if (location.state && typeof location.state === 'object' && 'tab' in location.state) {
      const state = location.state as { tab?: 'login' | 'signup' };

      if (state.tab === 'login' || state.tab === 'signup') {
        setActiveTab(state.tab);
      }
    }
  }, [location.state]);

  useEffect(() => {
    if (location.state && typeof location.state === 'object' && 'reason' in location.state) {
      const state = location.state as { reason?: string };

      if (state.reason === 'session_expired') {
        setErrorMessage('Your session expired. Please log in again.');
        navigate(location.pathname, { replace: true, state: null });
      }
    }
  }, [location.pathname, location.state, navigate]);

  const resetFeedback = () => {
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const getFriendlyMessage = (error: unknown) => {
    if (error instanceof AuthServiceError) {
      if (error.message === 'Invalid credentials') {
        return 'Invalid email or password.';
      }

      if (error.message === 'User already exists') {
        return 'An account with this email already exists.';
      }

      return error.message;
    }

    if (error instanceof SpotifyServiceError) {
      if (error.status === 401) {
        return 'Your session expired before Spotify could connect. Please try again.';
      }

      return error.message;
    }

    return 'Unable to reach the server right now. Please try again.';
  };

  const handleTabChange = (tab: 'login' | 'signup') => {
    setActiveTab(tab);
    resetFeedback();
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    resetFeedback();
    setSubmissionState('login');

    try {
      const session = await authService.login(
        loginFormData.email.trim(),
        loginFormData.password,
      );

      authStorage.logout();
      authStorage.setSession(session);
      setSubmissionState('spotify_status');
      const spotifyStatus = await spotifyService.getConnectionStatus();

      if (spotifyStatus.connected) {
        navigate('/home');
        return;
      }

      setSubmissionState('spotify_redirect');
      const authUrl = await spotifyService.getConnectUrl();
      window.location.assign(authUrl);
    } catch (error) {
      if (error instanceof SpotifyServiceError && error.status === 401) {
        authStorage.logout();
      }

      setErrorMessage(getFriendlyMessage(error));
    } finally {
      setSubmissionState('idle');
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    resetFeedback();
    setSubmissionState('signup');

    try {
      const email = signupFormData.email.trim();

      await authService.register(email, signupFormData.password);
      setLoginFormData({
        email,
        password: signupFormData.password,
      });
      setSignupFormData({
        email: '',
        password: '',
      });
      setActiveTab('login');
      setSuccessMessage('Account created successfully. You can now log in.');
    } catch (error) {
      setErrorMessage(getFriendlyMessage(error));
    } finally {
      setSubmissionState('idle');
    }
  };

  const isSubmitting = submissionState !== 'idle';
  const loginButtonLabel =
    submissionState === 'login'
      ? 'Logging In...'
      : submissionState === 'spotify_status'
        ? 'Checking Spotify...'
        : submissionState === 'spotify_redirect'
          ? 'Redirecting to Spotify...'
          : 'Log In';
  const signupButtonLabel =
    submissionState === 'signup' ? 'Creating Account...' : 'Sign Up';
  const selectedPolicy = openPolicy ? policyContent[openPolicy] : null;

  if (isCheckingSession) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0a0a0a] px-4 py-8 sm:px-6">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1db954]/10 via-transparent to-[#1db954]/5" />
        <div className="absolute left-20 top-20 h-96 w-96 rounded-full bg-[#1db954]/20 blur-[100px]" />
        <div className="absolute bottom-20 right-20 h-96 w-96 rounded-full bg-[#1db954]/10 blur-[100px]" />
        <div className="relative w-full max-w-md rounded-2xl border border-white/5 bg-[#121212] p-6 text-center shadow-2xl backdrop-blur-xl sm:p-8">
          <div className="mx-auto mb-4 size-10 animate-spin rounded-full border-2 border-white/10 border-t-[#1db954]" />
          <h1 className="mb-2 text-2xl text-white">Loading Statify</h1>
          <p className="text-sm text-gray-400">Checking your current session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0a0a0a] px-4 py-6 sm:px-6 sm:py-8">
      <div className="absolute inset-0 bg-gradient-to-br from-[#1db954]/10 via-transparent to-[#1db954]/5" />
      <div className="absolute left-20 top-20 h-96 w-96 rounded-full bg-[#1db954]/20 blur-[100px]" />
      <div className="absolute bottom-20 right-20 h-96 w-96 rounded-full bg-[#1db954]/10 blur-[100px]" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        <div className="rounded-2xl border border-white/5 bg-[#121212] p-5 shadow-2xl backdrop-blur-xl sm:p-8">
          <div className="mb-8 text-center">
            <div className="mb-2 flex items-center justify-center gap-3">
              <h1 className="text-2xl tracking-tight sm:text-3xl">
                <span className="font-bold text-white">Statify</span>
              </h1>
              <img src={logo} alt="Statify Logo" className="h-7 w-auto sm:h-8" />
            </div>
            <p className="text-sm text-gray-400">Connect your Spotify account</p>
          </div>

          <div className="relative mb-8 flex border-b border-white/10">
            <motion.div
              aria-hidden="true"
              className="absolute bottom-0 left-0 h-0.5 w-1/2 bg-[#1db954]"
              animate={{ x: activeTab === 'signup' ? '0%' : '100%' }}
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            />
            <button
              onClick={() => handleTabChange('signup')}
              className={`relative flex-1 pb-3 text-sm tracking-wider transition-colors ${
                activeTab === 'signup' ? 'text-white' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              SIGN UP
            </button>
            <button
              onClick={() => handleTabChange('login')}
              className={`relative flex-1 pb-3 text-sm tracking-wider transition-colors ${
                activeTab === 'login' ? 'text-white' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              LOG IN
            </button>
          </div>

          {errorMessage && (
            <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="mb-6 rounded-lg border border-[#1db954]/30 bg-[#1db954]/10 px-4 py-3 text-sm text-[#86efac]">
              {successMessage}
            </div>
          )}

          {activeTab === 'login' && (
            <motion.form
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              onSubmit={handleLoginSubmit}
              className="space-y-5"
            >
              <div>
                <label htmlFor="email" className="mb-2 block text-sm text-gray-400">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-gray-500" />
                  <input
                    id="email"
                    type="email"
                    required
                    value={loginFormData.email}
                    onChange={(e) =>
                      setLoginFormData({ ...loginFormData, email: e.target.value })
                    }
                    placeholder="Enter your email"
                    className="w-full rounded-lg border border-white/10 bg-[#1a1a1a] px-11 py-3 text-white placeholder:text-gray-600 transition-colors focus:border-[#1db954] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="mb-2 block text-sm text-gray-400">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-gray-500" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={loginFormData.password}
                    onChange={(e) =>
                      setLoginFormData({ ...loginFormData, password: e.target.value })
                    }
                    placeholder="Enter your password"
                    className="w-full rounded-lg border border-white/10 bg-[#1a1a1a] px-11 py-3 text-white placeholder:text-gray-600 transition-colors focus:border-[#1db954] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 transition-colors hover:text-gray-300"
                  >
                    {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  id="remember"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="size-4 cursor-pointer rounded border-white/10 bg-[#1a1a1a] text-[#1db954] focus:ring-[#1db954] focus:ring-offset-0"
                />
                <label htmlFor="remember" className="ml-2 cursor-pointer text-sm text-gray-400">
                  Remember me
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-full bg-[#1db954] py-3.5 text-white shadow-lg shadow-[#1db954]/30 transition-all hover:scale-[1.02] hover:bg-[#1ed760] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:scale-100 disabled:hover:bg-[#1db954]"
              >
                {loginButtonLabel}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() =>
                    navigate('/reset-password', {
                      state: { email: loginFormData.email.trim() },
                    })
                  }
                  className="text-sm text-gray-400 underline transition-colors hover:text-white"
                >
                  Forgot your password?
                </button>
              </div>
            </motion.form>
          )}

          {activeTab === 'signup' && (
            <motion.form
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              onSubmit={handleSignupSubmit}
              className="space-y-5"
            >
              <div>
                <label htmlFor="signup-email" className="mb-2 block text-sm text-gray-400">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-gray-500" />
                  <input
                    id="signup-email"
                    type="email"
                    required
                    value={signupFormData.email}
                    onChange={(e) =>
                      setSignupFormData({ ...signupFormData, email: e.target.value })
                    }
                    placeholder="Enter your email"
                    className="w-full rounded-lg border border-white/10 bg-[#1a1a1a] px-11 py-3 text-white placeholder:text-gray-600 transition-colors focus:border-[#1db954] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="signup-password" className="mb-2 block text-sm text-gray-400">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-gray-500" />
                  <input
                    id="signup-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={signupFormData.password}
                    onChange={(e) =>
                      setSignupFormData({ ...signupFormData, password: e.target.value })
                    }
                    placeholder="Create a password"
                    className="w-full rounded-lg border border-white/10 bg-[#1a1a1a] px-11 py-3 text-white placeholder:text-gray-600 transition-colors focus:border-[#1db954] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 transition-colors hover:text-gray-300"
                  >
                    {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-full bg-[#1db954] py-3.5 text-white shadow-lg shadow-[#1db954]/30 transition-all hover:scale-[1.02] hover:bg-[#1ed760] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:scale-100 disabled:hover:bg-[#1db954]"
              >
                {signupButtonLabel}
              </button>
            </motion.form>
          )}

          <p className="mt-8 text-center text-xs text-gray-500">
            By continuing, you agree to our{' '}
            <button
              type="button"
              onClick={() => setOpenPolicy('terms')}
              className="text-gray-400 underline hover:text-white"
            >
              Terms
            </button>{' '}
            and{' '}
            <button
              type="button"
              onClick={() => setOpenPolicy('privacy')}
              className="text-gray-400 underline hover:text-white"
            >
              Privacy Policy
            </button>
            .
          </p>
        </div>
      </motion.div>

      {selectedPolicy && (
        <div className="absolute inset-0 z-30 overflow-hidden bg-[#050805]/95 px-4 py-6 sm:px-6">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(29,185,84,0.24),transparent_38%),radial-gradient(circle_at_bottom_right,rgba(29,185,84,0.16),transparent_34%),linear-gradient(180deg,rgba(8,12,9,0.88),rgba(5,8,5,0.96))]" />
          <div className="absolute left-[-8rem] top-[-6rem] h-56 w-56 rounded-full bg-[#1db954]/20 blur-3xl sm:h-72 sm:w-72" />
          <div className="absolute bottom-[-7rem] right-[-5rem] h-64 w-64 rounded-full bg-[#1ed760]/12 blur-3xl sm:h-80 sm:w-80" />
          <div className="relative flex min-h-full items-center justify-center">
          <div className="w-full max-w-2xl rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(22,29,23,0.96),rgba(12,16,13,0.98))] p-5 shadow-[0_32px_120px_rgba(0,0,0,0.55)] backdrop-blur-xl sm:p-8">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl text-white sm:text-3xl">{selectedPolicy.title}</h2>
                <p className="mt-2 text-sm text-gray-400">
                  Please read this information before continuing with your account.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpenPolicy(null)}
                className="rounded-full border border-white/10 p-2 text-gray-400 transition-colors hover:text-white"
                aria-label="Close policy"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="max-h-[60vh] space-y-5 overflow-y-auto pr-1">
              {selectedPolicy.sections.map((section) => (
                <section key={section.heading}>
                  <h3 className="mb-2 text-sm uppercase tracking-[0.18em] text-[#1db954]">
                    {section.heading}
                  </h3>
                  <p className="text-sm leading-6 text-gray-300">{section.body}</p>
                </section>
              ))}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setOpenPolicy(null)}
                className="rounded-full bg-[#1db954] px-5 py-2.5 text-sm text-white transition-colors hover:bg-[#1ed760]"
              >
                Close
              </button>
            </div>
          </div>
          </div>
        </div>
      )}
    </div>
  );
}
