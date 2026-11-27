import { ShieldCheck } from 'lucide-react';
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
          ? 'border-[#D8DCE8] bg-[#EEF0F7] text-[#3B3E59] hover:bg-white dark:border-amber-400/40 dark:bg-amber-500/15 dark:text-amber-200 dark:hover:bg-amber-500/25'
          : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100/70 dark:border-emerald-500/35 dark:bg-emerald-500/15 dark:text-emerald-200 dark:hover:bg-emerald-500/25'
      }`}
    >
      {isDemoMode ? (
        <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-[#5A45F5] dark:text-amber-300" aria-hidden="true" />
      ) : (
        <span className="relative flex h-2 w-2 shrink-0" aria-hidden="true">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#10B981] opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-[#10B981]" />
        </span>
      )}
      <span>{isDemoMode ? 'Demo Mode' : 'Live Mode'}</span>
    </button>
  );
}
