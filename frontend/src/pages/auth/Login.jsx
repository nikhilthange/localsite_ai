import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { HiMail, HiLockClosed, HiEye, HiEyeOff, HiSparkles } from 'react-icons/hi';
import { FcGoogle } from 'react-icons/fc';
import { FiArrowRight } from 'react-icons/fi';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/utils/constants';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const from = location.state?.from?.pathname || ROUTES.DASHBOARD;

  const validate = () => {
    const errs = {};
    if (!form.email) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Invalid email';
    if (!form.password) errs.password = 'Password is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate(from, { replace: true });
    } catch (err) {
      const message = err.response?.data?.message || err.response?.data?.data?.message || 'Invalid email or password';
      if (message.toLowerCase().includes('verify your email')) {
        navigate(ROUTES.VERIFY_EMAIL, { state: { email: form.email }, replace: true });
        return;
      }
      setErrors({ form: message });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/google`;
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-surface-950">
      {/* Left Split - Brand Aesthetic */}
      <div className="hidden lg:flex lg:w-1/2 bg-surface-900 relative overflow-hidden items-center justify-center border-r border-surface-800">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-grid-dark opacity-30" />
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary-600/10 rounded-full blur-[100px] animate-pulse-slow" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[100px] animate-pulse-slow" style={{ animationDelay: '2s' }} />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-surface-950/50 to-surface-950" />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative z-10 max-w-lg px-16"
        >
          <div className="w-16 h-16 bg-surface-800/50 backdrop-blur-xl border border-surface-700 rounded-2xl flex items-center justify-center mb-8 shadow-glass">
            <HiSparkles className="w-8 h-8 text-primary-400" />
          </div>
          <h2 className="text-4xl font-display font-bold text-white mb-6 leading-tight">
            Welcome back to the <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-indigo-400">
              future of web design.
            </span>
          </h2>
          <p className="text-surface-400 text-lg mb-10 leading-relaxed">
            Continue managing your AI-generated websites, tracking analytics, and growing your digital footprint.
          </p>
          <div className="space-y-4">
            {[
              'AI-powered website generation in seconds',
              'Beautiful templates & professional designs',
              'Real-time analytics & lead tracking',
            ].map((feat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="flex items-center gap-4"
              >
                <div className="w-8 h-8 rounded-xl bg-surface-800/50 border border-surface-700 flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                </div>
                <span className="text-surface-300">{feat}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right Split - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 lg:p-16 bg-white dark:bg-surface-950">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-10">
            <Link to="/" className="inline-flex items-center gap-2.5 mb-8">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-glow">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5z" /></svg>
              </div>
            </Link>
            <h1 className="text-3xl font-display font-semibold text-surface-950 dark:text-white mb-3">Sign in</h1>
            <p className="text-surface-500">Welcome back! Enter your credentials to continue.</p>
          </div>

          {errors.form && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/50 rounded-xl text-sm text-red-600 dark:text-red-400 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              {errors.form}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">Email</label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                placeholder="you@example.com"
                leftIcon={<HiMail className="w-5 h-5" />}
                error={errors.email}
              />
              {errors.email && <p className="mt-1.5 text-sm text-red-500">{errors.email}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">Password</label>
                <Link to={ROUTES.FORGOT_PASSWORD} className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 transition-colors">
                  Forgot password?
                </Link>
              </div>
              <Input
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                placeholder="Enter your password"
                leftIcon={<HiLockClosed className="w-5 h-5" />}
                rightIcon={
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="hover:text-surface-900 dark:hover:text-white transition-colors">
                    {showPassword ? <HiEyeOff className="w-5 h-5" /> : <HiEye className="w-5 h-5" />}
                  </button>
                }
                error={errors.password}
              />
              {errors.password && <p className="mt-1.5 text-sm text-red-500">{errors.password}</p>}
            </div>

            <Button type="submit" variant="primary" className="w-full" size="lg" isLoading={loading}>
              Sign In <FiArrowRight className="w-5 h-5" />
            </Button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-surface-200 dark:border-surface-800" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white dark:bg-surface-950 text-surface-500">or continue with</span>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full"
            size="lg"
            onClick={handleGoogleLogin}
            leftIcon={<FcGoogle className="w-5 h-5" />}
          >
            Sign in with Google
          </Button>

          <p className="text-center mt-8 text-sm text-surface-500">
            Don't have an account?{' '}
            <Link to={ROUTES.SIGNUP} className="font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-500">
              Create one for free
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
