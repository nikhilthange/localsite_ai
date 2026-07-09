import { useContext, useMemo } from 'react';
import { AuthContext } from '../context/AuthContext';

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  const {
    user,
    token,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    updateProfile,
    verifyEmail,
    googleLogin,
  } = context;

  return useMemo(
    () => ({
      user,
      token,
      isAuthenticated,
      loading,
      login,
      register,
      logout,
      forgotPassword,
      resetPassword,
      updateProfile,
      verifyEmail,
      googleLogin,
    }),
    [
      user,
      token,
      isAuthenticated,
      loading,
      login,
      register,
      logout,
      forgotPassword,
      resetPassword,
      updateProfile,
      verifyEmail,
      googleLogin,
    ]
  );
}
