import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useParams, useLocation, useNavigate } from 'react-router-dom';
import { HiMail, HiCheckCircle, HiXCircle, HiArrowRight } from 'react-icons/hi';
import Button from '@/components/common/Button';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/utils/constants';

export default function VerifyEmail() {
  const { token: urlToken } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { verifyEmail } = useAuth();

  const email = location.state?.email || '';

  const [status, setStatus] = useState(urlToken ? 'verifying' : 'idle');
  const [manualToken, setManualToken] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (urlToken) {
      setStatus('verifying');
      verifyEmail(urlToken)
        .then(() => {
          setStatus('verified');
          setMessage('Email verified successfully! Redirecting to login...');
          setTimeout(() => navigate(ROUTES.LOGIN, { replace: true }), 2500);
        })
        .catch((err) => {
          setStatus('error');
          setMessage(err.response?.data?.message || 'Verification failed. The link may be invalid or expired.');
        });
    }
  }, [urlToken, verifyEmail, navigate]);

  const handleManualVerify = async (e) => {
    e.preventDefault();
    if (!manualToken.trim()) return;
    setStatus('verifying');
    try {
      await verifyEmail(manualToken.trim());
      setStatus('verified');
      setMessage('Email verified successfully! Redirecting to login...');
      setTimeout(() => navigate(ROUTES.LOGIN, { replace: true }), 2500);
    } catch (err) {
      setStatus('error');
      setMessage(err.response?.data?.message || 'Verification failed. Please check your token and try again.');
    }
  };

  const renderIcon = () => {
    switch (status) {
      case 'verified':
        return <HiCheckCircle className="w-16 h-16 text-green-500" />;
      case 'error':
        return <HiXCircle className="w-16 h-16 text-red-500" />;
      default:
        return <HiMail className="w-16 h-16 text-primary-500" />;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 sm:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Link to={ROUTES.HOME} className="inline-flex items-center gap-2.5 mb-8">
            <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5z" /></svg>
            </div>
          </Link>
        </div>

        <div className="rounded-2xl border border-[rgb(var(--color-border))] bg-white dark:bg-surface-900 p-8 shadow-sm">
          <div className="flex flex-col items-center text-center mb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="mb-6"
            >
              {renderIcon()}
            </motion.div>

            {status === 'idle' && (
              <>
                <h1 className="text-2xl font-bold text-[rgb(var(--color-text))] mb-2">Check your email</h1>
                <p className="text-[rgb(var(--color-text-secondary))] mb-4">
                  We sent a verification link to{' '}
                  <strong className="text-[rgb(var(--color-text))]">{email || 'your email'}</strong>
                </p>
                <p className="text-sm text-[rgb(var(--color-text-muted))]">
                  Click the link in the email to verify your account. If you don't see it, check your spam folder.
                </p>
              </>
            )}

            {status === 'verifying' && (
              <>
                <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mb-4" />
                <h1 className="text-xl font-bold text-[rgb(var(--color-text))] mb-2">Verifying your email...</h1>
              </>
            )}

            {status === 'verified' && (
              <>
                <h1 className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">Email Verified!</h1>
                <p className="text-[rgb(var(--color-text-secondary))]">{message}</p>
              </>
            )}

            {status === 'error' && (
              <>
                <h1 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-2">Verification Failed</h1>
                <p className="text-[rgb(var(--color-text-secondary))] mb-4">{message}</p>
              </>
            )}
          </div>

          {status === 'idle' && (
            <>
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[rgb(var(--color-border))]" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white dark:bg-surface-900 text-[rgb(var(--color-text-muted))]">
                    Or enter verification code manually
                  </span>
                </div>
              </div>

              <form onSubmit={handleManualVerify} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--color-text))] mb-2">
                    Verification Token
                  </label>
                  <input
                    type="text"
                    value={manualToken}
                    onChange={(e) => setManualToken(e.target.value)}
                    placeholder="Paste your verification token here"
                    className="w-full px-4 py-3 rounded-xl border border-[rgb(var(--color-border))] bg-transparent text-[rgb(var(--color-text))] placeholder:text-[rgb(var(--color-text-muted))] focus:ring-2 focus:ring-primary-500/30 outline-none transition-all"
                  />
                </div>
                <Button type="submit" variant="primary" className="w-full py-3.5" disabled={!manualToken.trim()}>
                  Verify Email <HiArrowRight className="w-4 h-4" />
                </Button>
              </form>
            </>
          )}

          {status === 'error' && (
            <div className="text-center space-y-3">
              <button
                onClick={() => setStatus('idle')}
                className="w-full py-3 rounded-xl border border-[rgb(var(--color-border))] text-[rgb(var(--color-text))] hover:bg-[rgb(var(--color-surface))] transition-colors font-medium"
              >
                Try Again
              </button>
              <p className="text-sm text-[rgb(var(--color-text-muted))]">
                Need a new verification link?{' '}
                <button className="font-semibold text-primary-600 dark:text-primary-400 hover:underline">
                  Resend email
                </button>
              </p>
            </div>
          )}
        </div>

        <p className="text-center mt-6 text-sm text-[rgb(var(--color-text-muted))]">
          Already verified?{' '}
          <Link to={ROUTES.LOGIN} className="font-semibold text-primary-600 dark:text-primary-400 hover:underline">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
