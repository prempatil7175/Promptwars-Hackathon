import { Activity, Clock, ShieldAlert, ShieldCheck, ShieldOff } from 'lucide-react';
import {
  ALL_PII_CATEGORIES,
  CATEGORY_LABELS,
  type SanitizationResult,
} from '../../engine/types';
import { formatBytes } from '../../lib/exportHelpers';

interface DetectionSummaryProps {
  result: SanitizationResult | null;
}

export function DetectionSummary({ result }: DetectionSummaryProps) {
  const stats = result?.stats;

  return (
    <section
      aria-labelledby="detection-summary-heading"
      className="rounded-2xl border border-[#AFB4CE] bg-white p-5 shadow-[0_8px_24px_-10px_rgba(18,20,31,0.10)] dark:border-[#383E5C] dark:bg-[#1B1F30] dark:shadow-[0_12px_32px_-12px_rgba(0,0,0,0.55)]"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 id="detection-summary-heading" className="text-sm font-bold tracking-[-0.01em] text-[#12141F] dark:text-white">
            Real-Time Detection Telemetry
          </h3>
          <p className="text-xs text-[#4F5580] dark:text-[#AFB4CE]">
            Measured locally via <code className="rounded bg-[#E4E6F0] px-1 py-0.5 text-[#12141F] dark:bg-[#232739] dark:text-[#E4E6F0]">performance.now()</code> and deterministic validators
          </p>
        </div>

        {stats && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#AFB4CE] bg-[#E4E6F0] px-3 py-1 font-mono text-[11px] font-semibold text-[#12141F] dark:border-[#383E5C] dark:bg-[#232739] dark:text-[#E4E6F0]">
            <Clock className="h-3 w-3 text-[#4F5580] dark:text-[#AFB4CE]" />
            {stats.processingDurationMs.toFixed(2)} ms
          </span>
        )}
      </div>

      {/* Top 4 metric tiles */}
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-[#AFB4CE] bg-[#E4E6F0]/35 p-3.5 dark:border-[#383E5C] dark:bg-[#12141F]/70">
          <div className="flex items-center justify-between text-xs font-medium text-[#4F5580] dark:text-[#AFB4CE]">
            <span>Detected Entities</span>
            <ShieldAlert className="h-3.5 w-3.5 text-rose-700 dark:text-rose-400" />
          </div>
          <p className="mt-2 font-mono text-xl font-bold text-[#12141F] dark:text-white">
            {stats?.totalDetected ?? 0}
          </p>
          <p className="mt-0.5 text-[11px] text-[#4F5580] dark:text-[#AFB4CE]">Validated PII spans</p>
        </div>

        <div className="rounded-2xl border border-[#AFB4CE] bg-[#E4E6F0]/35 p-3.5 dark:border-[#383E5C] dark:bg-[#12141F]/70">
          <div className="flex items-center justify-between text-xs font-medium text-[#4F5580] dark:text-[#AFB4CE]">
            <span>Sanitized Entities</span>
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-400" />
          </div>
          <p className="mt-2 font-mono text-xl font-bold text-[#4F5580] dark:text-[#AFB4CE]">
            {stats?.totalSanitized ?? 0}
          </p>
          <p className="mt-0.5 text-[11px] text-[#4F5580] dark:text-[#AFB4CE]">
            Mode: {result?.mode ?? 'full'}
          </p>
        </div>

        <div className="rounded-2xl border border-[#AFB4CE] bg-[#E4E6F0]/35 p-3.5 dark:border-[#383E5C] dark:bg-[#12141F]/70">
          <div className="flex items-center justify-between text-xs font-medium text-[#4F5580] dark:text-[#AFB4CE]">
            <span>False Positives Rejected</span>
            <ShieldOff className="h-3.5 w-3.5 text-amber-700 dark:text-amber-400" />
          </div>
          <p className="mt-2 font-mono text-xl font-bold text-[#12141F] dark:text-white">
            {stats?.rejectedFalsePositives ?? 0}
          </p>
          <p className="mt-0.5 text-[11px] text-[#4F5580] dark:text-[#AFB4CE]">
            Invalid cards, IPs, dates, IDs
          </p>
        </div>

        <div className="rounded-2xl border border-[#AFB4CE] bg-[#E4E6F0]/35 p-3.5 dark:border-[#383E5C] dark:bg-[#12141F]/70">
          <div className="flex items-center justify-between text-xs font-medium text-[#4F5580] dark:text-[#AFB4CE]">
            <span>Payload Size</span>
            <Activity className="h-3.5 w-3.5 text-[#4F5580] dark:text-[#AFB4CE]" />
          </div>
          <p className="mt-2 font-mono text-xl font-bold text-[#12141F] dark:text-white">
            {formatBytes(stats?.byteCount ?? 0)}
          </p>
          <p className="mt-0.5 text-[11px] text-[#4F5580] dark:text-[#AFB4CE]">
            {(stats?.characterCount ?? 0).toLocaleString()} chars
          </p>
        </div>
      </div>

      {/* Category breakdown */}
      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {ALL_PII_CATEGORIES.map((category) => {
          const count = stats?.categoryCounts[category] ?? 0;
          const rejected = stats?.rejectedByCategory[category] ?? 0;
          return (
            <div
              key={category}
              className="flex items-center justify-between rounded-xl border border-[#AFB4CE] bg-[#E4E6F0]/30 px-3 py-2 text-xs dark:border-[#383E5C] dark:bg-[#12141F]/65"
            >
              <span className="truncate font-medium text-[#12141F] dark:text-[#E4E6F0]">{CATEGORY_LABELS[category]}</span>
              <div className="flex items-center gap-1.5 font-mono">
                <span
                  className={`rounded-md px-1.5 py-0.5 text-[11px] font-semibold ${
                    count > 0
                      ? 'border border-[#4F5580] bg-[#4F5580] text-white dark:border-[#5B6396] dark:bg-[#5B6396]'
                      : 'border border-[#AFB4CE] bg-white text-[#4F5580] dark:border-[#383E5C] dark:bg-[#232739] dark:text-[#AFB4CE]'
                  }`}
                >
                  {count}
                </span>
                {rejected > 0 && (
                  <span
                    title={`${rejected} invalid candidate(s) rejected`}
                    className="rounded-md border border-amber-300 bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-800 dark:border-amber-500/35 dark:bg-amber-500/15 dark:text-amber-200"
                  >
                    -{rejected} FP
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* CSV metadata warnings if present */}
      {result?.csvMeta && (
        <div className="mt-4 rounded-xl border border-[#AFB4CE] bg-[#E4E6F0]/35 p-3 text-xs text-[#12141F] dark:border-[#383E5C] dark:bg-[#12141F]/70 dark:text-[#E4E6F0]">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span>
              CSV Structure Preserved: <strong>{result.csvMeta.rowCount}</strong> data rows ×{' '}
              <strong>{result.csvMeta.columnCount}</strong> columns ({result.csvMeta.sanitizedCellCount} cells modified)
            </span>
            {result.csvMeta.warnings.length > 0 && (
              <span className="font-medium text-amber-800 dark:text-amber-300">
                {result.csvMeta.warnings.length} CSV recovery warning(s)
              </span>
            )}
          </div>
          {result.csvMeta.warnings.length > 0 && (
            <ul className="mt-2 list-disc space-y-0.5 pl-4 text-[11px] text-amber-900 dark:text-amber-200">
              {result.csvMeta.warnings.slice(0, 4).map((w, idx) => (
                <li key={idx}>{w}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}
