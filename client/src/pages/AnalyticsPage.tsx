import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { BarChart3 } from 'lucide-react';
import { usePrivacySession } from '../context/PrivacySessionContext';
import { ALL_PII_CATEGORIES, CATEGORY_LABELS } from '../engine/types';

interface AnalyticsPageProps {
  onOpenWorkspace: () => void;
}

export function AnalyticsPage({ onOpenWorkspace }: AnalyticsPageProps) {
  const {
    documentsProcessed,
    totalDetected,
    totalRejected,
    categoryTotals,
    activeResult,
    latencySeries,
  } = usePrivacySession();

  const hasData = documentsProcessed > 0 || Boolean(activeResult);

  const categoryChartData = ALL_PII_CATEGORIES.map((cat) => {
    const detected =
      categoryTotals[cat] > 0
        ? categoryTotals[cat]
        : activeResult?.stats.categoryCounts[cat] ?? 0;
    const rejected = activeResult?.stats.rejectedByCategory[cat] ?? 0;
    return {
      category: CATEGORY_LABELS[cat],
      detected,
      rejected,
    };
  });

  if (!hasData) {
    return (
      <section className="rounded-2xl border border-white/10 bg-[#111116] p-10 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-indigo-500/30 bg-indigo-500/10">
          <BarChart3 className="h-5 w-5 text-indigo-400" />
        </div>
        <h2 className="mt-3 text-base font-semibold text-zinc-100">
          No Session Analytics Recorded Yet
        </h2>
        <p className="mx-auto mt-1.5 max-w-md text-xs leading-relaxed text-zinc-400">
          PII GUARD never fabricates live analytics or stores your documents on a server. Process a sample or document in the Sanitization Workspace to inspect real category counts, false-positive rejections, and execution latency.
        </p>
        <button
          type="button"
          onClick={onOpenWorkspace}
          className="mt-4 rounded-xl bg-indigo-500 px-4 py-2 text-xs font-semibold text-white transition hover:bg-indigo-400"
        >
          Go to Sanitization Workspace
        </button>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-[#111116] p-5">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-zinc-100">
              Validated PII vs Rejected False Positives
            </h2>
            <p className="text-xs text-zinc-400">
              Actual engine outputs ({totalDetected} validated, {totalRejected} false positives rejected)
            </p>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={categoryChartData}
                margin={{ top: 8, right: 8, left: -12, bottom: 0 }}
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
                  dataKey="detected"
                  name="Validated PII"
                  fill="#6366f1"
                  radius={[6, 6, 0, 0]}
                />
                <Bar
                  dataKey="rejected"
                  name="Rejected False Positives"
                  fill="#f59e0b"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#111116] p-5">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-zinc-100">
              Local Engine Processing Duration (ms)
            </h2>
            <p className="text-xs text-zinc-400">
              Measured locally with performance.now() across session runs
            </p>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={latencySeries}
                margin={{ top: 8, right: 8, left: -12, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis
                  dataKey="label"
                  stroke="#71717a"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#71717a"
                  fontSize={11}
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
                <Line
                  type="monotone"
                  dataKey="durationMs"
                  name="Duration (ms)"
                  stroke="#34d399"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#34d399' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-[#111116] p-5">
        <h3 className="text-sm font-semibold text-zinc-100">
          Category Breakdown (Metadata Only)
        </h3>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-zinc-400">
                <th className="pb-2.5 font-medium">PII Category</th>
                <th className="pb-2.5 font-medium">Session Detected</th>
                <th className="pb-2.5 font-medium">Active Doc Rejected FP</th>
                <th className="pb-2.5 font-medium">Validation Policy</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-zinc-200">
              {ALL_PII_CATEGORIES.map((cat) => (
                <tr key={cat}>
                  <td className="py-3 font-medium">{CATEGORY_LABELS[cat]}</td>
                  <td className="py-3 font-mono text-zinc-300">{categoryTotals[cat]}</td>
                  <td className="py-3 font-mono text-amber-300">
                    {activeResult?.stats.rejectedByCategory[cat] ?? 0}
                  </td>
                  <td className="py-3 text-zinc-400">
                    {cat === 'AADHAAR'
                      ? '12-digit format + Verhoeff checksum'
                      : cat === 'CREDIT_CARD'
                        ? '13-19 digits + Luhn mod-10'
                        : cat === 'IPV6'
                          ? 'Strict compressed/uncompressed grammar'
                          : cat === 'IPV4'
                            ? '0-255 octets + version exclusion'
                            : 'Strict boundary + context validator'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
