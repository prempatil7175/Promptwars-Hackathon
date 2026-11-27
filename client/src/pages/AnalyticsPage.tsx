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
import { MOCK_CATEGORY_BREAKDOWN, MOCK_THROUGHPUT_SERIES } from '../data/mockData';

export function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <section className="grid gap-6 lg:grid-cols-2">
        {/* Category Runs BarChart */}
        <div className="rounded-2xl border border-white/10 bg-[#111116] p-5">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-zinc-100">
              Workflow Distribution by Domain
            </h2>
            <p className="text-xs text-zinc-400">
              Structured AI pipeline runs across seeded hackathon modules
            </p>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={MOCK_CATEGORY_BREAKDOWN}
                margin={{ top: 8, right: 8, left: -12, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis
                  dataKey="category"
                  stroke="#71717a"
                  fontSize={11}
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
                <Bar dataKey="runs" name="Total Runs" fill="#6366f1" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Latency Trend LineChart */}
        <div className="rounded-2xl border border-white/10 bg-[#111116] p-5">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-zinc-100">
              Median Inference Latency (ms)
            </h2>
            <p className="text-xs text-zinc-400">
              Sub-second Gemini 4 Hydrogen response stability over time
            </p>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={MOCK_THROUGHPUT_SERIES}
                margin={{ top: 8, right: 8, left: -12, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis
                  dataKey="label"
                  stroke="#71717a"
                  fontSize={11}
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
                  dataKey="latencyMs"
                  name="Latency (ms)"
                  stroke="#34d399"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#34d399' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* Domain Accuracy Table */}
      <section className="rounded-2xl border border-white/10 bg-[#111116] p-5">
        <h3 className="text-sm font-semibold text-zinc-100">Pipeline Reliability Matrix</h3>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-zinc-400">
                <th className="pb-2.5 font-medium">Pipeline</th>
                <th className="pb-2.5 font-medium">Total Runs</th>
                <th className="pb-2.5 font-medium">Schema Accuracy</th>
                <th className="pb-2.5 font-medium">Fallback Policy</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-zinc-200">
              {MOCK_CATEGORY_BREAKDOWN.map((row) => (
                <tr key={row.category}>
                  <td className="py-3 font-medium">{row.category}</td>
                  <td className="py-3 font-mono text-zinc-300">{row.runs}</td>
                  <td className="py-3">
                    <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 font-mono text-emerald-300">
                      {row.accuracy}%
                    </span>
                  </td>
                  <td className="py-3 text-zinc-400">8s timeout + cached mock</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
