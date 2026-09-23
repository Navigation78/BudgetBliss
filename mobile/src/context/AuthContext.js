import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { getCurrentUser, setCurrentUser, clearCurrentUser } from '../utils/auth';

const AuthContext = createContext(null);

// Login and signup screens call signIn() here, then RootNavigator switches stacks
// from auth screens to app tabs based on the resulting user state.
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCurrentUser().then((u) => {
      setUser(u);
      setLoading(false);
    });
  }, []);

  const signIn = useCallback(async (u) => {
    await setCurrentUser(u);
    setUser(u);
  }, []);

  const signOut = useCallback(async () => {
    await clearCurrentUser();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
