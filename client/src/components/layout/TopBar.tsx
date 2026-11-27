import { LogOut, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import type { NavTab } from '../../types';
import { StatusPill } from '../ui/StatusPill';

interface TopBarProps {
  activeTab: NavTab;
  onQuickPlayground: () => void;
}

const TAB_TITLES: Record<NavTab, { title: string; subtitle: string }> = {
  dashboard: {
    title: 'Command Dashboard',
    subtitle: 'Live telemetry, Recharts insights, and instant Gemini workflows',
  },
  playground: {
    title: 'AI Playground',
    subtitle: 'Structured JSON generation via Gemini 4 Hydrogen with 8s fallback shield',
  },
  analytics: {
    title: 'System Analytics',
    subtitle: 'Throughput, latency, and schema pass-rate breakdown',
  },
  settings: {
    title: 'Environment & Demo Controls',
    subtitle: 'Verify backend services, Supabase readiness, and Demo Mode state',
  },
};

export function TopBar({ activeTab, onQuickPlayground }: TopBarProps) {
  const { user, signOut } = useAuth();
  const meta = TAB_TITLES[activeTab];

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-white/10 bg-[#09090b]/85 px-6 backdrop-blur-md">
      <div className="min-w-0">
        <h1 className="truncate text-base font-semibold tracking-tight text-zinc-100">
          {meta.title}
        </h1>
        <p className="hidden truncate text-xs text-zinc-400 sm:block">
          {meta.subtitle}
        </p>
      </div>

      <div className="flex items-center gap-3">
        {activeTab !== 'playground' && (
          <button
            type="button"
            onClick={onQuickPlayground}
            className="hidden items-center gap-1.5 rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-3 py-1.5 text-xs font-medium text-indigo-300 transition hover:bg-indigo-500/20 md:inline-flex"
          >
            <Sparkles className="h-3.5 w-3.5" />
            New AI Run
          </button>
        )}

        <StatusPill />

        {user && (
          <div className="flex items-center gap-2.5 border-l border-white/10 pl-3">
            <div className="hidden text-right lg:block">
              <p className="text-xs font-medium text-zinc-200">{user.name}</p>
              <p className="text-[11px] text-zinc-400">
                {user.isDemoUser ? 'Demo Session' : user.role}
              </p>
            </div>
            <div
              className="flex h-8 w-8 items-center justify-center rounded-full border border-indigo-400/30 bg-indigo-500/20 text-xs font-semibold text-indigo-200"
              title={`${user.name} (${user.email})`}
            >
              {user.avatarInitials}
            </div>
            <button
              type="button"
              onClick={() => void signOut()}
              title="Sign out"
              aria-label="Sign out"
              className="rounded-lg border border-white/10 bg-white/[0.03] p-1.5 text-zinc-400 transition hover:bg-white/10 hover:text-zinc-100"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
