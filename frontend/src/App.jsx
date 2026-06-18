import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';
import Loader from '@/components/ui/Loader';
import PublicLayout from '@/components/layout/PublicLayout';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';

const Home = lazy(() => import('@/pages/Home'));
const Login = lazy(() => import('@/pages/auth/Login'));
const Signup = lazy(() => import('@/pages/auth/Signup'));
const ForgotPassword = lazy(() => import('@/pages/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('@/pages/auth/ResetPassword'));
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
      <h2 className="text-2xl font-bold text-red-600">Something went wrong</h2>
      <pre className="max-w-lg overflow-auto rounded-lg bg-red-50 p-4 text-sm text-red-800 dark:bg-red-950 dark:text-red-200">
        {error.message}
      </pre>
      <button onClick={resetErrorBoundary} className="rounded-lg bg-primary-600 px-6 py-2 text-white transition-colors hover:bg-primary-700">
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
        <Route index element={<Home />} />
        <Route path="login" element={<Login />} />
        <Route path="signup" element={<Signup />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
        <Route path="reset-password/:token" element={<ResetPassword />} />
        <Route path="pricing" element={<Pricing />} />
        <Route path="contact" element={<Contact />} />
      </Route>

      <Route
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated} loading={loading} isAdmin={user?.role === 'admin' || user?.role === 'super_admin'}>
            <DashboardLayout user={user} isAdmin={user?.role === 'admin' || user?.role === 'super_admin'} onLogout={logout} isDark={isDark} onToggleDark={toggleTheme}>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="websites" element={<Websites />} />
                  <Route path="websites/generate" element={<GenerateWebsite />} />
                  <Route path="websites/:id" element={<WebsiteDetail />} />
                  <Route path="websites/:id/edit" element={<EditWebsite />} />
                  <Route path="settings" element={<Settings />} />
                  <Route path="analytics" element={<Analytics />} />
                  <Route path="leads" element={<Leads />} />
                  <Route path="billing" element={<Billing />} />
                  <Route path="admin" element={<AdminDashboard />} />
                  <Route path="admin/users" element={<AdminUsers />} />
                  <Route path="growth" element={<GrowthAssistant />} />
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </Suspense>
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
