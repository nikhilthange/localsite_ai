import { Navigate, useLocation } from 'react-router-dom';
import Loading from './Loading';

export default function ProtectedRoute({ children, isAuthenticated, isAdmin, requiredRole, loading: authLoading, redirectTo = '/login' }) {
  const location = useLocation();

  if (authLoading) {
    return <Loading fullPage label="Verifying authentication..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  if (requiredRole === 'admin' && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
