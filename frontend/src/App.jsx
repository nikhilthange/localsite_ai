import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';
import { motion } from 'framer-motion';
import Loader from '@/components/ui/Loader';
import PublicLayout from '@/components/layout/PublicLayout';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';

const Home = lazy(() => import('@/pages/Home'));
const Login = lazy(() => import('@/pages/auth/Login'));
const Signup = lazy(() => import('@/pages/auth/Signup'));
const ForgotPassword = lazy(() => import('@/pages/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('@/pages/auth/ResetPassword'));
const VerifyEmail = lazy(() => import('@/pages/auth/VerifyEmail'));
const Pricing = lazy(() => import('@/pages/Pricing'));
const Contact = lazy(() => import('@/pages/Contact'));
const Dashboard = lazy(() => import('@/pages/dashboard/Dashboard'));
const Websites = lazy(() => import('@/pages/websites/Websites'));
const GenerateWebsite = lazy(() => import('@/pages/websites/GenerateWebsite'));
const WebsiteDetail = lazy(() => import('@/pages/websites/WebsiteDetail'));
const EditWebsite = lazy(() => import('@/pages/websites/EditWebsite'));
const Settings = lazy(() => import('@/pages/Settings'));
const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard'));
const AdminUsers = lazy(() => import('@/pages/admin/AdminUsers'));
const GrowthAssistant = lazy(() => import('@/pages/GrowthAssistant'));
const Analytics = lazy(() => import('@/pages/analytics/Analytics'));
const Leads = lazy(() => import('@/pages/crm/Leads'));
const Billing = lazy(() => import('@/pages/billing/Billing'));
const NotFound = lazy(() => import('@/pages/NotFound'));

const pageTransition = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
};

function PageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Loader size="lg" />
    </div>
  );
}

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
      <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center mb-2">
        <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
      </div>
      <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Something went wrong</h2>
      <pre className="max-w-lg overflow-auto rounded-xl bg-red-50 dark:bg-red-950 p-4 text-sm text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800">
        {error.message}
      </pre>
      <button onClick={resetErrorBoundary} className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-primary-700 shadow-lg shadow-primary-500/25">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
        Try again
      </button>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Suspense fallback={<PageLoader />}>
        <AppRoutes />
      </Suspense>
    </ErrorBoundary>
  );
}

function AppRoutes() {
  const { user, token, loading, isAuthenticated, logout } = useAuth();
  const { toggleTheme, isDark } = useTheme();

  if (loading) return <PageLoader />;

  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={
          <motion.div {...pageTransition}><Home /></motion.div>
        } />
        <Route path="login" element={
          <motion.div {...pageTransition}><Login /></motion.div>
        } />
        <Route path="signup" element={
          <motion.div {...pageTransition}><Signup /></motion.div>
        } />
        <Route path="forgot-password" element={
          <motion.div {...pageTransition}><ForgotPassword /></motion.div>
        } />
        <Route path="reset-password/:token" element={
          <motion.div {...pageTransition}><ResetPassword /></motion.div>
        } />
        <Route path="verify-email" element={
          <motion.div {...pageTransition}><VerifyEmail /></motion.div>
        } />
        <Route path="verify-email/:token" element={
          <motion.div {...pageTransition}><VerifyEmail /></motion.div>
        } />
        <Route path="pricing" element={
          <motion.div {...pageTransition}><Pricing /></motion.div>
        } />
        <Route path="contact" element={
          <motion.div {...pageTransition}><Contact /></motion.div>
        } />
      </Route>

      <Route path="*"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated} loading={loading} isAdmin={user?.role === 'admin' || user?.role === 'super_admin'}>
            <DashboardLayout user={user} isAdmin={user?.role === 'admin' || user?.role === 'super_admin'} onLogout={logout} isDark={isDark} onToggleDark={toggleTheme}>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="dashboard" element={
                    <motion.div {...pageTransition}><Dashboard /></motion.div>
                  } />
                  <Route path="websites" element={
                    <motion.div {...pageTransition}><Websites /></motion.div>
                  } />
                  <Route path="websites/generate" element={
                    <motion.div {...pageTransition}><GenerateWebsite /></motion.div>
                  } />
                  <Route path="websites/:id" element={
                    <motion.div {...pageTransition}><WebsiteDetail /></motion.div>
                  } />
                  <Route path="websites/:id/edit" element={
                    <motion.div {...pageTransition}><EditWebsite /></motion.div>
                  } />
                  <Route path="settings" element={
                    <motion.div {...pageTransition}><Settings /></motion.div>
                  } />
                  <Route path="analytics" element={
                    <motion.div {...pageTransition}><Analytics /></motion.div>
                  } />
                  <Route path="leads" element={
                    <motion.div {...pageTransition}><Leads /></motion.div>
                  } />
                  <Route path="billing" element={
                    <motion.div {...pageTransition}><Billing /></motion.div>
                  } />
                  <Route path="admin" element={
                    <motion.div {...pageTransition}><AdminDashboard /></motion.div>
                  } />
                  <Route path="admin/users" element={
                    <motion.div {...pageTransition}><AdminUsers /></motion.div>
                  } />
                  <Route path="growth" element={
                    <motion.div {...pageTransition}><GrowthAssistant /></motion.div>
                  } />
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </Suspense>
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route path="*" element={
        <motion.div {...pageTransition}><NotFound /></motion.div>
      } />
    </Routes>
  );
}
