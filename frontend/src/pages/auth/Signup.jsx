import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { HiMail, HiLockClosed, HiUser, HiEye, HiEyeOff, HiSparkles } from 'react-icons/hi';
import { FcGoogle } from 'react-icons/fc';
import { FiArrowRight } from 'react-icons/fi';
import Button from '@/components/common/Button';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/utils/constants';

const strengthConfig = [
  { label: 'Weak', color: 'bg-red-500', width: '25%' },
  { label: 'Fair', color: 'bg-orange-500', width: '50%' },
  { label: 'Good', color: 'bg-yellow-500', width: '75%' },
  { label: 'Strong', color: 'bg-green-500', width: '100%' },
];

function getPasswordStrength(password) {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  if (password.length >= 12) score++;
  if (score < 2) return 0;
  if (score < 3) return 1;
  if (score < 5) return 2;
  return 3;
}

export default function Signup() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const strength = getPasswordStrength(form.password);

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.email) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Invalid email';
    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 8) errs.password = 'Minimum 8 characters';
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await register({ name: form.name, email: form.email, password: form.password });
      navigate(ROUTES.VERIFY_EMAIL, { state: { email: form.email }, replace: true });
    } catch (err) {
      setErrors({ form: err.response?.data?.message || 'Registration failed' });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/google`;
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 relative overflow-hidden items-center justify-center order-last">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/4" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-black/10 rounded-full blur-3xl translate-y-1/3 translate-x-1/4" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent" />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative z-10 max-w-lg px-16"
        >
          <div className="w-14 h-14 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center mb-8">
            <HiSparkles className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-4xl font-bold text-white mb-4">Start Building!</h2>
          <p className="text-primary-200 text-lg mb-10 leading-relaxed">Create stunning AI-powered websites in minutes. No coding required.</p>
          <div className="space-y-5">
            {[
              'AI generates complete websites from your description',
              '500+ professional templates to choose from',
              'Custom domain & SSL certificate included',
              'SEO optimized & mobile responsive',
              'Real-time analytics & lead management',
            ].map((feat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="flex items-center gap-4"
              >
                <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                </div>
                <span className="text-white/80">{feat}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 lg:p-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2.5 mb-8">
              <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5z" /></svg>
              </div>
            </Link>
            <h1 className="text-3xl font-bold text-[rgb(var(--color-text))] mb-2">Create Account</h1>
            <p className="text-[rgb(var(--color-text-secondary))]">Get started with your free account today. No credit card required.</p>
          </div>

          {errors.form && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl text-sm text-red-600 dark:text-red-400 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              {errors.form}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[rgb(var(--color-text))] mb-2">Full Name</label>
              <div className="relative">
                <HiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[rgb(var(--color-text-muted))]" />
                <input type="text" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  className={`w-full pl-11 pr-4 py-3 rounded-xl border bg-transparent text-[rgb(var(--color-text))] placeholder:text-[rgb(var(--color-text-muted))] focus:ring-2 focus:ring-primary-500/30 outline-none transition-all ${errors.name ? 'border-red-500' : 'border-[rgb(var(--color-border))]'}`}
                  placeholder="John Doe" aria-label="Full name" />
              </div>
              {errors.name && <p className="mt-1.5 text-sm text-red-500">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-[rgb(var(--color-text))] mb-2">Email</label>
              <div className="relative">
                <HiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[rgb(var(--color-text-muted))]" />
                <input type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                  className={`w-full pl-11 pr-4 py-3 rounded-xl border bg-transparent text-[rgb(var(--color-text))] placeholder:text-[rgb(var(--color-text-muted))] focus:ring-2 focus:ring-primary-500/30 outline-none transition-all ${errors.email ? 'border-red-500' : 'border-[rgb(var(--color-border))]'}`}
                  placeholder="you@example.com" aria-label="Email address" />
              </div>
              {errors.email && <p className="mt-1.5 text-sm text-red-500">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-[rgb(var(--color-text))] mb-2">Password</label>
              <div className="relative">
                <HiLockClosed className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[rgb(var(--color-text-muted))]" />
                <input type={showPassword ? 'text' : 'password'} value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                  className={`w-full pl-11 pr-12 py-3 rounded-xl border bg-transparent text-[rgb(var(--color-text))] placeholder:text-[rgb(var(--color-text-muted))] focus:ring-2 focus:ring-primary-500/30 outline-none transition-all ${errors.password ? 'border-red-500' : 'border-[rgb(var(--color-border))]'}`}
                  placeholder="Min. 8 characters" aria-label="Password" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[rgb(var(--color-text-muted))] hover:text-[rgb(var(--color-text))]" aria-label={showPassword ? 'Hide password' : 'Show password'}>
                  {showPassword ? <HiEyeOff className="w-5 h-5" /> : <HiEye className="w-5 h-5" />}
                </button>
              </div>
              <div className="mt-2 h-7">
                {form.password && (
                  <>
                    <div className="flex gap-1 mb-1">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className={`h-1.5 flex-1 rounded-full ${i <= strength ? strengthConfig[strength].color : 'bg-[rgb(var(--color-border))]'}`} />
                      ))}
                    </div>
                    <p className="text-xs text-[rgb(var(--color-text-muted))]">{strengthConfig[strength]?.label || ''}</p>
                  </>
                )}
              </div>
              {errors.password && <p className="mt-1.5 text-sm text-red-500">{errors.password}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-[rgb(var(--color-text))] mb-2">Confirm Password</label>
              <div className="relative">
                <HiLockClosed className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[rgb(var(--color-text-muted))]" />
                <input type="password" value={form.confirmPassword} onChange={(e) => setForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                  className={`w-full pl-11 pr-4 py-3 rounded-xl border bg-transparent text-[rgb(var(--color-text))] placeholder:text-[rgb(var(--color-text-muted))] focus:ring-2 focus:ring-primary-500/30 outline-none transition-all ${errors.confirmPassword ? 'border-red-500' : 'border-[rgb(var(--color-border))]'}`}
                  placeholder="Repeat your password" aria-label="Confirm password" />
              </div>
              {errors.confirmPassword && <p className="mt-1.5 text-sm text-red-500">{errors.confirmPassword}</p>}
            </div>

            <Button type="submit" variant="primary" className="w-full py-3.5" loading={loading}>
              Create Account <FiArrowRight className="w-4 h-4" />
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[rgb(var(--color-border))]" /></div>
            <div className="relative flex justify-center text-sm"><span className="px-4 bg-white dark:bg-surface-900 text-[rgb(var(--color-text-muted))]">or</span></div>
          </div>

          <button onClick={handleGoogleSignup} className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-[rgb(var(--color-border))] text-[rgb(var(--color-text))] hover:bg-[rgb(var(--color-surface))] transition-colors font-medium">
            <FcGoogle className="w-5 h-5" /> Sign up with Google
          </button>

          <p className="text-center mt-6 text-sm text-[rgb(var(--color-text-muted))]">
            Already have an account?{' '}
            <Link to={ROUTES.LOGIN} className="font-semibold text-primary-600 dark:text-primary-400 hover:underline">Sign in</Link>
          </p>

          <p className="text-center mt-4 text-xs text-[rgb(var(--color-text-muted))]">
            By signing up, you agree to our{' '}
            <Link to="/terms" className="hover:underline font-medium">Terms of Service</Link> and{' '}
            <Link to="/privacy" className="hover:underline font-medium">Privacy Policy</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
