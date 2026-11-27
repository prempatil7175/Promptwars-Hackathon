import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, KeyRound, Lock, ShieldCheck, UserCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ThemeToggle } from '../ui/ThemeToggle';

export function AuthModal() {
  const { loginAsDemoUser, signInWithEmail, supabaseReady } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const emailInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    setSubmitting(true);
    await signInWithEmail(email.trim(), password);
    setSubmitting(false);
  };

  const focusLoginForm = () => {
    emailInputRef.current?.focus();
    emailInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#E4E6F0] text-[#12141F] transition-colors duration-200 dark:bg-[#0D0F18] dark:text-[#E4E6F0]">
      {/* Minimal Top Navigation Bar */}
      <header className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-5 sm:px-8">
        <div className="flex items-center gap-2.5">
          <svg
            width="28"
            height="28"
            viewBox="0 0 28 28"
            fill="none"
            aria-hidden="true"
            className="shrink-0 text-[#12141F] dark:text-white"
          >
            <rect
              x="2.5"
              y="2.5"
              width="14"
              height="14"
              rx="4.5"
              stroke="currentColor"
              strokeWidth="2.2"
            />
            <rect
              x="11.5"
              y="11.5"
              width="14"
              height="14"
              rx="4.5"
              stroke="currentColor"
              strokeWidth="2.2"
            />
          </svg>
          <span className="font-brand whitespace-nowrap text-base font-bold tracking-[-0.01em] text-[#12141F] dark:text-white">
            PII GUARD
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-2.5">
          <ThemeToggle />
          <button
            type="button"
            onClick={loginAsDemoUser}
            className="whitespace-nowrap rounded-full bg-[#4F46E5] px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#4338CA] active:scale-[0.99] sm:px-5 sm:text-sm"
          >
            Try Demo
          </button>
          <button
            type="button"
            onClick={() => focusLoginForm()}
            className="whitespace-nowrap rounded-full border border-[#AFB4CE] bg-white px-4 py-2 text-xs font-medium text-[#12141F] transition hover:bg-[#E4E6F0]/60 active:scale-[0.99] dark:border-[#383E5C] dark:bg-[#232739] dark:text-[#E4E6F0] dark:hover:bg-[#383E5C] sm:px-5 sm:text-sm"
          >
            Log in
          </button>
        </div>
      </header>

      {/* Asymmetric Hero / Login Split */}
      <main className="relative z-10 mx-auto grid max-w-7xl items-center gap-12 px-4 pt-8 pb-16 sm:px-8 lg:grid-cols-12 lg:gap-14 lg:pt-16 lg:pb-24">
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="lg:col-span-7"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-[#AFB4CE] bg-white px-3.5 py-1.5 text-xs font-medium text-[#4F5580] shadow-xs dark:border-[#383E5C] dark:bg-[#232739] dark:text-[#E4E6F0]">
            <Lock className="h-3.5 w-3.5 shrink-0 text-[#4F5580] dark:text-[#8B93C9]" aria-hidden="true" />
            Runs entirely in your browser. No documents leave your device.
          </div>

          <h1 className="mt-6 text-4xl font-bold leading-[1.15] tracking-[-0.01em] text-[#12141F] dark:text-white sm:text-5xl lg:text-[54px] lg:leading-[1.12]">
            Detect. Protect.
            <br />
            Share with Confidence.
          </h1>

          <p className="mt-5 max-w-xl text-base leading-relaxed text-[#4F5580] dark:text-[#AFB4CE] sm:text-lg">
            Intelligent Data Privacy Platform that detects, validates, and sanitizes sensitive PII—including emails, phone numbers, IPv4/IPv6, PAN, Aadhaar, and payment cards.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3.5">
            <button
              type="button"
              onClick={loginAsDemoUser}
              className="inline-flex items-center gap-2.5 whitespace-nowrap rounded-full bg-[#4F46E5] px-7 py-3.5 text-sm font-semibold text-white shadow-[0_8px_24px_-8px_rgba(79,70,229,0.5)] transition hover:bg-[#4338CA] active:scale-[0.99] active:bg-[#3730A3]"
            >
              <UserCheck className="h-4 w-4" />
              Continue as Demo User
              <ArrowRight className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={() => focusLoginForm()}
              className="whitespace-nowrap rounded-full border border-[#AFB4CE] bg-white px-6 py-3.5 text-sm font-medium text-[#12141F] transition hover:bg-[#E4E6F0]/60 dark:border-[#383E5C] dark:bg-[#232739] dark:text-[#E4E6F0] dark:hover:bg-[#383E5C]"
            >
              Sign in with Email
            </button>
          </div>

          <div className="mt-12 grid max-w-xl grid-cols-1 gap-5 border-t border-[#AFB4CE] pt-7 dark:border-[#383E5C] sm:grid-cols-3">
            <div>
              <p className="text-xs font-semibold text-[#12141F] dark:text-white">Zero Server Egress</p>
              <p className="mt-1 text-xs leading-relaxed text-[#4F5580] dark:text-[#AFB4CE]">
                Documents stay in transient browser memory only.
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-[#12141F] dark:text-white">Checksum Validated</p>
              <p className="mt-1 text-xs leading-relaxed text-[#4F5580] dark:text-[#AFB4CE]">
                Verhoeff &amp; Luhn checks eliminate false positives.
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-[#12141F] dark:text-white">3 Redaction Modes</p>
              <p className="mt-1 text-xs leading-relaxed text-[#4F5580] dark:text-[#AFB4CE]">
                Full Mask, Partial Mask &amp; Consistent Pseudonyms.
              </p>
            </div>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, delay: 0.05 }}
          aria-label="Sign in"
          className="lg:col-span-5"
        >
          <div className="rounded-3xl border border-[#AFB4CE] bg-white p-7 shadow-[0_8px_24px_-10px_rgba(18,20,31,0.14)] dark:border-[#383E5C] dark:bg-[#1B1F30] dark:shadow-[0_14px_34px_-12px_rgba(0,0,0,0.55)] sm:p-8">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold tracking-[-0.01em] text-[#12141F] dark:text-white">
                  Workspace Access
                </h2>
                <p className="mt-0.5 text-xs text-[#4F5580] dark:text-[#AFB4CE]">
                  Sign in with Supabase or enter immediately in Demo Mode.
                </p>
              </div>
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#AFB4CE] bg-[#E4E6F0] text-[#4F5580] dark:border-[#383E5C] dark:bg-[#232739] dark:text-[#AFB4CE]">
                <ShieldCheck className="h-4 w-4" />
              </div>
            </div>

            <button
              type="button"
              onClick={loginAsDemoUser}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-[#4F46E5] px-5 py-3 text-sm font-semibold text-white shadow-[0_8px_20px_-6px_rgba(79,70,229,0.45)] transition hover:bg-[#4338CA] active:scale-[0.99] active:bg-[#3730A3]"
            >
              <UserCheck className="h-4 w-4" />
              Continue as Demo User
              <ArrowRight className="h-4 w-4" />
            </button>

            <div className="my-5 flex items-center gap-3 text-[11px] font-medium uppercase tracking-wider text-[#4F5580] dark:text-[#AFB4CE]">
              <div className="h-px flex-1 bg-[#AFB4CE] dark:bg-[#383E5C]" />
              <span>or Supabase Auth</span>
              <div className="h-px flex-1 bg-[#AFB4CE] dark:bg-[#383E5C]" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label
                  htmlFor="auth-email"
                  className="block text-xs font-medium text-[#12141F] dark:text-[#E4E6F0]"
                >
                  Email address
                </label>
                <input
                  ref={emailInputRef}
                  id="auth-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="engineer@company.com"
                  className="mt-1.5 w-full rounded-xl border border-[#AFB4CE] bg-[#E4E6F0]/40 px-3.5 py-2.5 text-sm text-[#12141F] placeholder:text-[#575D8A] focus:border-[#4F5580] focus:bg-white focus:outline-none dark:border-[#383E5C] dark:bg-[#12141F] dark:text-white dark:placeholder:text-[#9CA3C7] dark:focus:border-[#8B93C9] dark:focus:bg-[#12141F]"
                />
              </div>

              <div>
                <label
                  htmlFor="auth-password"
                  className="block text-xs font-medium text-[#12141F] dark:text-[#E4E6F0]"
                >
                  Password
                </label>
                <input
                  id="auth-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="mt-1.5 w-full rounded-xl border border-[#AFB4CE] bg-[#E4E6F0]/40 px-3.5 py-2.5 text-sm text-[#12141F] placeholder:text-[#575D8A] focus:border-[#4F5580] focus:bg-white focus:outline-none dark:border-[#383E5C] dark:bg-[#12141F] dark:text-white dark:placeholder:text-[#9CA3C7] dark:focus:border-[#8B93C9] dark:focus:bg-[#12141F]"
                />
              </div>

              <button
                type="submit"
                disabled={submitting || !email.trim() || !password.trim()}
                className="flex w-full items-center justify-center gap-2 rounded-full border border-[#AFB4CE] bg-[#E4E6F0] px-5 py-2.5 text-sm font-medium text-[#12141F] transition hover:bg-[#AFB4CE]/40 disabled:cursor-not-allowed disabled:opacity-50 dark:border-[#383E5C] dark:bg-[#232739] dark:text-[#E4E6F0] dark:hover:bg-[#383E5C]"
              >
                <KeyRound className="h-4 w-4 text-[#4F5580] dark:text-[#AFB4CE]" />
                {submitting ? 'Signing in...' : 'Sign in with Supabase'}
              </button>
            </form>

            <div className="mt-6 flex items-center justify-between border-t border-[#E4E6F0] pt-4 text-[11px] text-[#4F5580] dark:border-[#383E5C] dark:text-[#AFB4CE]">
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-[#4F5580] dark:text-[#8B93C9]" />
                Client-Side Privacy Ready
              </span>
              <span>
                Supabase: {supabaseReady ? 'Configured' : 'Demo Ready'}
              </span>
            </div>
          </div>
        </motion.section>
      </main>
    </div>
  );
}
