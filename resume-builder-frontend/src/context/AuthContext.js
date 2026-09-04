import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  // Apply theme & accessibility attributes to document
  const applyPreferences = (prefs) => {
    if (!prefs) return;
    const theme = prefs.theme === 'system' 
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : (prefs.theme || 'light');

    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.setAttribute('data-high-contrast', prefs.highContrast ? 'true' : 'false');
    document.documentElement.setAttribute('data-font-size', prefs.fontSize || 'normal');
    
    if (prefs.reducedMotion) {
      document.documentElement.classList.add('reduced-motion');
    } else {
      document.documentElement.classList.remove('reduced-motion');
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          const res = await api.get('/auth/me');
          if (res.data.success) {
            setUser(res.data.user);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            applyPreferences(res.data.user.preferences);
          }
        } catch {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
          setToken(null);
        }
      } else {
        // Apply default light theme
        applyPreferences({ theme: 'light' });
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (identifierOrEmail, password) => {
    let payload;
    if (typeof identifierOrEmail === 'object' && identifierOrEmail !== null) {
      payload = identifierOrEmail;
    } else {
      payload = { email: identifierOrEmail, username: identifierOrEmail, password };
    }
    const res = await api.post('/auth/login', payload);
    if (res.data.success && res.data.token) {
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setToken(res.data.token);
      setUser(res.data.user);
      applyPreferences(res.data.user.preferences);
      return res.data;
    }
    throw new Error(res.data.message || 'Login failed');
  };

  const register = async (nameOrData, username, email, password) => {
    let payload;
    if (typeof nameOrData === 'object' && nameOrData !== null) {
      payload = nameOrData;
    } else {
      payload = { name: nameOrData, username, email, password };
    }
    const res = await api.post('/auth/register', payload);
    if (res.data.success && res.data.token) {
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setToken(res.data.token);
      setUser(res.data.user);
      applyPreferences(res.data.user.preferences);
      return res.data;
    }
    throw new Error(res.data.message || 'Registration failed');
  };

  const googleLogin = async (credential, profile) => {
    const res = await api.post('/auth/google', { credential, profile });
    if (res.data.success && res.data.token) {
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setToken(res.data.token);
      setUser(res.data.user);
      applyPreferences(res.data.user.preferences);
      return res.data;
    }
    throw new Error(res.data.message || 'Google authentication failed');
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const updatePreferences = async (newPrefs) => {
    try {
      const res = await api.put('/auth/preferences', newPrefs);
      if (res.data.success) {
        const updatedUser = { ...user, preferences: res.data.preferences };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        applyPreferences(res.data.preferences);
      }
    } catch (err) {
      console.error('Failed to sync preferences:', err);
    }
  };

  const toggleTheme = () => {
    const currentTheme = user?.preferences?.theme || document.documentElement.getAttribute('data-theme') || 'light';
    const nextTheme = currentTheme === 'light' ? 'dark' : 'light';
    updatePreferences({ ...(user?.preferences || {}), theme: nextTheme });
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      isAuthenticated: !!token,
      login,
      register,
      googleLogin,
      logout,
      updatePreferences,
      toggleTheme
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
