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
      <section className="rounded-3xl border border-[#D8DCE8] bg-white p-10 text-center shadow-[0_6px_20px_-8px_rgba(19,20,32,0.08)] dark:border-[#2E314A] dark:bg-[#1B1D2E] dark:shadow-[0_10px_28px_-10px_rgba(0,0,0,0.45)]">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-[#D8DCE8] bg-[#EEF0F7] dark:border-[#2E314A] dark:bg-[#23263B]">
          <BarChart3 className="h-5 w-5 text-[#5A45F5] dark:text-[#8B93C9]" />
        </div>
        <h2 className="mt-3 text-base font-bold tracking-tight text-[#131420] dark:text-white">
          No Session Analytics Recorded Yet
        </h2>
        <p className="mx-auto mt-1.5 max-w-md text-xs leading-relaxed text-[#5E6478] dark:text-[#B0B5C9]">
          PII GUARD never fabricates live analytics or stores your documents on a server. Process a sample or document in the Sanitization Workspace to inspect real category counts, false-positive rejections, and execution latency.
        </p>
        <button
          type="button"
          onClick={onOpenWorkspace}
          className="mt-4 rounded-full bg-[#5A45F5] px-5 py-2 text-xs font-medium text-white shadow-[0_8px_20px_-6px_rgba(90,69,245,0.45)] transition hover:bg-[#4A35E0]"
        >
          Go to Sanitization Workspace
        </button>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-[#D8DCE8] bg-white p-5 shadow-[0_6px_20px_-8px_rgba(19,20,32,0.08)] dark:border-[#2E314A] dark:bg-[#1B1D2E] dark:shadow-[0_10px_28px_-10px_rgba(0,0,0,0.45)]">
          <div className="mb-4 border-b border-[#E6E8F0] pb-3 dark:border-[#2E314A]">
            <h2 className="text-sm font-bold tracking-tight text-[#131420] dark:text-white">
              Validated PII vs Rejected False Positives
            </h2>
            <p className="text-xs text-[#5E6478] dark:text-[#B0B5C9]">
              Actual engine outputs ({totalDetected} validated, {totalRejected} false positives rejected)
            </p>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={categoryChartData}
                margin={{ top: 8, right: 8, left: -12, bottom: 0 }}
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
                  dataKey="detected"
                  name="Validated PII"
                  fill="#5A45F5"
                  radius={[6, 6, 0, 0]}
                />
                <Bar
                  dataKey="rejected"
                  name="Rejected False Positives"
                  fill={isDark ? '#B0B5C9' : '#3B3E59'}
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-[#D8DCE8] bg-white p-5 shadow-[0_6px_20px_-8px_rgba(19,20,32,0.08)] dark:border-[#2E314A] dark:bg-[#1B1D2E] dark:shadow-[0_10px_28px_-10px_rgba(0,0,0,0.45)]">
          <div className="mb-4 border-b border-[#E6E8F0] pb-3 dark:border-[#2E314A]">
            <h2 className="text-sm font-bold tracking-tight text-[#131420] dark:text-white">
              Local Engine Processing Duration (ms)
            </h2>
            <p className="text-xs text-[#5E6478] dark:text-[#B0B5C9]">
              Measured locally with performance.now() across session runs
            </p>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={latencySeries}
                margin={{ top: 8, right: 8, left: -12, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#2E314A' : '#E6E8F0'} />
                <XAxis
                  dataKey="label"
                  stroke={isDark ? '#B0B5C9' : '#5E6478'}
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke={isDark ? '#B0B5C9' : '#5E6478'}
                  fontSize={11}
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
                <Line
                  type="monotone"
                  dataKey="durationMs"
                  name="Duration (ms)"
                  stroke="#5A45F5"
                  strokeWidth={2.5}
                  dot={{ r: 3.5, fill: '#10B981', stroke: '#5A45F5', strokeWidth: 1.5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-[#D8DCE8] bg-white p-5 shadow-[0_6px_20px_-8px_rgba(19,20,32,0.08)] dark:border-[#2E314A] dark:bg-[#1B1D2E] dark:shadow-[0_10px_28px_-10px_rgba(0,0,0,0.45)]">
        <h3 className="text-sm font-bold tracking-tight text-[#131420] dark:text-white">
          Category Breakdown (Metadata Only)
        </h3>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#D8DCE8] text-[#5E6478] dark:border-[#2E314A] dark:text-[#B0B5C9]">
                <th className="pb-2.5 font-semibold">PII Category</th>
                <th className="pb-2.5 font-semibold">Session Detected</th>
                <th className="pb-2.5 font-semibold">Active Doc Rejected FP</th>
                <th className="pb-2.5 font-semibold">Validation Policy</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E6E8F0] text-[#131420] dark:divide-[#2E314A] dark:text-[#E6E8F0]">
              {ALL_PII_CATEGORIES.map((cat) => (
                <tr key={cat} className="hover:bg-[#F4F5FA] dark:hover:bg-[#23263B]">
                  <td className="py-3 font-semibold">{CATEGORY_LABELS[cat]}</td>
                  <td className="py-3 font-mono font-medium text-[#131420] dark:text-white">{categoryTotals[cat]}</td>
                  <td className="py-3 font-mono font-medium text-[#3B3E59] dark:text-amber-300">
                    {activeResult?.stats.rejectedByCategory[cat] ?? 0}
                  </td>
                  <td className="py-3 text-[#5E6478] dark:text-[#B0B5C9]">
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
