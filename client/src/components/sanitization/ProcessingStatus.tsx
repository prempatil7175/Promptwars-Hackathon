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
      className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#D8DCE8] bg-white px-4 py-2.5 text-xs shadow-[0_6px_20px_-8px_rgba(19,20,32,0.08)] dark:border-[#2E314A] dark:bg-[#1B1D2E] dark:shadow-[0_10px_28px_-10px_rgba(0,0,0,0.45)]"
    >
      <div className="flex items-center gap-2.5">
        {isProcessing ? (
          <Loader2 className="h-4 w-4 animate-spin text-[#5A45F5] dark:text-[#A5B4FC]" />
        ) : (
          <ShieldCheck className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
        )}
        <span className="font-medium text-[#131420] dark:text-[#E6E8F0]">
          {isProcessing
            ? `Sanitizing locally: ${progressStage} (${progressPercent}%)`
            : characterCount > 0
              ? 'Local browser sanitization complete — zero network egress'
              : 'Local engine idle — awaiting document input'}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {workerWarning && (
          <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[11px] font-medium text-amber-800 dark:border-amber-500/35 dark:bg-amber-500/15 dark:text-amber-200">
            {workerWarning}
          </span>
        )}
        <span className="inline-flex items-center gap-1.5 rounded-full border border-[#D8DCE8] bg-[#EEF0F7] px-2.5 py-0.5 font-mono text-[11px] font-medium text-[#3B3E59] dark:border-[#2E314A] dark:bg-[#23263B] dark:text-[#E6E8F0]">
          <Cpu className="h-3 w-3 text-[#5A45F5] dark:text-[#A5B4FC]" />
          {executionPath === 'web-worker'
            ? 'Web Worker (>50k chars)'
            : executionPath === 'worker-fallback'
              ? 'Worker Fallback'
              : 'Main Thread'}
        </span>
      </div>

      {isProcessing && (
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#EEF0F7] dark:bg-[#131420]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#5A45F5] to-[#4A35E0] transition-all duration-150"
            style={{ width: `${Math.max(5, progressPercent)}%` }}
          />
        </div>
      )}
    </div>
  );
}
