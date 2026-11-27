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
      className="rounded-2xl border border-white/10 bg-[#111116] p-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 id="detection-summary-heading" className="text-sm font-semibold text-zinc-100">
            Real-Time Detection Telemetry
          </h3>
          <p className="text-xs text-zinc-400">
            Measured locally via <code className="text-zinc-300">performance.now()</code> and deterministic validators
          </p>
        </div>

        {stats && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 font-mono text-[11px] text-zinc-300">
            <Clock className="h-3 w-3 text-indigo-400" />
            {stats.processingDurationMs.toFixed(2)} ms
          </span>
        )}
      </div>

      {/* Top 4 metric tiles */}
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-white/10 bg-[#09090b] p-3.5">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Detected Entities</span>
            <ShieldAlert className="h-3.5 w-3.5 text-rose-400" />
          </div>
          <p className="mt-2 font-mono text-xl font-bold text-zinc-100">
            {stats?.totalDetected ?? 0}
          </p>
          <p className="mt-0.5 text-[11px] text-zinc-500">Validated PII spans</p>
        </div>

        <div className="rounded-xl border border-white/10 bg-[#09090b] p-3.5">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Sanitized Entities</span>
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
          </div>
          <p className="mt-2 font-mono text-xl font-bold text-emerald-400">
            {stats?.totalSanitized ?? 0}
          </p>
          <p className="mt-0.5 text-[11px] text-zinc-500">
            Mode: {result?.mode ?? 'full'}
          </p>
        </div>

        <div className="rounded-xl border border-white/10 bg-[#09090b] p-3.5">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>False Positives Rejected</span>
            <ShieldOff className="h-3.5 w-3.5 text-amber-400" />
          </div>
          <p className="mt-2 font-mono text-xl font-bold text-amber-300">
            {stats?.rejectedFalsePositives ?? 0}
          </p>
          <p className="mt-0.5 text-[11px] text-zinc-500">
            Invalid cards, IPs, dates, IDs
          </p>
        </div>

        <div className="rounded-xl border border-white/10 bg-[#09090b] p-3.5">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Payload Size</span>
            <Activity className="h-3.5 w-3.5 text-indigo-400" />
          </div>
          <p className="mt-2 font-mono text-xl font-bold text-zinc-100">
            {formatBytes(stats?.byteCount ?? 0)}
          </p>
          <p className="mt-0.5 text-[11px] text-zinc-500">
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
              className="flex items-center justify-between rounded-xl border border-white/5 bg-[#09090b]/80 px-3 py-2 text-xs"
            >
              <span className="truncate text-zinc-300">{CATEGORY_LABELS[category]}</span>
              <div className="flex items-center gap-1.5 font-mono">
                <span
                  className={`rounded px-1.5 py-0.5 text-[11px] font-semibold ${
                    count > 0
                      ? 'bg-emerald-500/15 text-emerald-300'
                      : 'bg-white/[0.04] text-zinc-500'
                  }`}
                >
                  {count}
                </span>
                {rejected > 0 && (
                  <span
                    title={`${rejected} invalid candidate(s) rejected`}
                    className="rounded bg-amber-500/15 px-1.5 py-0.5 text-[10px] text-amber-300"
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
        <div className="mt-4 rounded-xl border border-white/10 bg-[#09090b] p-3 text-xs text-zinc-300">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span>
              CSV Structure Preserved: <strong className="text-zinc-100">{result.csvMeta.rowCount}</strong> data rows ×{' '}
              <strong className="text-zinc-100">{result.csvMeta.columnCount}</strong> columns ({result.csvMeta.sanitizedCellCount} cells modified)
            </span>
            {result.csvMeta.warnings.length > 0 && (
              <span className="text-amber-300">
                {result.csvMeta.warnings.length} CSV recovery warning(s)
              </span>
            )}
          </div>
          {result.csvMeta.warnings.length > 0 && (
            <ul className="mt-2 list-disc space-y-0.5 pl-4 text-[11px] text-amber-300/90">
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
