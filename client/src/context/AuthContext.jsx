import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, tokenStore } from '../lib/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [booting, setBooting] = useState(true);

  // Restore a previous session on first paint.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!tokenStore.get()) {
        setBooting(false);
        return;
      }
      try {
        const { data } = await api.get('/auth/me');
        if (cancelled) return;
        setUser(data.user);
        setProfile(data.profile);
      } catch {
        tokenStore.set(null);
      } finally {
        if (!cancelled) setBooting(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (credentials) => {
    const { data } = await api.post('/auth/login', credentials);
    tokenStore.set(data.accessToken);
    setUser(data.user);
    setProfile(data.profile);
    return data.user;
  }, []);

  const logout = useCallback(() => {
    tokenStore.set(null);
    setUser(null);
    setProfile(null);
  }, []);

  const updateProfile = useCallback(async (changes) => {
    const { data } = await api.patch('/auth/me', changes);
    setUser(data.user);
    setProfile(data.profile);
    return data;
  }, []);

  const value = useMemo(
    () => ({
      user,
      profile,
      booting,
      login,
      logout,
      updateProfile,
      isStudent: user?.role === 'student',
      isFaculty: user?.role === 'faculty',
      isAdmin: user?.role === 'admin',
    }),
    [user, profile, booting, login, logout, updateProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>');
  return context;
}
