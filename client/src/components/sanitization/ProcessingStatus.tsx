import { Cpu, Loader2, ShieldCheck } from 'lucide-react';

interface ProcessingStatusProps {
  isProcessing: boolean;
  progressPercent: number;
  progressStage: string;
  executionPath: 'main-thread' | 'web-worker' | 'worker-fallback';
  workerWarning: string | null;
  characterCount: number;
}

export function ProcessingStatus({
  isProcessing,
  progressPercent,
  progressStage,
  executionPath,
  workerWarning,
  characterCount,
}: ProcessingStatusProps) {
  return (
    <div
      aria-live="polite"
      className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-[#111116] px-4 py-2.5 text-xs"
    >
      <div className="flex items-center gap-2.5">
        {isProcessing ? (
          <Loader2 className="h-4 w-4 animate-spin text-indigo-400" />
        ) : (
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
        )}
        <span className="font-medium text-zinc-200">
          {isProcessing
            ? `Sanitizing locally: ${progressStage} (${progressPercent}%)`
            : characterCount > 0
              ? 'Local browser sanitization complete — zero network egress'
              : 'Local engine idle — awaiting document input'}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {workerWarning && (
          <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-[11px] text-amber-300">
            {workerWarning}
          </span>
        )}
        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-[#09090b] px-2.5 py-0.5 font-mono text-[11px] text-zinc-300">
          <Cpu className="h-3 w-3 text-indigo-400" />
          {executionPath === 'web-worker'
            ? 'Web Worker (>50k chars)'
            : executionPath === 'worker-fallback'
              ? 'Worker Fallback'
              : 'Main Thread'}
        </span>
      </div>

      {isProcessing && (
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-150"
            style={{ width: `${Math.max(5, progressPercent)}%` }}
          />
        </div>
      )}
    </div>
  );
}
