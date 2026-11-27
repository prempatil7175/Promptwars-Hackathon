import { useEffect, useState } from 'react';
import {
  CheckCircle2,
  Database,
  Lock,
  Moon,
  RefreshCw,
  Server,
  ShieldCheck,
  Sparkles,
  Sun,
} from 'lucide-react';
import { CardSkeleton } from '../components/ui/Skeleton';
import { useAuth } from '../context/AuthContext';
import { useDemoMode } from '../context/DemoModeContext';
import { useTheme } from '../context/ThemeContext';
import { MOCK_HEALTH } from '../data/mockData';
import { fetchServerHealth } from '../lib/api';
import { isSupabaseConfigured } from '../lib/supabase';
import type { ServerHealth } from '../types';

export function SettingsPage() {
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const { isDemoMode, toggleDemoMode, fallbackCount, lastFallbackReason, runWithFallback } =
    useDemoMode();

  const [health, setHealth] = useState<ServerHealth | null>(null);
  const [loading, setLoading] = useState(true);

  const checkHealth = async () => {
    setLoading(true);
    const res = await runWithFallback(
      (signal) => fetchServerHealth(signal),
      MOCK_HEALTH,
      'Health Check'
    );
    setHealth(res.data);
    setLoading(false);
  };

  useEffect(() => {
    void checkHealth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6">
      {/* Appearance / Light & Dark Theme Card */}
      <section className="rounded-2xl border border-[#AFB4CE] bg-white p-5 shadow-[0_8px_24px_-10px_rgba(18,20,31,0.10)] dark:border-[#383E5C] dark:bg-[#1B1F30] dark:shadow-[0_10px_28px_-10px_rgba(0,0,0,0.45)]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#AFB4CE] bg-[#E4E6F0] dark:border-[#383E5C] dark:bg-[#232739]">
              {theme === 'dark' ? (
                <Moon className="h-5 w-5 text-[#8B93C9]" />
              ) : (
                <Sun className="h-5 w-5 text-[#4F5580]" />
              )}
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-[-0.01em] text-[#12141F] dark:text-white">
                Appearance &amp; Color Theme
              </h2>
              <p className="mt-0.5 text-xs text-[#4F5580] dark:text-[#AFB4CE]">
                Switch between Ice Gray light mode and Midnight Navy dark mode across all views.
              </p>
            </div>
          </div>

          <div className="inline-flex rounded-full border border-[#AFB4CE] bg-[#E4E6F0]/60 p-1 dark:border-[#383E5C] dark:bg-[#12141F]">
            <button
              type="button"
              onClick={() => setTheme('light')}
              className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                theme === 'light'
                  ? 'bg-[#4F5580] text-white shadow-xs'
                  : 'text-[#4F5580] hover:text-[#12141F] dark:text-[#AFB4CE] dark:hover:text-white'
              }`}
            >
              <Sun className="h-3.5 w-3.5" />
              Light
            </button>
            <button
              type="button"
              onClick={() => setTheme('dark')}
              className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                theme === 'dark'
                  ? 'bg-[#5B6396] text-white shadow-xs'
                  : 'text-[#4F5580] hover:text-[#12141F] dark:text-[#AFB4CE] dark:hover:text-white'
              }`}
            >
              <Moon className="h-3.5 w-3.5" />
              Dark
            </button>
          </div>
        </div>
      </section>

      {/* Demo Kill Switch Card */}
      <section className="rounded-2xl border border-[#AFB4CE] bg-white p-5 shadow-[0_8px_24px_-10px_rgba(18,20,31,0.10)] dark:border-[#383E5C] dark:bg-[#1B1F30] dark:shadow-[0_10px_28px_-10px_rgba(0,0,0,0.45)]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#AFB4CE] bg-[#E4E6F0] dark:border-[#383E5C] dark:bg-[#232739]">
              <ShieldCheck className="h-5 w-5 text-[#4F5580] dark:text-[#8B93C9]" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-[-0.01em] text-[#12141F] dark:text-white">
                Global Unbreakable Demo Kill Switch
              </h2>
              <p className="mt-0.5 text-xs text-[#4F5580] dark:text-[#AFB4CE]">
                Toggle anytime in the header or press{' '}
                <kbd className="rounded border border-[#AFB4CE] bg-[#E4E6F0] px-1.5 py-0.5 font-mono text-[10px] text-[#12141F] dark:border-[#383E5C] dark:bg-[#12141F] dark:text-[#E4E6F0]">
                  Ctrl+Shift+D
                </kbd>
                . Core local PII sanitization works offline even without backend connectivity.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={toggleDemoMode}
            className={`rounded-full px-5 py-2 text-xs font-semibold transition ${
              isDemoMode
                ? 'bg-[#232739] text-white hover:bg-[#12141F] dark:border dark:border-amber-500/40 dark:bg-amber-500/20 dark:text-amber-100'
                : 'bg-[#4F5580] text-white hover:bg-[#383E5C] dark:bg-[#5B6396] dark:hover:bg-[#4F5580]'
            }`}
          >
            {isDemoMode ? 'Switch to Live AI Mode' : 'Force Demo Mode'}
          </button>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-[#AFB4CE] bg-[#E4E6F0]/45 p-3.5 dark:border-[#383E5C] dark:bg-[#12141F]/70">
            <p className="text-[11px] font-medium text-[#4F5580] dark:text-[#AFB4CE]">Current Mode</p>
            <p className="mt-1 text-sm font-semibold text-[#12141F] dark:text-white">
              {isDemoMode ? 'Cached Demo Mode' : 'Live Optional AI + Local Shield'}
            </p>
          </div>
          <div className="rounded-xl border border-[#AFB4CE] bg-[#E4E6F0]/45 p-3.5 dark:border-[#383E5C] dark:bg-[#12141F]/70">
            <p className="text-[11px] font-medium text-[#4F5580] dark:text-[#AFB4CE]">Fallbacks Triggered</p>
            <p className="mt-1 font-mono text-sm font-semibold text-[#12141F] dark:text-white">
              {fallbackCount}
            </p>
          </div>
          <div className="rounded-xl border border-[#AFB4CE] bg-[#E4E6F0]/45 p-3.5 dark:border-[#383E5C] dark:bg-[#12141F]/70">
            <p className="text-[11px] font-medium text-[#4F5580] dark:text-[#AFB4CE]">Last Fallback Reason</p>
            <p className="mt-1 truncate text-xs font-medium text-[#12141F] dark:text-[#E4E6F0]">
              {lastFallbackReason || 'None yet'}
            </p>
          </div>
        </div>
      </section>

      {/* Backend & Integration Status */}
      <section className="rounded-2xl border border-[#AFB4CE] bg-white p-5 shadow-[0_8px_24px_-10px_rgba(18,20,31,0.10)] dark:border-[#383E5C] dark:bg-[#1B1F30] dark:shadow-[0_10px_28px_-10px_rgba(0,0,0,0.45)]">
        <div className="mb-4 flex items-center justify-between border-b border-[#E4E6F0] pb-3 dark:border-[#383E5C]">
          <div>
            <h2 className="text-sm font-bold tracking-[-0.01em] text-[#12141F] dark:text-white">
              Service &amp; Environment Readiness
            </h2>
            <p className="text-xs text-[#4F5580] dark:text-[#AFB4CE]">
              Optional AI &amp; Auth integrations degrade cleanly when .env keys are blank
            </p>
          </div>
          <button
            type="button"
            onClick={() => void checkHealth()}
            className="inline-flex items-center gap-1.5 rounded-full border border-[#AFB4CE] bg-white px-3.5 py-1.5 text-xs font-medium text-[#12141F] transition hover:border-[#4F5580] hover:bg-[#E4E6F0]/50 dark:border-[#383E5C] dark:bg-[#232739] dark:text-[#E4E6F0] dark:hover:border-[#7B81A8] dark:hover:bg-[#383E5C]"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-[#4F5580] dark:text-[#8B93C9] ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="grid gap-4 md:grid-cols-3">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-[#AFB4CE] bg-[#E4E6F0]/45 p-4 dark:border-[#383E5C] dark:bg-[#12141F]/70">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2 text-xs font-semibold text-[#12141F] dark:text-white">
                  <Server className="h-4 w-4 text-[#4F5580] dark:text-[#8B93C9]" />
                  Express API
                </span>
                <CheckCircle2 className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
              </div>
              <p className="mt-3 text-sm font-bold text-[#12141F] dark:text-white">
                {health?.status === 'ok' ? 'Reachable (:4000)' : 'Offline / Local Only'}
              </p>
              <p className="mt-1 text-xs text-[#4F5580] dark:text-[#AFB4CE]">
                Rate-limited, CORS-restricted optional AI endpoints
              </p>
            </div>

            <div className="rounded-xl border border-[#AFB4CE] bg-[#E4E6F0]/45 p-4 dark:border-[#383E5C] dark:bg-[#12141F]/70">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2 text-xs font-semibold text-[#12141F] dark:text-white">
                  <Sparkles className="h-4 w-4 text-[#4F5580] dark:text-[#8B93C9]" />
                  Gemini API Key
                </span>
                <span
                  className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
                    health?.services.geminiConfigured
                      ? 'border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-500/35 dark:bg-emerald-500/15 dark:text-emerald-200'
                      : 'border-[#AFB4CE] bg-white text-[#12141F] dark:border-[#383E5C] dark:bg-[#232739] dark:text-[#E4E6F0]'
                  }`}
                >
                  {health?.services.geminiConfigured ? 'Configured' : 'Mock Fallback'}
                </span>
              </div>
              <p className="mt-3 text-sm font-bold text-[#12141F] dark:text-white">
                gemini-2.5-flash
              </p>
              <p className="mt-1 text-xs text-[#4F5580] dark:text-[#AFB4CE]">
                Server-side only • Synthetic samples &amp; sanitized audit only
              </p>
            </div>

            <div className="rounded-xl border border-[#AFB4CE] bg-[#E4E6F0]/45 p-4 dark:border-[#383E5C] dark:bg-[#12141F]/70">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2 text-xs font-semibold text-[#12141F] dark:text-white">
                  <Database className="h-4 w-4 text-[#4F5580] dark:text-[#8B93C9]" />
                  Supabase Auth &amp; DB
                </span>
                <span
                  className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
                    isSupabaseConfigured && health?.services.supabaseConfigured
                      ? 'border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-500/35 dark:bg-emerald-500/15 dark:text-emerald-200'
                      : 'border-[#AFB4CE] bg-white text-[#12141F] dark:border-[#383E5C] dark:bg-[#232739] dark:text-[#E4E6F0]'
                  }`}
                >
                  {isSupabaseConfigured ? 'Client Ready' : 'Demo Ready'}
                </span>
              </div>
              <p className="mt-3 text-sm font-bold text-[#12141F] dark:text-white">
                {user?.isDemoUser ? 'Demo User Session' : user?.email}
              </p>
              <button
                type="button"
                onClick={() => void signOut()}
                className="mt-2 text-xs font-semibold text-[#4F5580] hover:text-[#12141F] dark:text-[#8B93C9] dark:hover:text-white"
              >
                Switch or Sign Out →
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Honest Privacy Architecture & Threat Model */}
      <section className="rounded-2xl border border-[#AFB4CE] bg-white p-5 shadow-[0_8px_24px_-10px_rgba(18,20,31,0.10)] dark:border-[#383E5C] dark:bg-[#1B1F30] dark:shadow-[0_10px_28px_-10px_rgba(0,0,0,0.45)]">
        <div className="flex items-center gap-2">
          <Lock className="h-4 w-4 text-[#4F5580] dark:text-[#8B93C9]" />
          <h2 className="text-sm font-bold tracking-[-0.01em] text-[#12141F] dark:text-white">
            Privacy Architecture &amp; Threat Model
          </h2>
        </div>
        <div className="mt-3 grid gap-3 text-xs leading-relaxed text-[#4F5580] dark:text-[#AFB4CE] md:grid-cols-2">
          <div className="rounded-xl border border-[#AFB4CE] bg-[#E4E6F0]/45 p-4 dark:border-[#383E5C] dark:bg-[#12141F]/70">
            <p className="font-semibold text-[#12141F] dark:text-white">Guaranteed in Normal Application Flows</p>
            <ul className="mt-2 list-disc space-y-1 pl-4">
              <li>Original text, uploaded `.txt`/`.csv` files, and pseudonym mappings stay strictly in transient browser memory.</li>
              <li>No raw documents are written to `localStorage`, `sessionStorage`, `IndexedDB`, or browser logs.</li>
              <li>Optional AI Advisory Audit re-runs local PII detection and blocks dispatch if any PII remains.</li>
            </ul>
          </div>
          <div className="rounded-xl border border-[#AFB4CE] bg-[#E4E6F0]/45 p-4 dark:border-[#383E5C] dark:bg-[#12141F]/70">
            <p className="font-semibold text-[#12141F] dark:text-white">Threat Model Boundaries</p>
            <ul className="mt-2 list-disc space-y-1 pl-4">
              <li>Client-side sanitization protects standard application workflows and prevents accidental server transmission.</li>
              <li>Browser-side controls cannot prevent a user with DevTools from modifying their own local JavaScript runtime.</li>
              <li>Pseudonymization provides deterministic session consistency, not cryptographic anonymity.</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
