import { useContext, useMemo } from 'react';
import { AuthContext } from '../context/AuthContext';

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  const {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    updateProfile,
    googleLogin,
  } = context;

  return useMemo(
    () => ({
      user,
      isAuthenticated,
      loading,
      login,
      register,
      logout,
      forgotPassword,
      resetPassword,
      updateProfile,
      googleLogin,
    }),
    [
      user,
      isAuthenticated,
      loading,
      login,
      register,
      logout,
      forgotPassword,
      resetPassword,
      updateProfile,
      googleLogin,
    ]
  );
}
