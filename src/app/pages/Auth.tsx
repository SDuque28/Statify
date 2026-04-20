import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import logo from '../../imports/LogoWhite.svg';
import { AuthServiceError, authService } from '../../services/auth.service';
import { authStorage } from '../../services/auth-storage';
import { SpotifyServiceError, spotifyService } from '../../services/spotify.service';

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
            <button type="button" className="text-gray-400 underline hover:text-white">
              Terms
            </button>{' '}
            and{' '}
            <button type="button" className="text-gray-400 underline hover:text-white">
              Privacy Policy
            </button>
            .
          </p>
        </div>
      </motion.div>
    </div>
  );
}
