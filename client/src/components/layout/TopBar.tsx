import { FileLock2, Lock, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import type { NavTab } from '../../types';
import { StatusPill } from '../ui/StatusPill';

interface TopBarProps {
  activeTab: NavTab;
  onQuickWorkspace: () => void;
}

const TAB_TITLES: Record<NavTab, { title: string; subtitle: string }> = {
  dashboard: {
    title: 'Privacy Command Dashboard',
    subtitle: 'Session sanitization telemetry, category visibility, and local privacy boundary',
  },
  workspace: {
    title: 'Sanitization Workspace',
    subtitle: 'Client-only PII detection, validation, masking, comparison, and safe export',
  },
  analytics: {
    title: 'Detection Analytics',
    subtitle: 'Validated PII counts, false-positive rejections, and engine duration metrics',
  },
  verification: {
    title: 'Verification Suite',
    subtitle: 'Live in-browser execution of shared validator, pipeline, CSV, and privacy tests',
  },
  settings: {
    title: 'Environment & Privacy Controls',
    subtitle: 'Service readiness, Demo Mode toggle, and architectural threat model',
  },
};

export function TopBar({ activeTab, onQuickWorkspace }: TopBarProps) {
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
        <span className="hidden items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-300 xl:inline-flex">
          <Lock className="h-3 w-3" />
          Zero Server Egress
        </span>

        {activeTab !== 'workspace' && (
          <button
            type="button"
            onClick={onQuickWorkspace}
            className="hidden items-center gap-1.5 rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-3 py-1.5 text-xs font-medium text-indigo-300 transition hover:bg-indigo-500/20 md:inline-flex"
          >
            <FileLock2 className="h-3.5 w-3.5" />
            Sanitize Document
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
