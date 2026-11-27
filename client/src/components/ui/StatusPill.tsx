import { Radio, ShieldCheck } from 'lucide-react';
import { useDemoMode } from '../../context/DemoModeContext';

export function StatusPill() {
  const { isDemoMode, toggleDemoMode } = useDemoMode();

  return (
    <button
      type="button"
      onClick={toggleDemoMode}
      title="Toggle Live AI vs Cached Demo Mode (Ctrl+Shift+D)"
      aria-pressed={isDemoMode}
      className={`group inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
        isDemoMode
          ? 'border-amber-500/35 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20'
          : 'border-emerald-500/35 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20'
      }`}
    >
      {isDemoMode ? (
        <ShieldCheck className="h-3.5 w-3.5 text-amber-400" />
      ) : (
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <Radio className="relative inline-flex h-2 w-2 text-emerald-400" />
        </span>
      )}
      <span>{isDemoMode ? 'Demo Mode' : 'Live Mode'}</span>
      <kbd className="hidden rounded border border-white/10 bg-black/40 px-1.5 py-0.5 font-mono text-[10px] text-zinc-400 sm:inline-block">
        Ctrl+Shift+D
      </kbd>
    </button>
  );
}
