import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { loginWithEmail, logout as firebaseLogout, resetPassword as firebaseReset } from '@/services/authService';
import { detectRoleFromEmail } from '@/services/authService';

const AuthContext = createContext(null);

const SESSION_KEY = 'bsp_user_session';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(SESSION_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUser(parsed);
        setRole(parsed.role);
      } catch (_) {
        localStorage.removeItem(SESSION_KEY);
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const userData = await loginWithEmail(email, password);
      const role = userData.role || detectRoleFromEmail(email);
      const sessionUser = { ...userData, role };
      setUser(sessionUser);
      setRole(role);
      localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
      return role;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    await firebaseLogout();
    setUser(null);
    setRole(null);
    localStorage.removeItem(SESSION_KEY);
  }, []);

  const resetPassword = useCallback(async (email) => {
    return firebaseReset(email);
  }, []);

  return (
    <AuthContext.Provider value={{ user, role, loading, login, logout, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export default AuthContext;
