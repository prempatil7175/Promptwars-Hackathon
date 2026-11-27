import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { withDemoFallback, type DemoFallbackResult } from '../lib/demoFallback';
import { useToast } from './ToastContext';

interface DemoModeContextValue {
  isDemoMode: boolean;
  setDemoMode: (enabled: boolean) => void;
  toggleDemoMode: () => void;
  fallbackCount: number;
  lastFallbackReason: string | null;
  runWithFallback: <T>(
    liveFn: (signal: AbortSignal) => Promise<T>,
    mockData: T | (() => T),
    label?: string
  ) => Promise<DemoFallbackResult<T>>;
}

const STORAGE_KEY = 'hackathon_demo_mode';
const DemoModeContext = createContext<DemoModeContextValue | undefined>(undefined);

export function DemoModeProvider({ children }: { children: React.ReactNode }) {
  const { addToast } = useToast();
  const [isDemoMode, setIsDemoMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });
  const [fallbackCount, setFallbackCount] = useState(0);
  const [lastFallbackReason, setLastFallbackReason] = useState<string | null>(null);

  const setDemoMode = useCallback(
    (enabled: boolean) => {
      setIsDemoMode(enabled);
      try {
        localStorage.setItem(STORAGE_KEY, String(enabled));
      } catch {
        // Ignore storage errors in restricted environments
      }
      addToast({
        title: enabled ? 'Demo Mode Enabled' : 'Live AI Mode Active',
        description: enabled
          ? 'Serving instant cached mock payloads (Ctrl+Shift+D to switch).'
          : 'Routing calls to live API with 8s fallback protection.',
        variant: enabled ? 'warning' : 'success',
      });
    },
    [addToast]
  );

  const toggleDemoMode = useCallback(() => {
    setDemoMode(!isDemoMode);
  }, [isDemoMode, setDemoMode]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'd') {
        event.preventDefault();
        toggleDemoMode();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleDemoMode]);

  const runWithFallback = useCallback(
    async <T,>(
      liveFn: (signal: AbortSignal) => Promise<T>,
      mockData: T | (() => T),
      label = 'API request'
    ): Promise<DemoFallbackResult<T>> => {
      return withDemoFallback(liveFn, mockData, {
        isDemoMode,
        timeoutMs: 8000,
        label,
        onFallback: (reason) => {
          setFallbackCount((c) => c + 1);
          setLastFallbackReason(reason);
          if (!isDemoMode) {
            addToast({
              title: `${label}: Demo Fallback Active`,
              description: reason,
              variant: 'info',
            });
          }
        },
      });
    },
    [isDemoMode, addToast]
  );

  return (
    <DemoModeContext.Provider
      value={{
        isDemoMode,
        setDemoMode,
        toggleDemoMode,
        fallbackCount,
        lastFallbackReason,
        runWithFallback,
      }}
    >
      {children}
    </DemoModeContext.Provider>
  );
}

export function useDemoMode() {
  const ctx = useContext(DemoModeContext);
  if (!ctx) {
    throw new Error('useDemoMode must be used within DemoModeProvider');
  }
  return ctx;
}
