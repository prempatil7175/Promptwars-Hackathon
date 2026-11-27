import { LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import type { NavTab } from '../../types';
import { StatusPill } from '../ui/StatusPill';
import { ThemeToggle } from '../ui/ThemeToggle';

interface TopBarProps {
  activeTab: NavTab;
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

export function TopBar({ activeTab }: TopBarProps) {
  const { user, signOut } = useAuth();
  const meta = TAB_TITLES[activeTab];

  return (
    <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between gap-3 border-b border-[#AFB4CE] bg-[#E4E6F0]/95 px-3 backdrop-blur-md transition-colors duration-200 dark:border-[#383E5C] dark:bg-[#12141F]/95 sm:gap-4 sm:px-6">
      <div className="min-w-0 flex-1">
        <h1
          title={meta.title}
          className="truncate text-sm font-bold leading-snug tracking-[-0.01em] text-[#12141F] dark:text-white sm:text-base"
        >
          {meta.title}
        </h1>
        <p
          title={meta.subtitle}
          className="hidden truncate text-xs leading-normal text-[#4F5580] dark:text-[#AFB4CE] sm:block"
        >
          {meta.subtitle}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-1.5 sm:gap-2.5">
        <ThemeToggle />

        <StatusPill />

        {user && (
          <div className="flex shrink-0 items-center gap-2 border-l border-[#AFB4CE] pl-2 dark:border-[#383E5C] sm:gap-2.5 sm:pl-3">
            <div className="hidden max-w-[140px] flex-col items-end justify-center text-right xl:flex">
              <p
                title={user.name}
                className="w-full truncate whitespace-nowrap text-xs font-semibold leading-tight text-[#12141F] dark:text-white"
              >
                {user.name}
              </p>
              <p className="w-full truncate whitespace-nowrap text-[11px] leading-tight text-[#4F5580] dark:text-[#AFB4CE]">
                {user.isDemoUser ? 'Demo Session' : user.role}
              </p>
            </div>
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center whitespace-nowrap rounded-full border border-[#383E5C]/30 bg-[#4F5580] text-xs font-semibold text-white dark:border-[#7B81A8]/50 dark:bg-[#5B6396]"
              title={`${user.name} (${user.email})`}
            >
              {user.avatarInitials}
            </div>
            <button
              type="button"
              onClick={() => void signOut()}
              title="Sign out"
              aria-label="Sign out"
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center whitespace-nowrap rounded-full border border-[#AFB4CE] bg-white text-[#12141F] transition hover:border-[#4F5580] hover:bg-[#E4E6F0] active:scale-[0.97] dark:border-[#383E5C] dark:bg-[#232739] dark:text-[#E4E6F0] dark:hover:border-[#8B93C9] dark:hover:bg-[#383E5C]"
            >
              <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
