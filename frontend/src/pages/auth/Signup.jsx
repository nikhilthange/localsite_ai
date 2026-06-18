import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { HiMail, HiLockClosed, HiUser, HiEye, HiEyeOff } from 'react-icons/hi';
import { FcGoogle } from 'react-icons/fc';
import Button from '@/components/common/Button';
import { useAuth } from '@/context/AuthContext';

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
  const { register, googleLogin } = useAuth();
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
    else if (form.password.length < 8) errs.password = 'Password must be at least 8 characters';
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
      navigate('/dashboard', { replace: true });
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
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-700 relative overflow-hidden order-last">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent" />
        <div className="absolute top-20 right-20 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-black/10 rounded-full blur-3xl" />
        <div className="relative z-10 flex flex-col justify-center p-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <h2 className="text-4xl font-bold text-white mb-4">Start Building!</h2>
            <p className="text-violet-200 text-lg mb-8">Create stunning AI-powered websites in minutes.</p>
            <div className="space-y-6">
              {['AI generates complete websites', 'Professional templates', 'Custom domain support', 'SEO optimized', 'Real-time analytics'].map((feature, i) => (
                <div key={i} className="flex items-center gap-4 text-white/80">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8 bg-white dark:bg-gray-950">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Create Account</h1>
            <p className="text-gray-500 dark:text-gray-400">Get started with your free account today.</p>
          </div>

          {errors.form && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-600 dark:text-red-400">
              {errors.form}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
              <div className="relative">
                <HiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="text" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  className={`w-full pl-11 pr-4 py-3 rounded-xl border bg-transparent text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-colors ${errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'}`}
                  placeholder="John Doe" />
              </div>
              {errors.name && <p className="mt-1.5 text-sm text-red-500">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
              <div className="relative">
                <HiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                  className={`w-full pl-11 pr-4 py-3 rounded-xl border bg-transparent text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-colors ${errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'}`}
                  placeholder="you@example.com" />
              </div>
              {errors.email && <p className="mt-1.5 text-sm text-red-500">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Password</label>
              <div className="relative">
                <HiLockClosed className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type={showPassword ? 'text' : 'password'} value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                  className={`w-full pl-11 pr-12 py-3 rounded-xl border bg-transparent text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-colors ${errors.password ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'}`}
                  placeholder="Min. 8 characters" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <HiEyeOff className="w-5 h-5" /> : <HiEye className="w-5 h-5" />}
                </button>
              </div>
              {form.password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className={`h-1 flex-1 rounded-full ${i <= strength ? strengthConfig[strength].color : 'bg-gray-200 dark:bg-gray-700'}`} />
                    ))}
                  </div>
                  <p className="text-xs text-gray-500">{strengthConfig[strength]?.label || ''}</p>
                </div>
              )}
              {errors.password && <p className="mt-1.5 text-sm text-red-500">{errors.password}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Confirm Password</label>
              <div className="relative">
                <HiLockClosed className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="password" value={form.confirmPassword} onChange={(e) => setForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                  className={`w-full pl-11 pr-4 py-3 rounded-xl border bg-transparent text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-colors ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'}`}
                  placeholder="Repeat your password" />
              </div>
              {errors.confirmPassword && <p className="mt-1.5 text-sm text-red-500">{errors.confirmPassword}</p>}
            </div>

            <Button type="submit" variant="primary" className="w-full rounded-xl py-3.5" loading={loading}>
              Create Account
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300 dark:border-gray-700" /></div>
            <div className="relative flex justify-center text-sm"><span className="px-4 bg-white dark:bg-gray-950 text-gray-500">or</span></div>
          </div>

          <button onClick={handleGoogleSignup} className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors font-medium">
            <FcGoogle className="w-5 h-5" /> Sign up with Google
          </button>

          <p className="text-center mt-6 text-sm text-gray-500 dark:text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="text-violet-600 dark:text-violet-400 hover:underline font-medium">Sign in</Link>
          </p>

          <p className="text-center mt-4 text-xs text-gray-400">
            By signing up, you agree to our{' '}
            <Link to="/terms" className="hover:underline">Terms of Service</Link> and{' '}
            <Link to="/privacy" className="hover:underline">Privacy Policy</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
