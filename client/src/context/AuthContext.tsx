import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { DEMO_USER } from '../data/mockData';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import type { DemoUser } from '../types';
import { useToast } from './ToastContext';

interface AuthContextValue {
  user: DemoUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  supabaseReady: boolean;
  loginAsDemoUser: () => void;
  signInWithEmail: (email: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
}

const DEMO_USER_KEY = 'hackathon_demo_user';
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { addToast } = useToast();
  const [user, setUser] = useState<DemoUser | null>(() => {
    try {
      const saved = localStorage.getItem(DEMO_USER_KEY);
      return saved ? (JSON.parse(saved) as DemoUser) : null;
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState<boolean>(isSupabaseConfigured);

  useEffect(() => {
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      const sessionUser = data.session?.user;
      if (sessionUser) {
        const email = sessionUser.email || 'builder@hackathon.dev';
        setUser({
          id: sessionUser.id,
          name: email.split('@')[0],
          email,
          role: 'Hackathon Builder',
          organization: 'Supabase Auth',
          avatarInitials: email.slice(0, 2).toUpperCase(),
          isDemoUser: false,
        });
      }
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const email = session.user.email || 'builder@hackathon.dev';
        setUser({
          id: session.user.id,
          name: email.split('@')[0],
          email,
          role: 'Hackathon Builder',
          organization: 'Supabase Auth',
          avatarInitials: email.slice(0, 2).toUpperCase(),
          isDemoUser: false,
        });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loginAsDemoUser = useCallback(() => {
    setUser(DEMO_USER);
    try {
      localStorage.setItem(DEMO_USER_KEY, JSON.stringify(DEMO_USER));
    } catch {
      // Ignore storage error
    }
    addToast({
      title: `Signed in as ${DEMO_USER.name}`,
      description: 'Instant Demo Session loaded — all routes unlocked.',
      variant: 'success',
    });
  }, [addToast]);

  const signInWithEmail = useCallback(
    async (email: string, password: string): Promise<boolean> => {
      if (!supabase) {
        addToast({
          title: 'Supabase keys not configured',
          description: 'Use "Continue as Demo User" or configure client/.env.',
          variant: 'warning',
        });
        return false;
      }

      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        addToast({
          title: 'Sign-in fell back to guidance',
          description: error.message,
          variant: 'warning',
        });
        return false;
      }

      addToast({
        title: 'Authenticated via Supabase',
        variant: 'success',
      });
      return true;
    },
    [addToast]
  );

  const signOut = useCallback(async () => {
    if (supabase) {
      await supabase.auth.signOut().catch(() => undefined);
    }
    try {
      localStorage.removeItem(DEMO_USER_KEY);
    } catch {
      // Ignore storage error
    }
    setUser(null);
    addToast({
      title: 'Signed out',
      description: 'Returned to quick login screen.',
      variant: 'info',
    });
  }, [addToast]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isLoading,
        supabaseReady: isSupabaseConfigured,
        loginAsDemoUser,
        signInWithEmail,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
