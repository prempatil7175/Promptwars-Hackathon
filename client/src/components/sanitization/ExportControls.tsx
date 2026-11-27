import { useState } from 'react';
import {
  Check,
  Copy,
  Download,
  FileJson,
  FileSpreadsheet,
  FileText,
  Loader2,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useDemoMode } from '../../context/DemoModeContext';
import { useToast } from '../../context/ToastContext';
import { buildLocalComplianceAuditFallback } from '../../data/mockData';
import { verifyZeroResidualPii } from '../../engine/pipeline';
import {
  CATEGORY_LABELS,
  type DetectionConfig,
  type SanitizationResult,
} from '../../engine/types';
import { requestComplianceAudit } from '../../lib/api';
import {
  copyToClipboardSafely,
  downloadAuditReportJson,
  downloadSanitizedText,
} from '../../lib/exportHelpers';
import type { ComplianceAuditResponse } from '../../types';
import { Skeleton } from '../ui/Skeleton';

interface ExportControlsProps {
  result: SanitizationResult | null;
  fileType: 'text' | 'txt' | 'csv';
  fileName: string | null;
  config: DetectionConfig;
}

export function ExportControls({
  result,
  fileType,
  fileName,
  config,
}: ExportControlsProps) {
  const { isDemoMode, runWithFallback } = useDemoMode();
  const { addToast } = useToast();

  const [copied, setCopied] = useState(false);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditBlockReason, setAuditBlockReason] = useState<string | null>(null);
  const [auditResult, setAuditResult] = useState<ComplianceAuditResponse | null>(null);

  const hasOutput = Boolean(result && result.sanitizedText.length > 0);
  const baseName = fileName || 'pii-guard-output';

  const handleCopy = async () => {
    if (!result) return;
    try {
      await copyToClipboardSafely(result.sanitizedText);
      setCopied(true);
      addToast({
        title: 'Sanitized output copied',
        description: 'Copied safe sanitized text to clipboard.',
        variant: 'success',
      });
      window.setTimeout(() => setCopied(false), 1800);
    } catch (err) {
      addToast({
        title: 'Clipboard copy unavailable',
        description:
          err instanceof Error ? err.message : 'Please use Download .txt / .csv instead.',
        variant: 'warning',
      });
    }
  };

  const handleDownloadSanitized = (forcedExt?: 'txt' | 'csv') => {
    if (!result) return;
    try {
      const effectiveResult =
        forcedExt === 'csv'
          ? { ...result, isCsv: true }
          : forcedExt === 'txt'
            ? { ...result, isCsv: false }
            : result;
      const savedName = downloadSanitizedText(effectiveResult, baseName);
      addToast({
        title: 'Sanitized file exported',
        description: `Downloaded ${savedName} locally.`,
        variant: 'success',
      });
    } catch (err) {
      addToast({
        title: 'Export failed',
        description: err instanceof Error ? err.message : 'Unable to trigger download.',
        variant: 'warning',
      });
    }
  };

  const handleDownloadAudit = () => {
    if (!result) return;
    try {
      const savedName = downloadAuditReportJson(result, fileType, config, baseName);
      addToast({
        title: 'Metadata-only audit exported',
        description: `Downloaded ${savedName} (zero PII values or mappings included).`,
        variant: 'success',
      });
    } catch (err) {
      addToast({
        title: 'Audit export failed',
        description: err instanceof Error ? err.message : 'Unable to export JSON audit.',
        variant: 'warning',
      });
    }
  };

  const handleRunComplianceAudit = async () => {
    if (!result || !result.sanitizedText.trim() || auditLoading) return;
    setAuditBlockReason(null);
    setAuditResult(null);

    const check = verifyZeroResidualPii(result.sanitizedText, config);
    if (!check.safe) {
      const categoryNames = check.residualCategories
        .map((c) => CATEGORY_LABELS[c])
        .join(', ');
      const reason = `Privacy Gate Blocked Request: Local PII re-scan detected ${check.residualCount} residual pattern(s) (${categoryNames}) in the sanitized output. Switch to Full Mask or enable all categories before sending to external AI.`;
      setAuditBlockReason(reason);
      addToast({
        title: 'AI Request Blocked by Privacy Gate',
        description: 'Residual PII patterns detected — nothing left your browser.',
        variant: 'warning',
      });
      return;
    }

    setAuditLoading(true);
    const statsPayload = {
      totalDetected: result.stats.totalDetected,
      rejectedFalsePositives: result.stats.rejectedFalsePositives,
      characterCount: result.stats.characterCount,
    };

    const response = await runWithFallback(
      (signal) =>
        requestComplianceAudit(
          {
            sanitizedText: result.sanitizedText.slice(0, 40000),
            mode: result.mode,
            stats: statsPayload,
            demoMode: isDemoMode,
          },
          signal
        ),
      () => buildLocalComplianceAuditFallback(result.mode, statsPayload),
      'Sanitized Compliance Audit'
    );

    setAuditResult(response.data);
    setAuditLoading(false);
  };

  return (
    <section
      aria-labelledby="export-controls-heading"
      className="space-y-4 rounded-2xl border border-[#AFB4CE] bg-white p-5 shadow-[0_8px_24px_-10px_rgba(18,20,31,0.10)] dark:border-[#383E5C] dark:bg-[#1B1F30] dark:shadow-[0_12px_32px_-12px_rgba(0,0,0,0.55)]"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 id="export-controls-heading" className="text-sm font-bold tracking-[-0.01em] text-[#12141F] dark:text-white">
            Safe Export &amp; Optional Privacy-Gated AI Review
          </h3>
          <p className="text-xs text-[#4F5580] dark:text-[#AFB4CE]">
            Downloads execute locally. JSON audit exports aggregate metadata only.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => void handleCopy()}
            disabled={!hasOutput}
            className="inline-flex items-center gap-1.5 rounded-full border border-[#AFB4CE] bg-white px-3.5 py-1.5 text-xs font-medium text-[#12141F] transition hover:border-[#4F5580] hover:bg-[#E4E6F0]/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4F5580] disabled:cursor-not-allowed disabled:opacity-40 dark:border-[#383E5C] dark:bg-[#232739] dark:text-[#E4E6F0] dark:hover:border-[#5B6396] dark:hover:bg-[#383E5C]"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-400" />
            ) : (
              <Copy className="h-3.5 w-3.5 text-[#4F5580] dark:text-[#AFB4CE]" />
            )}
            {copied ? 'Copied' : 'Copy Sanitized'}
          </button>

          <button
            type="button"
            onClick={() => handleDownloadSanitized('txt')}
            disabled={!hasOutput}
            className="inline-flex items-center gap-1.5 rounded-full border border-[#AFB4CE] bg-white px-3.5 py-1.5 text-xs font-medium text-[#12141F] transition hover:border-[#4F5580] hover:bg-[#E4E6F0]/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4F5580] disabled:cursor-not-allowed disabled:opacity-40 dark:border-[#383E5C] dark:bg-[#232739] dark:text-[#E4E6F0] dark:hover:border-[#5B6396] dark:hover:bg-[#383E5C]"
          >
            <FileText className="h-3.5 w-3.5 text-[#4F5580] dark:text-[#AFB4CE]" />
            Download .txt
          </button>

          <button
            type="button"
            onClick={() => handleDownloadSanitized('csv')}
            disabled={!hasOutput}
            className="inline-flex items-center gap-1.5 rounded-full border border-[#AFB4CE] bg-white px-3.5 py-1.5 text-xs font-medium text-[#12141F] transition hover:border-[#4F5580] hover:bg-[#E4E6F0]/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4F5580] disabled:cursor-not-allowed disabled:opacity-40 dark:border-[#383E5C] dark:bg-[#232739] dark:text-[#E4E6F0] dark:hover:border-[#5B6396] dark:hover:bg-[#383E5C]"
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-[#4F5580] dark:text-[#AFB4CE]" />
            Download .csv
          </button>

          <button
            type="button"
            onClick={handleDownloadAudit}
            disabled={!hasOutput}
            className="inline-flex items-center gap-1.5 rounded-full border border-[#AFB4CE] bg-[#E4E6F0] px-3.5 py-1.5 text-xs font-semibold text-[#12141F] transition hover:border-[#4F5580] hover:bg-[#AFB4CE]/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4F5580] disabled:cursor-not-allowed disabled:opacity-40 dark:border-[#383E5C] dark:bg-[#12141F] dark:text-[#E4E6F0] dark:hover:border-[#5B6396] dark:hover:bg-[#232739]"
          >
            <FileJson className="h-3.5 w-3.5 text-[#4F5580] dark:text-[#AFB4CE]" />
            <Download className="h-3 w-3" />
            Audit JSON
          </button>

          <button
            type="button"
            onClick={() => void handleRunComplianceAudit()}
            disabled={!hasOutput || auditLoading}
            className="inline-flex items-center gap-1.5 rounded-full bg-[#4F5580] px-4 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#383E5C] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4F5580] disabled:cursor-not-allowed disabled:opacity-40 dark:bg-[#5B6396] dark:hover:bg-[#4F5580]"
          >
            {auditLoading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Sparkles className="h-3.5 w-3.5 text-[#E4E6F0]" />
            )}
            AI Advisory Audit
          </button>
        </div>
      </div>

      {auditBlockReason && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-xl border border-rose-300 bg-rose-50 p-3.5 text-xs text-rose-900 dark:border-rose-500/40 dark:bg-rose-950/50 dark:text-rose-200"
        >
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-rose-700 dark:text-rose-400" />
          <div>
            <p className="font-semibold text-rose-950 dark:text-rose-100">External AI Request Blocked</p>
            <p className="mt-0.5 leading-relaxed">{auditBlockReason}</p>
          </div>
        </div>
      )}

      {auditLoading && (
        <div className="space-y-2.5 rounded-xl border border-[#AFB4CE] bg-[#E4E6F0]/35 p-4 dark:border-[#383E5C] dark:bg-[#12141F]/70">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-5/6" />
        </div>
      )}

      {auditResult && !auditLoading && (
        <div className="space-y-3 rounded-xl border border-[#AFB4CE] bg-[#E4E6F0]/35 p-4 text-xs dark:border-[#383E5C] dark:bg-[#12141F]/70">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#AFB4CE] pb-2.5 dark:border-[#383E5C]">
            <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-800 dark:text-emerald-300">
              <ShieldCheck className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
              Sanitized Advisory Review ({auditResult.source === 'live' ? auditResult.model : 'Local Fallback'})
            </span>
            <span className="rounded-full border border-[#AFB4CE] bg-white px-2.5 py-0.5 font-mono text-[11px] capitalize text-[#12141F] dark:border-[#383E5C] dark:bg-[#232739] dark:text-[#E4E6F0]">
              Residual risk: {auditResult.residualRiskLevel} • {auditResult.latencyMs}ms
            </span>
          </div>

          <p className="leading-relaxed text-[#12141F] dark:text-[#E4E6F0]">{auditResult.advisorySummary}</p>

          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <p className="font-semibold text-[#12141F] dark:text-white">Observations</p>
              <ul className="mt-1.5 list-disc space-y-1 pl-4 text-[#4F5580] dark:text-[#AFB4CE]">
                {auditResult.observations.map((obs, i) => (
                  <li key={i}>{obs}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-semibold text-[#12141F] dark:text-white">Recommended Controls</p>
              <ul className="mt-1.5 list-disc space-y-1 pl-4 text-[#4F5580] dark:text-[#AFB4CE]">
                {auditResult.recommendedControls.map((ctrl, i) => (
                  <li key={i}>{ctrl}</li>
                ))}
              </ul>
            </div>
          </div>

          <p className="border-t border-[#AFB4CE] pt-2 text-[11px] text-[#4F5580] dark:border-[#383E5C] dark:text-[#AFB4CE]">
            {auditResult.disclaimer}
          </p>
        </div>
      )}
    </section>
  );
}
