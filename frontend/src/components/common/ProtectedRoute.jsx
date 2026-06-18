import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import Loading from './Loading';

export default function ProtectedRoute({ children, isAuthenticated, isAdmin, requiredRole, loading: authLoading, redirectTo = '/login' }) {
  const location = useLocation();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      setChecking(false);
    }
  }, [authLoading]);

  if (authLoading || checking) {
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
