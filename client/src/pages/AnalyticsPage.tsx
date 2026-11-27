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
import { useTheme } from '../context/ThemeContext';
import { ALL_PII_CATEGORIES, CATEGORY_LABELS } from '../engine/types';

interface AnalyticsPageProps {
  onOpenWorkspace: () => void;
}

export function AnalyticsPage({ onOpenWorkspace }: AnalyticsPageProps) {
  const { isDark } = useTheme();
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
      <section className="rounded-3xl border border-[#AFB4CE] bg-white p-10 text-center shadow-[0_8px_24px_-10px_rgba(18,20,31,0.10)] dark:border-[#383E5C] dark:bg-[#1B1F30] dark:shadow-[0_10px_28px_-10px_rgba(0,0,0,0.45)]">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-[#AFB4CE] bg-[#E4E6F0] dark:border-[#383E5C] dark:bg-[#232739]">
          <BarChart3 className="h-5 w-5 text-[#4F5580] dark:text-[#8B93C9]" />
        </div>
        <h2 className="mt-3 text-base font-bold tracking-[-0.01em] text-[#12141F] dark:text-white">
          No Session Analytics Recorded Yet
        </h2>
        <p className="mx-auto mt-1.5 max-w-md text-xs leading-relaxed text-[#4F5580] dark:text-[#AFB4CE]">
          PII GUARD never fabricates live analytics or stores your documents on a server. Process a sample or document in the Sanitization Workspace to inspect real category counts, false-positive rejections, and execution latency.
        </p>
        <button
          type="button"
          onClick={onOpenWorkspace}
          className="mt-4 rounded-full bg-[#4F5580] px-5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#383E5C] dark:bg-[#5B6396] dark:hover:bg-[#4F5580]"
        >
          Go to Sanitization Workspace
        </button>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-[#AFB4CE] bg-white p-5 shadow-[0_8px_24px_-10px_rgba(18,20,31,0.10)] dark:border-[#383E5C] dark:bg-[#1B1F30] dark:shadow-[0_10px_28px_-10px_rgba(0,0,0,0.45)]">
          <div className="mb-4 border-b border-[#E4E6F0] pb-3 dark:border-[#383E5C]">
            <h2 className="text-sm font-bold tracking-[-0.01em] text-[#12141F] dark:text-white">
              Validated PII vs Rejected False Positives
            </h2>
            <p className="text-xs text-[#4F5580] dark:text-[#AFB4CE]">
              Actual engine outputs ({totalDetected} validated, {totalRejected} false positives rejected)
            </p>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={categoryChartData}
                margin={{ top: 8, right: 8, left: -12, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#2E334B' : '#E4E6F0'} />
                <XAxis
                  dataKey="category"
                  stroke={isDark ? '#AFB4CE' : '#4F5580'}
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke={isDark ? '#AFB4CE' : '#4F5580'}
                  fontSize={11}
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? '#1B1F30' : '#FFFFFF',
                    border: `1px solid ${isDark ? '#383E5C' : '#AFB4CE'}`,
                    borderRadius: '12px',
                    boxShadow: '0 8px 24px -10px rgba(18, 20, 31, 0.28)',
                    color: isDark ? '#FFFFFF' : '#12141F',
                    fontSize: '12px',
                  }}
                />
                <Bar
                  dataKey="detected"
                  name="Validated PII"
                  fill={isDark ? '#6E76B4' : '#4F5580'}
                  radius={[6, 6, 0, 0]}
                />
                <Bar
                  dataKey="rejected"
                  name="Rejected False Positives"
                  fill={isDark ? '#AFB4CE' : '#7B81A8'}
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-[#AFB4CE] bg-white p-5 shadow-[0_8px_24px_-10px_rgba(18,20,31,0.10)] dark:border-[#383E5C] dark:bg-[#1B1F30] dark:shadow-[0_10px_28px_-10px_rgba(0,0,0,0.45)]">
          <div className="mb-4 border-b border-[#E4E6F0] pb-3 dark:border-[#383E5C]">
            <h2 className="text-sm font-bold tracking-[-0.01em] text-[#12141F] dark:text-white">
              Local Engine Processing Duration (ms)
            </h2>
            <p className="text-xs text-[#4F5580] dark:text-[#AFB4CE]">
              Measured locally with performance.now() across session runs
            </p>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={latencySeries}
                margin={{ top: 8, right: 8, left: -12, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#2E334B' : '#E4E6F0'} />
                <XAxis
                  dataKey="label"
                  stroke={isDark ? '#AFB4CE' : '#4F5580'}
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke={isDark ? '#AFB4CE' : '#4F5580'}
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? '#1B1F30' : '#FFFFFF',
                    border: `1px solid ${isDark ? '#383E5C' : '#AFB4CE'}`,
                    borderRadius: '12px',
                    boxShadow: '0 8px 24px -10px rgba(18, 20, 31, 0.28)',
                    color: isDark ? '#FFFFFF' : '#12141F',
                    fontSize: '12px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="durationMs"
                  name="Duration (ms)"
                  stroke={isDark ? '#8B93C9' : '#12141F'}
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: isDark ? '#E4E6F0' : '#4F5580' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-[#AFB4CE] bg-white p-5 shadow-[0_8px_24px_-10px_rgba(18,20,31,0.10)] dark:border-[#383E5C] dark:bg-[#1B1F30] dark:shadow-[0_10px_28px_-10px_rgba(0,0,0,0.45)]">
        <h3 className="text-sm font-bold tracking-[-0.01em] text-[#12141F] dark:text-white">
          Category Breakdown (Metadata Only)
        </h3>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#AFB4CE] text-[#4F5580] dark:border-[#383E5C] dark:text-[#AFB4CE]">
                <th className="pb-2.5 font-semibold">PII Category</th>
                <th className="pb-2.5 font-semibold">Session Detected</th>
                <th className="pb-2.5 font-semibold">Active Doc Rejected FP</th>
                <th className="pb-2.5 font-semibold">Validation Policy</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E6F0] text-[#12141F] dark:divide-[#2E334B] dark:text-[#E4E6F0]">
              {ALL_PII_CATEGORIES.map((cat) => (
                <tr key={cat} className="hover:bg-[#E4E6F0]/40 dark:hover:bg-[#232739]">
                  <td className="py-3 font-semibold">{CATEGORY_LABELS[cat]}</td>
                  <td className="py-3 font-mono font-medium text-[#12141F] dark:text-white">{categoryTotals[cat]}</td>
                  <td className="py-3 font-mono font-medium text-[#4F5580] dark:text-amber-300">
                    {activeResult?.stats.rejectedByCategory[cat] ?? 0}
                  </td>
                  <td className="py-3 text-[#4F5580] dark:text-[#AFB4CE]">
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
