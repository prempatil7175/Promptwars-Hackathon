import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, KeyRound, Lock, ShieldCheck, UserCheck, X, Zap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { BentoShowcase } from './BentoShowcase';
import { StudioHeroBackdrop } from './StudioHeroBackdrop';

export function AuthModal() {
  const { loginAsDemoUser, signInWithEmail, supabaseReady } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const emailInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!showLoginModal) return;

    const focusTimer = window.setTimeout(() => {
      emailInputRef.current?.focus();
    }, 40);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowLoginModal(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.clearTimeout(focusTimer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [showLoginModal]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    setSubmitting(true);
    await signInWithEmail(email.trim(), password);
    setSubmitting(false);
  };

  return (
    <div
      style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}
      className="relative min-h-screen overflow-x-clip bg-[#E6E8F0] text-[#131420]"
    >
      {/* A. Minimal Top Navigation Bar */}
      <header className="relative z-30 mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-5">
        <div className="flex items-center gap-2.5">
          <svg
            width="28"
            height="28"
            viewBox="0 0 28 28"
            fill="none"
            aria-hidden="true"
            className="shrink-0 text-[#131420]"
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
          <span className="font-brand whitespace-nowrap text-base font-bold tracking-tight text-[#131420]">
            PII GUARD
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-2.5">
          <button
            type="button"
            onClick={loginAsDemoUser}
            className="whitespace-nowrap rounded-full bg-[#5A45F5] px-5 py-2 text-sm font-medium text-white shadow-[0_8px_20px_-6px_rgba(90,69,245,0.45)] transition hover:bg-[#4A35E0] active:scale-[0.98]"
          >
            Try Demo
          </button>
          <button
            type="button"
            onClick={() => setShowLoginModal(true)}
            className="whitespace-nowrap rounded-full border border-[#D8DCE8] bg-white px-5 py-2 text-sm font-medium text-[#131420] shadow-xs transition hover:bg-[#F4F5FA] active:scale-[0.98]"
          >
            Log in
          </button>
        </div>
      </header>

      {/* B. Hero Section (Asymmetric Split + 3D Track & Vault Backdrop) */}
      <main>
        <section className="relative mx-auto max-w-6xl px-6 pt-6 pb-12 sm:pt-10 lg:pt-14 lg:pb-16">
          <div className="grid items-center gap-8 lg:grid-cols-12">
            {/* Left Content Column */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28 }}
              className="relative z-20 max-w-xl lg:col-span-6"
            >
              <h1 className="text-[38px] font-bold leading-[1.1] tracking-tight text-[#131420] sm:text-[44px] lg:text-[48px]">
                <span className="inline-flex flex-wrap items-center gap-x-2.5">
                  <span
                    aria-hidden="true"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-[#D8DCE8] bg-white text-[#131420] shadow-xs sm:h-11 sm:w-11"
                  >
                    <Zap className="h-5 w-5" strokeWidth={2.1} />
                  </span>
                  <span>Supercharge Your</span>
                </span>
                <br />
                <span className="inline-flex flex-wrap items-center gap-x-2.5">
                  <span>Privacy</span>
                  <span
                    aria-hidden="true"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-[#D8DCE8] bg-white text-[#131420] shadow-xs sm:h-11 sm:w-11"
                  >
                    <Lock className="h-5 w-5" strokeWidth={2.1} />
                  </span>
                  <span>for Ultimate</span>
                </span>
                <br />
                <span className="inline-flex flex-wrap items-center gap-x-2.5">
                  <span>Protection</span>
                  <span
                    aria-hidden="true"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-[#D8DCE8] bg-white text-[#131420] shadow-xs sm:h-11 sm:w-11"
                  >
                    <ShieldCheck className="h-5 w-5" strokeWidth={2.1} />
                  </span>
                </span>
              </h1>

              <p className="mt-5 max-w-md text-sm leading-relaxed text-[#5E6478] sm:text-base">
                Detect, validate, and sanitize sensitive PII inside your browser using deterministic Luhn and Verhoeff checksums—with zero server egress.
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={loginAsDemoUser}
                  className="inline-flex items-center gap-3 whitespace-nowrap rounded-full bg-[#5A45F5] py-2 pr-2 pl-6 text-sm font-medium text-white shadow-[0_8px_20px_-6px_rgba(90,69,245,0.45)] transition hover:bg-[#4A35E0] active:scale-[0.98]"
                >
                  <span>Start Sanitizing</span>
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                    <ArrowRight className="h-4 w-4 text-white" aria-hidden="true" />
                  </span>
                </button>
              </div>
            </motion.div>

            {/* Right & Lower-Right 3D Track + Vault Visual Centerpiece */}
            <div className="relative z-10 lg:col-span-6 lg:-mr-6">
              <StudioHeroBackdrop />
            </div>
          </div>
        </section>

        {/* C. 3-Row Bento Feature Grid Overlapping Lower Edge of Hero */}
        <BentoShowcase />
      </main>

      {/* Frosted-White Login Modal (Existing Supabase Auth + Demo User Flow) */}
      <AnimatePresence>
        {showLoginModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16 }}
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowLoginModal(false);
            }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#131420]/40 p-4 backdrop-blur-sm"
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="login-modal-title"
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 6 }}
              transition={{ duration: 0.18 }}
              className="relative w-full max-w-md rounded-3xl border border-[#D8DCE8] bg-white p-7 shadow-[0_24px_64px_-16px_rgba(19,20,32,0.28)] sm:p-8"
            >
              <button
                type="button"
                onClick={() => setShowLoginModal(false)}
                aria-label="Close login modal"
                className="absolute top-5 right-5 flex h-8 w-8 items-center justify-center rounded-full border border-[#D8DCE8] bg-[#EEF0F7] text-[#131420] transition hover:bg-[#F4F5FA]"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>

              <div className="flex items-center gap-3 pr-8">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#D8DCE8] bg-[#EEF0F7] text-[#5A45F5]">
                  <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                </div>
                <div>
                  <h2 id="login-modal-title" className="text-lg font-bold tracking-tight text-[#131420]">
                    Workspace Access
                  </h2>
                  <p className="text-xs text-[#5E6478]">
                    Sign in with Supabase or enter immediately in Demo Mode.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={loginAsDemoUser}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[#5A45F5] px-5 py-3 text-sm font-medium text-white shadow-[0_8px_20px_-6px_rgba(90,69,245,0.45)] transition hover:bg-[#4A35E0] active:scale-[0.99]"
              >
                <UserCheck className="h-4 w-4" aria-hidden="true" />
                Continue as Demo User
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>

              <div className="my-5 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-wider text-[#5E6478]">
                <div className="h-px flex-1 bg-[#D8DCE8]" />
                <span>or Supabase Auth</span>
                <div className="h-px flex-1 bg-[#D8DCE8]" />
              </div>

              <form onSubmit={handleSubmit} className="space-y-3.5">
                <div>
                  <label htmlFor="auth-email" className="block text-xs font-medium text-[#131420]">
                    Email address
                  </label>
                  <input
                    ref={emailInputRef}
                    id="auth-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="engineer@company.com"
                    className="mt-1.5 w-full rounded-xl border border-[#D8DCE8] bg-[#F4F5FA] px-3.5 py-2.5 text-sm text-[#131420] placeholder:text-[#5E6478] focus:border-[#5A45F5] focus:bg-white focus:ring-2 focus:ring-[#5A45F5]/20 focus:outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="auth-password" className="block text-xs font-medium text-[#131420]">
                    Password
                  </label>
                  <input
                    id="auth-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="mt-1.5 w-full rounded-xl border border-[#D8DCE8] bg-[#F4F5FA] px-3.5 py-2.5 text-sm text-[#131420] placeholder:text-[#5E6478] focus:border-[#5A45F5] focus:bg-white focus:ring-2 focus:ring-[#5A45F5]/20 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting || !email.trim() || !password.trim()}
                  className="flex w-full items-center justify-center gap-2 rounded-full border border-[#D8DCE8] bg-white px-5 py-2.5 text-sm font-medium text-[#131420] transition hover:bg-[#F4F5FA] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <KeyRound className="h-4 w-4 text-[#5E6478]" aria-hidden="true" />
                  {submitting ? 'Signing in...' : 'Sign in with Supabase'}
                </button>
              </form>

              <div className="mt-5 flex items-center justify-between border-t border-[#E6E8F0] pt-4 text-[11px] text-[#5E6478]">
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-[#5A45F5]" aria-hidden="true" />
                  Client-Side Privacy Ready
                </span>
                <span>Supabase: {supabaseReady ? 'Configured' : 'Demo Ready'}</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
