import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { HiMail, HiLockClosed, HiEye, HiEyeOff } from 'react-icons/hi';
import { FcGoogle } from 'react-icons/fc';
import Button from '@/components/common/Button';
import { useAuth } from '@/context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, googleLogin } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const from = location.state?.from?.pathname || '/dashboard';

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
      setErrors({ form: err.response?.data?.message || 'Invalid credentials' });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/google`;
    } catch (err) {
      setErrors({ form: 'Google login failed' });
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent" />
        <div className="absolute top-20 left-20 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-black/10 rounded-full blur-3xl" />
        <div className="relative z-10 flex flex-col justify-center p-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <h2 className="text-4xl font-bold text-white mb-4">Welcome Back!</h2>
            <p className="text-violet-200 text-lg mb-8">Continue building amazing websites with AI.</p>
            <div className="space-y-4">
              <div className="flex items-center gap-4 text-white/80">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                </div>
                <span>AI-powered website generation</span>
              </div>
              <div className="flex items-center gap-4 text-white/80">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                </div>
                <span>Beautiful templates & designs</span>
              </div>
              <div className="flex items-center gap-4 text-white/80">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                </div>
                <span>SEO optimized & mobile ready</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8 bg-white dark:bg-gray-950">
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Sign In</h1>
            <p className="text-gray-500 dark:text-gray-400">Access your dashboard and continue where you left off.</p>
          </div>

          {errors.form && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-600 dark:text-red-400">
              {errors.form}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
              <div className="relative">
                <HiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                  className={`w-full pl-11 pr-4 py-3 rounded-xl border bg-transparent text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-colors ${errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'}`}
                  placeholder="you@example.com"
                />
              </div>
              {errors.email && <p className="mt-1.5 text-sm text-red-500">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Password</label>
              <div className="relative">
                <HiLockClosed className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                  className={`w-full pl-11 pr-12 py-3 rounded-xl border bg-transparent text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-colors ${errors.password ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'}`}
                  placeholder="Enter your password"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  {showPassword ? <HiEyeOff className="w-5 h-5" /> : <HiEye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="mt-1.5 text-sm text-red-500">{errors.password}</p>}
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-sm text-violet-600 dark:text-violet-400 hover:underline font-medium">
                Forgot password?
              </Link>
            </div>

            <Button type="submit" variant="primary" className="w-full rounded-xl py-3.5" loading={loading}>
              Sign In
            </Button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-700" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white dark:bg-gray-950 text-gray-500">or continue with</span>
            </div>
          </div>

          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors font-medium"
          >
            <FcGoogle className="w-5 h-5" />
            Sign in with Google
          </button>

          <p className="text-center mt-8 text-sm text-gray-500 dark:text-gray-400">
            Don't have an account?{' '}
            <Link to="/signup" className="text-violet-600 dark:text-violet-400 hover:underline font-medium">
              Create one
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
