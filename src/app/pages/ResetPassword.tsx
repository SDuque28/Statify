import { ArrowLeft, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { motion } from 'motion/react';
import { useMemo, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router';
import logo from '../../imports/LogoWhite.svg';
import {
  AuthServiceError,
  authService,
  type ForgotPasswordResponse,
} from '../../services/auth.service';

function formatExpiry(value: string | null) {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

export function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token')?.trim() ?? '';
  const mode = token ? 'reset' : 'request';
  const prefilledEmail =
    location.state && typeof location.state === 'object' && 'email' in location.state
      ? String((location.state as { email?: string }).email ?? '')
      : '';

  const [email, setEmail] = useState(prefilledEmail);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submissionState, setSubmissionState] = useState<'idle' | 'request' | 'reset'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [forgotPasswordResult, setForgotPasswordResult] =
    useState<ForgotPasswordResponse | null>(null);

  const expiryLabel = useMemo(
    () => formatExpiry(forgotPasswordResult?.expiresAt ?? null),
    [forgotPasswordResult?.expiresAt],
  );

  const isSubmitting = submissionState !== 'idle';

  const getFriendlyMessage = (error: unknown) => {
    if (error instanceof AuthServiceError) {
      return error.message;
    }

    return 'Unable to complete this request right now. Please try again.';
  };

  const handleForgotPasswordSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmissionState('request');
    setErrorMessage(null);
    setSuccessMessage(null);
    setForgotPasswordResult(null);

    try {
      const response = await authService.forgotPassword(email.trim());
      setForgotPasswordResult(response);
      setSuccessMessage(response.message);
    } catch (error) {
      setErrorMessage(getFriendlyMessage(error));
    } finally {
      setSubmissionState('idle');
    }
  };

  const handleResetPasswordSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmissionState('reset');
    setErrorMessage(null);
    setSuccessMessage(null);

    if (password.length < 6) {
      setErrorMessage('Your new password must be at least 6 characters long.');
      setSubmissionState('idle');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      setSubmissionState('idle');
      return;
    }

    try {
      const response = await authService.resetPassword(token, password);
      setSuccessMessage(response.message);
      setPassword('');
      setConfirmPassword('');
      window.setTimeout(() => {
        navigate('/auth', {
          replace: true,
          state: {
            tab: 'login',
          },
        });
      }, 1200);
    } catch (error) {
      setErrorMessage(getFriendlyMessage(error));
    } finally {
      setSubmissionState('idle');
    }
  };

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
          <button
            type="button"
            onClick={() => navigate('/auth', { state: { tab: 'login' } })}
            className="mb-6 flex items-center gap-2 text-sm text-gray-400 transition-colors hover:text-white"
          >
            <ArrowLeft className="size-4" />
            Back to login
          </button>

          <div className="mb-8 text-center">
            <div className="mb-3 flex items-center justify-center gap-3">
              <h1 className="text-2xl tracking-tight sm:text-3xl">
                <span className="font-bold text-white">Statify</span>
              </h1>
              <img src={logo} alt="Statify Logo" className="h-7 w-auto sm:h-8" />
            </div>
            <h2 className="text-xl text-white sm:text-2xl">
              {mode === 'reset' ? 'Create a new password' : 'Reset your password'}
            </h2>
            <p className="mt-2 text-sm text-gray-400">
              {mode === 'reset'
                ? 'Choose a new password to get back into your account.'
                : 'Enter your email and we will prepare password reset instructions.'}
            </p>
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

          {mode === 'request' ? (
            <form onSubmit={handleForgotPasswordSubmit} className="space-y-5">
              <div>
                <label htmlFor="reset-email" className="mb-2 block text-sm text-gray-400">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-gray-500" />
                  <input
                    id="reset-email"
                    type="email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="Enter your account email"
                    className="w-full rounded-lg border border-white/10 bg-[#1a1a1a] px-11 py-3 text-white placeholder:text-gray-600 transition-colors focus:border-[#1db954] focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-full bg-[#1db954] py-3.5 text-white shadow-lg shadow-[#1db954]/30 transition-all hover:scale-[1.02] hover:bg-[#1ed760] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:scale-100 disabled:hover:bg-[#1db954]"
              >
                {submissionState === 'request'
                  ? 'Preparing reset instructions...'
                  : 'Send reset instructions'}
              </button>

              {forgotPasswordResult?.resetUrl && (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-sm text-gray-300">
                    Your reset link is ready for local development.
                    {expiryLabel ? ` It expires on ${expiryLabel}.` : ''}
                  </p>
                  <a
                    href={forgotPasswordResult.resetUrl}
                    className="mt-3 inline-flex rounded-full bg-white px-4 py-2 text-sm text-[#121212] transition-colors hover:bg-gray-200"
                  >
                    Open reset page
                  </a>
                </div>
              )}
            </form>
          ) : (
            <form onSubmit={handleResetPasswordSubmit} className="space-y-5">
              <div>
                <label htmlFor="new-password" className="mb-2 block text-sm text-gray-400">
                  New password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-gray-500" />
                  <input
                    id="new-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Create a new password"
                    className="w-full rounded-lg border border-white/10 bg-[#1a1a1a] px-11 py-3 text-white placeholder:text-gray-600 transition-colors focus:border-[#1db954] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 transition-colors hover:text-gray-300"
                  >
                    {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label
                  htmlFor="confirm-password"
                  className="mb-2 block text-sm text-gray-400"
                >
                  Confirm password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-gray-500" />
                  <input
                    id="confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    placeholder="Repeat your new password"
                    className="w-full rounded-lg border border-white/10 bg-[#1a1a1a] px-11 py-3 text-white placeholder:text-gray-600 transition-colors focus:border-[#1db954] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((current) => !current)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 transition-colors hover:text-gray-300"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="size-5" />
                    ) : (
                      <Eye className="size-5" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-full bg-[#1db954] py-3.5 text-white shadow-lg shadow-[#1db954]/30 transition-all hover:scale-[1.02] hover:bg-[#1ed760] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:scale-100 disabled:hover:bg-[#1db954]"
              >
                {submissionState === 'reset' ? 'Saving new password...' : 'Reset password'}
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
