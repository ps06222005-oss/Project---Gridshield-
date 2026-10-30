import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, signInWithPopup, signOut as fbSignOut, onIdTokenChanged } from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';
import { setAuthTokenProvider } from '../api/client';

interface AuthContextType {
  user: User | null;
  idToken: string | null;
  isGuest: boolean;
  isLoading: boolean;
  authError: string | null;
  signInWithGoogle: () => Promise<boolean>;
  signInAsGuest: () => void;
  signOut: () => Promise<void>;
  clearAuthError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const GUEST_STORAGE_KEY = 'gridshield_is_guest_mode_v1';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [idToken, setIdToken] = useState<string | null>(null);
  const [isGuest, setIsGuest] = useState<boolean>(() => {
    try {
      return localStorage.getItem(GUEST_STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    // Register token provider with the API client, supporting forced refresh
    setAuthTokenProvider(async (forceRefresh = false) => {
      if (auth.currentUser) {
        return auth.currentUser.getIdToken(forceRefresh);
      }
      return null;
    });

    // onIdTokenChanged automatically handles login, logout, and token auto-refresh (every 60 mins)
    const unsubscribe = onIdTokenChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const token = await currentUser.getIdToken();
          setIdToken(token);
          setIsGuest(false);
          try {
            localStorage.removeItem(GUEST_STORAGE_KEY);
          } catch {}
        } catch (e) {
          console.error('[auth] Failed to retrieve ID token', e);
        }
      } else {
        setIdToken(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async (): Promise<boolean> => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      setUser(result.user);
      // Obtain a freshly minted ID token upon Google Sign-In
      const token = await result.user.getIdToken(true);
      setIdToken(token);
      setIsGuest(false);
      try {
        localStorage.removeItem(GUEST_STORAGE_KEY);
      } catch {}
      setIsLoading(false);
      return true;
    } catch (err: any) {
      console.warn('[auth] Google sign-in failed or cancelled:', err?.message || err);
      // Friendly message for popup closed or config error
      let msg = 'Google sign in failed. Please try again or explore as guest.';
      if (err?.code === 'auth/popup-closed-by-user') {
        msg = 'Sign-in cancelled. You can sign in anytime or explore as guest.';
      } else if (err?.code === 'auth/unauthorized-domain') {
        msg = 'Domain not authorized in Firebase Console. You can explore as guest.';
      } else if (err?.code === 'auth/invalid-api-key') {
        msg = 'Firebase API key not yet configured in .env. You can explore as guest.';
      }
      setAuthError(msg);
      setIsLoading(false);
      return false;
    }
  };

  const signInAsGuest = () => {
    setIsGuest(true);
    try {
      localStorage.setItem(GUEST_STORAGE_KEY, 'true');
    } catch {}
    setAuthError(null);
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      await fbSignOut(auth);
    } catch (e) {
      console.error('[auth] Sign out error', e);
    }
    setUser(null);
    setIdToken(null);
    setIsGuest(false);
    try {
      localStorage.removeItem(GUEST_STORAGE_KEY);
    } catch {}
    setIsLoading(false);
  };

  const clearAuthError = () => setAuthError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        idToken,
        isGuest,
        isLoading,
        authError,
        signInWithGoogle,
        signInAsGuest,
        signOut,
        clearAuthError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
