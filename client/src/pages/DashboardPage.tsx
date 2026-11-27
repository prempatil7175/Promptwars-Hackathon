import {
  ArrowRight,
  CheckCircle2,
  FileSearch,
  Lock,
  ShieldAlert,
  ShieldCheck,
  ShieldOff,
  Sliders,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { usePrivacySession } from '../context/PrivacySessionContext';
import { DEMO_FIXTURE_ACTIVITY } from '../data/mockData';
import { ALL_PII_CATEGORIES, CATEGORY_LABELS, type SanitizationMode } from '../engine/types';

interface DashboardPageProps {
  onOpenWorkspace: () => void;
  onOpenVerification: () => void;
}

const MODE_LABELS: Record<SanitizationMode, string> = {
  full: 'Full Mask',
  partial: 'Partial Mask',
  pseudonymize: 'Consistent Pseudonym',
};

export function DashboardPage({
  onOpenWorkspace,
  onOpenVerification,
}: DashboardPageProps) {
  const {
    mode,
    documentsProcessed,
    totalDetected,
    totalSanitized,
    totalRejected,
    categoryTotals,
    recentActivity,
  } = usePrivacySession();

  const hasSessionActivity = documentsProcessed > 0;

  const chartData = ALL_PII_CATEGORIES.map((category) => ({
    category: CATEGORY_LABELS[category],
    count: hasSessionActivity ? categoryTotals[category] : 0,
  }));

  const displayActivity = hasSessionActivity ? recentActivity : DEMO_FIXTURE_ACTIVITY;

  return (
    <div className="space-y-6">
      {/* Privacy Hero Banner */}
      <section className="rounded-2xl border border-white/10 bg-[#111116] p-6 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[11px] font-medium text-emerald-300">
              <Lock className="h-3.5 w-3.5" />
              Client-Only Privacy Boundary Active • Zero Raw Document Egress
            </div>
            <h2 className="mt-3 text-xl font-semibold tracking-tight text-zinc-100">
              PII GUARD — Detect. Protect. Share with Confidence.
            </h2>
            <p className="mt-1.5 text-xs leading-relaxed text-zinc-400">
              Inspect, validate, redact, or pseudonymize emails, Indian &amp; international phones, IPv4/IPv6 addresses, PAN, Verhoeff-validated Aadhaar, and Luhn-validated payment cards entirely inside your browser.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={onOpenVerification}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/[0.04] px-4 py-2.5 text-xs font-medium text-zinc-200 transition hover:bg-white/10"
            >
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              Run Verification Suite
            </button>
            <button
              type="button"
              onClick={onOpenWorkspace}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:brightness-110"
            >
              <FileSearch className="h-4 w-4" />
              Start Sanitization
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Session KPI Grid */}
      <section aria-label="Session privacy metrics" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-white/10 bg-[#111116] p-5">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Session Documents Processed</span>
            <FileSearch className="h-4 w-4 text-indigo-400" />
          </div>
          <p className="mt-3 font-mono text-2xl font-bold text-zinc-100">
            {documentsProcessed}
          </p>
          <p className="mt-1 text-xs text-zinc-500">
            {hasSessionActivity
              ? 'Processed in browser memory this session'
              : 'No session documents run yet'}
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#111116] p-5">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Total PII Entities Detected</span>
            <ShieldAlert className="h-4 w-4 text-rose-400" />
          </div>
          <p className="mt-3 font-mono text-2xl font-bold text-zinc-100">
            {totalDetected}
          </p>
          <p className="mt-1 text-xs text-zinc-500">
            {totalRejected} false-positive candidates rejected
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#111116] p-5">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Total Entities Sanitized</span>
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="mt-3 font-mono text-2xl font-bold text-emerald-400">
            {totalSanitized}
          </p>
          <p className="mt-1 text-xs text-zinc-500">
            Active policy: {MODE_LABELS[mode]}
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#111116] p-5">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Privacy Boundary Status</span>
            <Sliders className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="mt-3 text-lg font-semibold text-emerald-300">
            Local-Only Enforced
          </p>
          <p className="mt-1 text-xs text-zinc-500">
            No raw text in storage, logs, or API calls
          </p>
        </div>
      </section>

      {/* Category Distribution + Recent Processing Activity */}
      <section className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-[#111116] p-5 lg:col-span-2">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-semibold text-zinc-100">
                PII Categories Detected (Current Session)
              </h3>
              <p className="text-xs text-zinc-400">
                Live counts from local detection pipeline — zero fabricated telemetry
              </p>
            </div>
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-0.5 text-[11px] text-zinc-300">
              {hasSessionActivity ? 'Live Session Counts' : 'Awaiting Session Run'}
            </span>
          </div>

          {!hasSessionActivity ? (
            <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-[#09090b] p-6 text-center">
              <ShieldOff className="h-7 w-7 text-zinc-500" />
              <p className="mt-2.5 text-xs font-medium text-zinc-200">
                No documents processed yet in this session
              </p>
              <p className="mt-1 max-w-sm text-[11px] text-zinc-400">
                Open the Sanitization Workspace and load a synthetic sample or paste text to populate real category counts.
              </p>
              <button
                type="button"
                onClick={onOpenWorkspace}
                className="mt-3 rounded-lg border border-indigo-500/35 bg-indigo-500/15 px-3 py-1.5 text-xs font-medium text-indigo-200 transition hover:bg-indigo-500/25"
              >
                Open Sanitization Workspace
              </button>
            </div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis
                    dataKey="category"
                    stroke="#71717a"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#71717a"
                    fontSize={11}
                    allowDecimals={false}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#111116',
                      border: '1px solid rgba(255,255,255,0.12)',
                      borderRadius: '12px',
                      color: '#f4f4f5',
                      fontSize: '12px',
                    }}
                  />
                  <Bar
                    dataKey="count"
                    name="Detected Entities"
                    fill="#6366f1"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#111116] p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-zinc-100">Recent Processing Activity</h3>
            <span className="rounded-full border border-white/10 bg-white/[0.03] px-2 py-0.5 text-[11px] text-zinc-400">
              {hasSessionActivity ? 'Session Metadata' : 'Demo Fixtures'}
            </span>
          </div>

          <div className="space-y-2.5">
            {displayActivity.map((item) => (
              <div
                key={item.id}
                className="rounded-xl border border-white/5 bg-[#09090b]/85 p-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="truncate text-xs font-medium text-zinc-200">
                    {item.documentLabel}
                  </p>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                      item.isDemoFixture
                        ? 'bg-amber-500/15 text-amber-300'
                        : 'bg-emerald-500/15 text-emerald-300'
                    }`}
                  >
                    {item.isDemoFixture ? 'Fixture' : item.mode}
                  </span>
                </div>
                <div className="mt-1.5 flex items-center justify-between font-mono text-[11px] text-zinc-500">
                  <span>
                    {item.detectedCount} PII • {item.rejectedCount} FP rejected
                  </span>
                  <span>
                    {item.durationMs}ms • {item.timestamp}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
