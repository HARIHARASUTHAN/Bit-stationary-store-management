import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  loginWithEmail,
  loginWithGoogle as firebaseLoginWithGoogle,
  logout as firebaseLogout,
  resetPassword as firebaseReset,
  detectRoleFromEmail,
  getProfile,
} from '@/services/authService';

import { auth, onAuthStateChanged } from '@/services/firebase';

const AuthContext = createContext(null);

const SESSION_KEY = 'bsp_user_session';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session from localStorage and Firebase Auth listener
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

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const tokenResult = await firebaseUser.getIdTokenResult().catch(() => ({ claims: {} }));
        let profile = {};
        try {
          profile = await getProfile();
        } catch (_) {}

        const role = profile?.role || tokenResult.claims?.role || detectRoleFromEmail(firebaseUser.email) || 'student';

        const isSuresh = firebaseUser.email === 'suresh@shopadmin.ac.in';
        const assignedShopName = isSuresh
          ? (profile?.shopName || 'RASE MECH')
          : (profile?.shopName || (firebaseUser.email === 'sis@shopadmin.ac.in' ? 'SIS BIT' : undefined));

        if (isSuresh) {
          localStorage.setItem('bsp_custom_shop_name', assignedShopName);
        }

        const sessionUser = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          role,
          displayName: profile?.name || firebaseUser.displayName || firebaseUser.email?.split('@')[0],
          name: profile?.name || firebaseUser.displayName || firebaseUser.email?.split('@')[0],
          shopName: assignedShopName,
          shopId: profile?.shopId || (isSuresh ? 'main-store' : undefined),
          department: profile?.department,
          phone: profile?.phone,
        };
        setUser(sessionUser);
        setRole(role);
        localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = useCallback(async (email, password, preferredRole = null) => {
    setLoading(true);
    try {
      const userData = await loginWithEmail(email, password, preferredRole);

      let profile = {};
      try {
        profile = await getProfile();
      } catch (_) {}

      const role = preferredRole || profile?.role || userData.role || detectRoleFromEmail(email);

      const isSuresh = email === 'suresh@shopadmin.ac.in';
      const assignedShopName = isSuresh
        ? (profile?.shopName || 'RASE MECH')
        : (profile?.shopName || (email === 'sis@shopadmin.ac.in' ? 'SIS BIT' : undefined));

      if (isSuresh) {
        localStorage.setItem('bsp_custom_shop_name', assignedShopName);
      }

      const sessionUser = {
        ...userData,
        role,
        shopName: assignedShopName,
        shopId: profile?.shopId || (isSuresh ? 'main-store' : undefined),
        department: profile?.department || userData.department,
      };
      setUser(sessionUser);
      setRole(role);
      localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
      return role;
    } finally {
      setLoading(false);
    }
  }, []);

  const loginWithGoogle = useCallback(async (preferredRole = null) => {
    setLoading(true);
    try {
      const userData = await firebaseLoginWithGoogle(preferredRole);
      const role = preferredRole || userData.role || detectRoleFromEmail(userData.email) || 'student';
      const sessionUser = { ...userData, role };
      setUser(sessionUser);
      setRole(role);
      localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
      return role;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateUserProfile = useCallback(async (data) => {
    setUser((prev) => {
      const updated = { ...prev, ...data };
      localStorage.setItem(SESSION_KEY, JSON.stringify(updated));
      return updated;
    });
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
    <AuthContext.Provider
      value={{
        user,
        role,
        loading,
        login,
        loginWithGoogle,
        updateUserProfile,
        logout,
        resetPassword,
      }}
    >
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
