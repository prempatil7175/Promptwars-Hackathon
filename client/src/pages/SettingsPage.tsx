import { useEffect, useState } from 'react';
import {
  CheckCircle2,
  Database,
  Lock,
  RefreshCw,
  Server,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { CardSkeleton } from '../components/ui/Skeleton';
import { useAuth } from '../context/AuthContext';
import { useDemoMode } from '../context/DemoModeContext';
import { MOCK_HEALTH } from '../data/mockData';
import { fetchServerHealth } from '../lib/api';
import { isSupabaseConfigured } from '../lib/supabase';
import type { ServerHealth } from '../types';

export function SettingsPage() {
  const { user, signOut } = useAuth();
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
      {/* Demo Kill Switch Card */}
      <section className="rounded-2xl border border-white/10 bg-[#111116] p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-500/30 bg-amber-500/10">
              <ShieldCheck className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-zinc-100">
                Global Unbreakable Demo Kill Switch
              </h2>
              <p className="mt-0.5 text-xs text-zinc-400">
                Toggle anytime in the header or press{' '}
                <kbd className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[10px] text-zinc-200">
                  Ctrl+Shift+D
                </kbd>
                . Core local PII sanitization works offline even without backend connectivity.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={toggleDemoMode}
            className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
              isDemoMode
                ? 'bg-amber-500 text-zinc-950 hover:bg-amber-400'
                : 'border border-white/15 bg-white/[0.06] text-zinc-100 hover:bg-white/10'
            }`}
          >
            {isDemoMode ? 'Switch to Live AI Mode' : 'Force Demo Mode'}
          </button>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-white/10 bg-[#09090b] p-3.5">
            <p className="text-[11px] text-zinc-400">Current Mode</p>
            <p className="mt-1 text-sm font-semibold text-zinc-100">
              {isDemoMode ? 'Cached Demo Mode' : 'Live Optional AI + Local Shield'}
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-[#09090b] p-3.5">
            <p className="text-[11px] text-zinc-400">Fallbacks Triggered</p>
            <p className="mt-1 font-mono text-sm font-semibold text-zinc-100">
              {fallbackCount}
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-[#09090b] p-3.5">
            <p className="text-[11px] text-zinc-400">Last Fallback Reason</p>
            <p className="mt-1 truncate text-xs font-medium text-zinc-300">
              {lastFallbackReason || 'None yet'}
            </p>
          </div>
        </div>
      </section>

      {/* Backend & Integration Status */}
      <section className="rounded-2xl border border-white/10 bg-[#111116] p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-zinc-100">
              Service &amp; Environment Readiness
            </h2>
            <p className="text-xs text-zinc-400">
              Optional AI &amp; Auth integrations degrade cleanly when .env keys are blank
            </p>
          </div>
          <button
            type="button"
            onClick={() => void checkHealth()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-zinc-200 transition hover:bg-white/10"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
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
            <div className="rounded-xl border border-white/10 bg-[#09090b] p-4">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2 text-xs font-medium text-zinc-300">
                  <Server className="h-4 w-4 text-indigo-400" />
                  Express API
                </span>
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              </div>
              <p className="mt-3 text-sm font-semibold text-zinc-100">
                {health?.status === 'ok' ? 'Reachable (:4000)' : 'Offline / Local Only'}
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                Rate-limited, CORS-restricted optional AI endpoints
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-[#09090b] p-4">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2 text-xs font-medium text-zinc-300">
                  <Sparkles className="h-4 w-4 text-violet-400" />
                  Gemini API Key
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                    health?.services.geminiConfigured
                      ? 'bg-emerald-500/15 text-emerald-300'
                      : 'bg-amber-500/15 text-amber-300'
                  }`}
                >
                  {health?.services.geminiConfigured ? 'Configured' : 'Mock Fallback'}
                </span>
              </div>
              <p className="mt-3 text-sm font-semibold text-zinc-100">
                gemini-2.5-flash
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                Server-side only • Synthetic samples &amp; sanitized audit only
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-[#09090b] p-4">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2 text-xs font-medium text-zinc-300">
                  <Database className="h-4 w-4 text-emerald-400" />
                  Supabase Auth &amp; DB
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                    isSupabaseConfigured && health?.services.supabaseConfigured
                      ? 'bg-emerald-500/15 text-emerald-300'
                      : 'bg-zinc-500/20 text-zinc-300'
                  }`}
                >
                  {isSupabaseConfigured ? 'Client Ready' : 'Demo Ready'}
                </span>
              </div>
              <p className="mt-3 text-sm font-semibold text-zinc-100">
                {user?.isDemoUser ? 'Demo User Session' : user?.email}
              </p>
              <button
                type="button"
                onClick={() => void signOut()}
                className="mt-2 text-xs font-medium text-indigo-400 hover:text-indigo-300"
              >
                Switch or Sign Out →
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Honest Privacy Architecture & Threat Model */}
      <section className="rounded-2xl border border-white/10 bg-[#111116] p-5">
        <div className="flex items-center gap-2">
          <Lock className="h-4 w-4 text-emerald-400" />
          <h2 className="text-sm font-semibold text-zinc-100">
            Privacy Architecture &amp; Threat Model
          </h2>
        </div>
        <div className="mt-3 grid gap-3 text-xs leading-relaxed text-zinc-400 md:grid-cols-2">
          <div className="rounded-xl border border-white/10 bg-[#09090b] p-4">
            <p className="font-semibold text-zinc-200">Guaranteed in Normal Application Flows</p>
            <ul className="mt-2 list-disc space-y-1 pl-4">
              <li>Original text, uploaded `.txt`/`.csv` files, and pseudonym mappings stay strictly in transient browser memory.</li>
              <li>No raw documents are written to `localStorage`, `sessionStorage`, `IndexedDB`, or browser logs.</li>
              <li>Optional AI Advisory Audit re-runs local PII detection and blocks dispatch if any PII remains.</li>
            </ul>
          </div>
          <div className="rounded-xl border border-white/10 bg-[#09090b] p-4">
            <p className="font-semibold text-zinc-200">Threat Model Boundaries</p>
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
