import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, KeyRound, Lock, ShieldCheck, UserCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function AuthModal() {
  const { loginAsDemoUser, signInWithEmail, supabaseReady } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    setSubmitting(true);
    await signInWithEmail(email.trim(), password);
    setSubmitting(false);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#09090b] px-4 py-12">
      <div
        className="pointer-events-none absolute -top-40 left-1/2 h-96 w-[44rem] -translate-x-1/2 rounded-full bg-indigo-600/20 blur-[140px]"
        aria-hidden="true"
      />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="relative w-full max-w-md rounded-2xl border border-white/10 bg-[#111116]/95 p-7 shadow-2xl backdrop-blur-xl"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/25">
            <ShieldCheck className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-zinc-100">
              PII GUARD
            </h1>
            <p className="text-xs text-zinc-400">
              Intelligent Data Privacy Platform • Detect. Protect. Share with Confidence.
            </p>
          </div>
        </div>

        {/* Instant Demo User CTA */}
        <div className="mt-6 rounded-xl border border-indigo-500/30 bg-indigo-500/10 p-4">
          <div className="flex items-start gap-2.5">
            <Lock className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
            <div className="text-xs leading-relaxed text-zinc-300">
              <span className="font-semibold text-zinc-100">Privacy-First Local Engine:</span>{' '}
              Launch immediately — documents stay 100% in your browser memory.
            </div>
          </div>

          <button
            type="button"
            onClick={loginAsDemoUser}
            className="mt-3.5 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:brightness-110 active:scale-[0.99]"
          >
            <UserCheck className="h-4 w-4" />
            Continue as Demo User
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <div className="my-5 flex items-center gap-3 text-[11px] uppercase tracking-wider text-zinc-500">
          <div className="h-px flex-1 bg-white/10" />
          <span>or Supabase Auth</span>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label htmlFor="auth-email" className="block text-xs font-medium text-zinc-400">
              Email address
            </label>
            <input
              id="auth-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="engineer@company.com"
              className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#09090b] px-3.5 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-indigo-500/60 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="auth-password" className="block text-xs font-medium text-zinc-400">
              Password
            </label>
            <input
              id="auth-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#09090b] px-3.5 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-indigo-500/60 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={submitting || !email.trim() || !password.trim()}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-4 py-2.5 text-sm font-medium text-zinc-200 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <KeyRound className="h-4 w-4 text-zinc-400" />
            {submitting ? 'Signing in...' : 'Sign in with Supabase'}
          </button>
        </form>

        <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4 text-[11px] text-zinc-500">
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            Offline &amp; Demo Ready
          </span>
          <span>
            Supabase: {supabaseReady ? 'Configured' : 'Demo Ready'}
          </span>
        </div>
      </motion.div>
    </div>
  );
}
