import { Radio, ShieldCheck } from 'lucide-react';
import { useDemoMode } from '../../context/DemoModeContext';

export function StatusPill() {
  const { isDemoMode, toggleDemoMode } = useDemoMode();

  return (
    <button
      type="button"
      onClick={toggleDemoMode}
      title="Toggle Live AI vs Cached Demo Mode (Ctrl+Shift+D)"
      aria-label={
        isDemoMode
          ? 'Demo Mode active. Click or press Ctrl+Shift+D to switch to Live Mode'
          : 'Live Mode active. Click or press Ctrl+Shift+D to switch to Demo Mode'
      }
      aria-pressed={isDemoMode}
      className={`inline-flex h-8 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 text-[11px] font-medium transition-all active:scale-[0.98] sm:gap-2 sm:px-3 sm:text-xs ${
        isDemoMode
          ? 'border-[#383E5C] bg-[#232739] text-[#E4E6F0] hover:bg-[#12141F] dark:border-amber-400/50 dark:bg-amber-500/15 dark:text-amber-200 dark:hover:bg-amber-500/25'
          : 'border-[#AFB4CE] bg-white text-[#12141F] hover:border-[#4F5580] hover:bg-[#E4E6F0]/60 dark:border-[#383E5C] dark:bg-[#232739] dark:text-[#E4E6F0] dark:hover:border-[#8B93C9] dark:hover:bg-[#2E334B]'
      }`}
    >
      {isDemoMode ? (
        <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-[#AFB4CE] dark:text-amber-300" aria-hidden="true" />
      ) : (
        <span className="relative flex h-2 w-2 shrink-0" aria-hidden="true">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
          <Radio className="relative inline-flex h-2 w-2 text-emerald-600 dark:text-emerald-400" />
        </span>
      )}
      <span>{isDemoMode ? 'Demo Mode' : 'Live Mode'}</span>
    </button>
  );
}
