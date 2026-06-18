import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '@/lib/axios';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const isAuthenticated = !!user && !!token;

  const storeSession = useCallback((newToken, newUser) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  }, []);

  const clearSession = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (!savedToken || !savedUser) {
      setLoading(false);
      return;
    }

    axios
      .get('/auth/me', {
        headers: { Authorization: `Bearer ${savedToken}` },
      })
      .then(({ data }) => {
        setUser(data.user);
        setToken(savedToken);
      })
      .catch(() => {
        clearSession();
      })
      .finally(() => setLoading(false));
  }, [clearSession]);

  const login = useCallback(
    async (email, password) => {
      const { data } = await axios.post('/auth/login', { email, password });
      storeSession(data.token, data.user);
      toast.success('Welcome back!');
      return data;
    },
    [storeSession]
  );

  const register = useCallback(
    async (userData) => {
      const { data } = await axios.post('/auth/register', userData);
      storeSession(data.token, data.user);
      toast.success('Account created successfully!');
      return data;
    },
    [storeSession]
  );

  const logout = useCallback(() => {
    clearSession();
    toast.success('Logged out successfully');
  }, [clearSession]);

  const forgotPassword = useCallback(async (email) => {
    const { data } = await axios.post('/auth/forgot-password', { email });
    toast.success('Password reset link sent to your email');
    return data;
  }, []);

  const resetPassword = useCallback(async (token, password) => {
    const { data } = await axios.post(`/auth/reset-password/${token}`, { password });
    toast.success('Password reset successfully');
    return data;
  }, []);

  const updateProfile = useCallback(
    async (updates) => {
      const { data } = await axios.put('/auth/profile', updates, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(data.user);
      localStorage.setItem('user', JSON.stringify(data.user));
      toast.success('Profile updated');
      return data;
    },
    [token]
  );

  const googleLogin = useCallback(
    async (credential) => {
      const { data } = await axios.post('/auth/google', { credential });
      storeSession(data.token, data.user);
      toast.success('Signed in with Google');
      return data;
    },
    [storeSession]
  );

  const value = {
    user,
    token,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    updateProfile,
    googleLogin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
