import {
  ArrowRight,
  CheckCircle2,
  FileSearch,
  Lock,
  ShieldAlert,
  ShieldCheck,
  ShieldOff,
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
import { useTheme } from '../context/ThemeContext';
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
  const { isDark } = useTheme();
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
  const sanitizedPct =
    totalDetected > 0 ? Math.round((totalSanitized / totalDetected) * 100) : 0;

  const chartData = ALL_PII_CATEGORIES.map((category) => ({
    category: CATEGORY_LABELS[category],
    count: hasSessionActivity ? categoryTotals[category] : 0,
  }));

  const displayActivity = hasSessionActivity ? recentActivity : DEMO_FIXTURE_ACTIVITY;

  return (
    <div className="space-y-6">
      {/* Main PII GUARD Midnight Navy Hero Banner */}
      <section className="rounded-3xl border border-[#2E314A] bg-gradient-to-r from-[#131420] to-[#1B1D2E] p-6 shadow-[0_12px_32px_-12px_rgba(19,20,32,0.35)] dark:border-[#5A45F5]/40 dark:from-[#1B1D2E] dark:via-[#23263B] dark:to-[#181A2A] dark:shadow-[0_16px_40px_-12px_rgba(0,0,0,0.65)] sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-[11px] font-semibold text-white">
              <Lock className="h-3.5 w-3.5 shrink-0 text-white" aria-hidden="true" />
              <span>Runs entirely in your browser. No documents leave your device.</span>
            </div>
            <h2 className="mt-3 text-xl font-bold leading-snug tracking-tight text-white">
              PII GUARD — Detect. Protect. Share with Confidence.
            </h2>
            <p className="mt-1.5 text-xs leading-relaxed text-[#B0B5C9]">
              Inspect, validate, redact, or pseudonymize emails, Indian &amp; international phone numbers, IPv4/IPv6 addresses, PAN, Verhoeff-validated Aadhaar, and Luhn-validated payment cards.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onOpenVerification}
              className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-white/25 bg-transparent px-4 py-2.5 text-xs font-medium text-white transition hover:bg-white/10 active:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A5B4FC] focus-visible:ring-offset-2 focus-visible:ring-offset-[#131420]"
            >
              <CheckCircle2 className="h-4 w-4 shrink-0 text-white" aria-hidden="true" />
              Run Verification Suite
            </button>
            <button
              type="button"
              onClick={onOpenWorkspace}
              className="inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-[#5A45F5] px-5 py-2.5 text-xs font-medium text-white shadow-[0_8px_20px_-6px_rgba(90,69,245,0.45)] transition hover:bg-[#4A35E0] active:scale-[0.98] active:bg-[#3E2BC4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A5B4FC] focus-visible:ring-offset-2 focus-visible:ring-offset-[#131420]"
            >
              <FileSearch className="h-4 w-4 shrink-0 text-white" aria-hidden="true" />
              Start Sanitization
              <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
            </button>
          </div>
        </div>
      </section>

      {/* Session KPI Grid */}
      <section aria-label="Session privacy metrics" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="min-w-0 rounded-2xl border border-[#D8DCE8] bg-white p-5 shadow-[0_6px_20px_-8px_rgba(19,20,32,0.08)] dark:border-[#2E314A] dark:bg-[#1B1D2E] dark:shadow-[0_10px_28px_-10px_rgba(0,0,0,0.45)]">
          <div className="flex items-center justify-between text-xs font-medium text-[#5E6478] dark:text-[#B0B5C9]">
            <span>Session Documents Processed</span>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#D8DCE8] bg-[#EEF0F7] text-[#3B3E59] dark:border-[#2E314A] dark:bg-[#23263B] dark:text-[#B0B5C9]">
              <FileSearch className="h-4 w-4" aria-hidden="true" />
            </span>
          </div>
          <p className="mt-3 font-mono text-2xl font-bold tracking-tight text-[#131420] dark:text-white">
            {documentsProcessed}
          </p>
          <p className="mt-1 text-xs leading-normal text-[#5E6478] dark:text-[#B0B5C9]">
            {hasSessionActivity
              ? 'Processed in browser memory this session'
              : 'No session documents run yet'}
          </p>
        </div>

        <div className="min-w-0 rounded-2xl border border-[#D8DCE8] bg-white p-5 shadow-[0_6px_20px_-8px_rgba(19,20,32,0.08)] dark:border-[#2E314A] dark:bg-[#1B1D2E] dark:shadow-[0_10px_28px_-10px_rgba(0,0,0,0.45)]">
          <div className="flex items-center justify-between text-xs font-medium text-[#5E6478] dark:text-[#B0B5C9]">
            <span>Total PII Entities Detected</span>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/35 dark:bg-rose-500/15 dark:text-rose-300">
              <ShieldAlert className="h-4 w-4" aria-hidden="true" />
            </span>
          </div>
          <p className="mt-3 font-mono text-2xl font-bold tracking-tight text-[#131420] dark:text-white">
            {totalDetected}
          </p>
          <p className="mt-1 text-xs leading-normal text-[#5E6478] dark:text-[#B0B5C9]">
            {totalRejected} false-positive candidates rejected
          </p>
        </div>

        <div className="min-w-0 rounded-2xl border border-[#D8DCE8] bg-white p-5 shadow-[0_6px_20px_-8px_rgba(19,20,32,0.08)] dark:border-[#2E314A] dark:bg-[#1B1D2E] dark:shadow-[0_10px_28px_-10px_rgba(0,0,0,0.45)]">
          <div className="flex items-center justify-between text-xs font-medium text-[#5E6478] dark:text-[#B0B5C9]">
            <span>Total Entities Sanitized</span>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/35 dark:bg-emerald-500/15 dark:text-emerald-300">
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            </span>
          </div>
          <p className="mt-3 font-mono text-xl font-bold tracking-tight text-[#131420] dark:text-emerald-300 sm:text-2xl">
            {`${totalSanitized} / ${totalDetected}, ${sanitizedPct}%`}
          </p>
          <p className="mt-1 text-xs leading-normal text-[#5E6478] dark:text-[#B0B5C9]">
            Active policy: {MODE_LABELS[mode]}
          </p>
        </div>

        <div className="min-w-0 rounded-2xl border border-[#D8DCE8] bg-white p-5 shadow-[0_6px_20px_-8px_rgba(19,20,32,0.08)] dark:border-[#2E314A] dark:bg-[#1B1D2E] dark:shadow-[0_10px_28px_-10px_rgba(0,0,0,0.45)]">
          <div className="flex items-center justify-between text-xs font-medium text-[#5E6478] dark:text-[#B0B5C9]">
            <span>Privacy Boundary Status</span>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#D8DCE8] bg-[#EEF0F7] text-[#3B3E59] dark:border-[#2E314A] dark:bg-[#23263B] dark:text-[#E6E8F0]">
              <Lock className="h-4 w-4" aria-hidden="true" />
            </span>
          </div>
          <p className="mt-3 text-lg font-bold leading-snug tracking-tight text-[#131420] dark:text-white">
            Local-Only Enforced
          </p>
          <p className="mt-1 text-xs leading-normal text-[#5E6478] dark:text-[#B0B5C9]">
            No raw text in storage, logs, or API calls
          </p>
        </div>
      </section>

      {/* Category Distribution + Recent Processing Activity */}
      <section className="grid gap-6 lg:grid-cols-3">
        <div className="min-w-0 rounded-2xl border border-[#D8DCE8] bg-white p-5 shadow-[0_6px_20px_-8px_rgba(19,20,32,0.08)] dark:border-[#2E314A] dark:bg-[#1B1D2E] dark:shadow-[0_10px_28px_-10px_rgba(0,0,0,0.45)] lg:col-span-2">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-[#E6E8F0] pb-3 dark:border-[#2E314A]">
            <div>
              <h3 className="text-sm font-bold tracking-tight text-[#131420] dark:text-white">
                PII Categories Detected (Current Session)
              </h3>
              <p className="text-xs leading-normal text-[#5E6478] dark:text-[#B0B5C9]">
                Live counts from your local session
              </p>
            </div>
            <span className="whitespace-nowrap rounded-full border border-[#D8DCE8] bg-[#EEF0F7] px-3 py-0.5 text-[11px] font-semibold text-[#3B3E59] dark:border-[#2E314A] dark:bg-[#23263B] dark:text-[#E6E8F0]">
              {hasSessionActivity ? 'Live Session Counts' : 'Awaiting Session Run'}
            </span>
          </div>

          {!hasSessionActivity ? (
            <div className="relative flex h-64 flex-col items-center justify-center overflow-hidden rounded-xl border border-dashed border-[#D8DCE8] bg-[#F4F5FA] p-6 text-center dark:border-[#2E314A] dark:bg-[#131420]/65">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-40"
              >
                <div className="h-44 w-44 rounded-full border border-[#D8DCE8] dark:border-[#2E314A]" />
                <div className="absolute h-28 w-28 rounded-full border border-dashed border-[#D8DCE8] dark:border-[#2E314A]" />
              </div>
              <div className="relative flex h-11 w-11 items-center justify-center rounded-full border border-[#D8DCE8] bg-white dark:border-[#2E314A] dark:bg-[#23263B]">
                <ShieldOff className="h-5 w-5 text-[#5E6478] dark:text-[#B0B5C9]" aria-hidden="true" />
              </div>
              <p className="relative mt-3 text-xs font-semibold text-[#131420] dark:text-white">
                No documents processed yet in this session
              </p>
              <p className="relative mt-1 max-w-sm text-xs leading-relaxed text-[#5E6478] dark:text-[#B0B5C9]">
                Open the Sanitization Workspace and load a synthetic sample or paste text to populate real category counts.
              </p>
              <button
                type="button"
                onClick={onOpenWorkspace}
                className="relative mt-3.5 rounded-full bg-[#5A45F5] px-4 py-1.5 text-xs font-medium text-white shadow-[0_8px_20px_-6px_rgba(90,69,245,0.45)] transition hover:bg-[#4A35E0]"
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
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#2E314A' : '#E6E8F0'} />
                  <XAxis
                    dataKey="category"
                    stroke={isDark ? '#B0B5C9' : '#5E6478'}
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke={isDark ? '#B0B5C9' : '#5E6478'}
                    fontSize={11}
                    allowDecimals={false}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1B1D2E',
                      border: '1px solid #2E314A',
                      borderRadius: '12px',
                      boxShadow: '0 8px 24px -10px rgba(19, 20, 32, 0.35)',
                      color: '#FFFFFF',
                      fontSize: '12px',
                    }}
                  />
                  <Bar
                    dataKey="count"
                    name="Detected Entities"
                    fill="#5A45F5"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Recent Processing Activity Card */}
        <div className="min-w-0 rounded-2xl border border-[#D8DCE8] bg-white p-5 text-[#131420] shadow-[0_6px_20px_-8px_rgba(19,20,32,0.08)] dark:border-[#2E314A] dark:bg-[#1B1D2E] dark:text-[#E6E8F0] dark:shadow-[0_10px_28px_-10px_rgba(0,0,0,0.45)]">
          <div className="mb-4 flex items-center justify-between gap-2 border-b border-[#E6E8F0] pb-3 dark:border-[#2E314A]">
            <h3 className="min-w-0 truncate text-sm font-bold tracking-tight text-[#131420] dark:text-white">
              Recent Processing Activity
            </h3>
            <span className="shrink-0 whitespace-nowrap rounded-full border border-[#D8DCE8] bg-[#EEF0F7] px-2.5 py-0.5 text-[11px] font-semibold text-[#3B3E59] dark:border-[#2E314A] dark:bg-[#23263B] dark:text-[#E6E8F0]">
              {hasSessionActivity ? 'Session Metadata' : 'Demo Fixtures'}
            </span>
          </div>

          <div className="space-y-2.5">
            {displayActivity.map((item) => (
              <div
                key={item.id}
                className="rounded-xl border border-[#D8DCE8] bg-[#F4F5FA] p-3 transition hover:border-[#5A45F5]/50 hover:bg-[#EEF0F7] dark:border-[#2E314A] dark:bg-[#131420]/65 dark:hover:border-[#5A45F5] dark:hover:bg-[#131420]"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="min-w-0 truncate text-xs font-semibold text-[#131420] dark:text-white">
                    {item.documentLabel}
                  </p>
                  <span
                    className={`shrink-0 whitespace-nowrap rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
                      item.isDemoFixture
                        ? 'border-[#D8DCE8] bg-white text-[#3B3E59] dark:border-[#2E314A] dark:bg-[#23263B] dark:text-[#E6E8F0]'
                        : 'border-[#5A45F5] bg-[#5A45F5] text-white'
                    }`}
                  >
                    {item.isDemoFixture ? 'Fixture' : item.mode}
                  </span>
                </div>
                <div className="mt-1.5 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 font-mono text-[11px] text-[#5E6478] dark:text-[#B0B5C9]">
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
