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
      className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#AFB4CE] bg-white px-4 py-2.5 text-xs shadow-[0_8px_24px_-10px_rgba(18,20,31,0.10)] dark:border-[#383E5C] dark:bg-[#1B1F30] dark:shadow-[0_12px_32px_-12px_rgba(0,0,0,0.55)]"
    >
      <div className="flex items-center gap-2.5">
        {isProcessing ? (
          <Loader2 className="h-4 w-4 animate-spin text-[#4F5580] dark:text-[#AFB4CE]" />
        ) : (
          <ShieldCheck className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
        )}
        <span className="font-medium text-[#12141F] dark:text-[#E4E6F0]">
          {isProcessing
            ? `Sanitizing locally: ${progressStage} (${progressPercent}%)`
            : characterCount > 0
              ? 'Local browser sanitization complete — zero network egress'
              : 'Local engine idle — awaiting document input'}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {workerWarning && (
          <span className="rounded-full border border-amber-300 bg-amber-50 px-2.5 py-0.5 text-[11px] font-medium text-amber-800 dark:border-amber-500/35 dark:bg-amber-500/15 dark:text-amber-200">
            {workerWarning}
          </span>
        )}
        <span className="inline-flex items-center gap-1.5 rounded-full border border-[#AFB4CE] bg-[#E4E6F0] px-2.5 py-0.5 font-mono text-[11px] font-medium text-[#12141F] dark:border-[#383E5C] dark:bg-[#232739] dark:text-[#E4E6F0]">
          <Cpu className="h-3 w-3 text-[#4F5580] dark:text-[#AFB4CE]" />
          {executionPath === 'web-worker'
            ? 'Web Worker (>50k chars)'
            : executionPath === 'worker-fallback'
              ? 'Worker Fallback'
              : 'Main Thread'}
        </span>
      </div>

      {isProcessing && (
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#E4E6F0] dark:bg-[#12141F]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#4F5580] to-[#12141F] transition-all duration-150 dark:from-[#5B6396] dark:to-[#8B93C9]"
            style={{ width: `${Math.max(5, progressPercent)}%` }}
          />
        </div>
      )}
    </div>
  );
}
