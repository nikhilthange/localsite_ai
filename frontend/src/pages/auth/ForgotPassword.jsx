import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { HiMail, HiArrowLeft, HiCheckCircle } from 'react-icons/hi';
import Button from '@/components/common/Button';
import { useAuth } from '@/context/AuthContext';

export default function ForgotPassword() {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) { setError('Email is required'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Invalid email'); return; }
    setError('');
    setLoading(true);
    try {
      await forgotPassword(email);
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <Link to="/login" className="inline-flex items-center gap-2 text-sm text-[rgb(var(--color-text-muted))] hover:text-[rgb(var(--color-text))] mb-8 transition-colors">
          <HiArrowLeft className="w-4 h-4" /> Back to login
        </Link>

        <div className="card">
          {!sent ? (
            <>
              <div className="w-14 h-14 bg-primary-100 dark:bg-primary-900/30 rounded-2xl flex items-center justify-center mb-6">
                <HiMail className="w-7 h-7 text-primary-600 dark:text-primary-400" />
              </div>
              <h1 className="text-2xl font-bold text-[rgb(var(--color-text))] mb-2">Forgot Password?</h1>
              <p className="text-[rgb(var(--color-text-secondary))] mb-8">No worries! Enter your email and we'll send you a reset link.</p>

              {error && (
                <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-600 dark:text-red-400">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-[rgb(var(--color-text))] mb-2">Email</label>
                  <div className="relative">
                    <HiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[rgb(var(--color-text-muted))]" />
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com"
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-[rgb(var(--color-border))] bg-transparent text-[rgb(var(--color-text))] placeholder:text-[rgb(var(--color-text-muted))] focus:ring-2 focus:ring-primary-500/30 outline-none transition-all" />
                  </div>
                </div>
                <Button type="submit" variant="primary" className="w-full py-3.5" loading={loading}>
                  Send Reset Link
                </Button>
              </form>
            </>
          ) : (
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <HiCheckCircle className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h2 className="text-2xl font-bold text-[rgb(var(--color-text))] mb-2">Check Your Email</h2>
              <p className="text-[rgb(var(--color-text-secondary))] mb-2">We've sent a password reset link to:</p>
              <p className="font-medium text-[rgb(var(--color-text))] mb-8">{email}</p>
              <p className="text-sm text-[rgb(var(--color-text-muted))] mb-6">Didn't receive it? Check your spam folder or</p>
              <Button variant="outline" className="rounded-xl" onClick={() => { setSent(false); setEmail(''); }}>
                Try another email
              </Button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
