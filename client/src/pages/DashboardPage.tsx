import { Activity, ArrowUpRight, Cpu, ShieldCheck, Zap } from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { AIPlaygroundCard } from '../components/ai/AIPlaygroundCard';
import {
  MOCK_ACTIVITY_FEED,
  MOCK_KPIS,
  MOCK_THROUGHPUT_SERIES,
} from '../data/mockData';
import type { AiGenerateResponse } from '../types';

interface DashboardPageProps {
  onRunComplete: (prompt: string, result: AiGenerateResponse) => void;
}

const KPI_ICONS = [Zap, Cpu, ShieldCheck, Activity];

export function DashboardPage({ onRunComplete }: DashboardPageProps) {
  return (
    <div className="space-y-6">
      {/* KPI Grid */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {MOCK_KPIS.map((kpi, idx) => {
          const Icon = KPI_ICONS[idx % KPI_ICONS.length];
          return (
            <div
              key={kpi.id}
              className="rounded-2xl border border-white/10 bg-[#111116] p-5 transition hover:border-white/20"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-400">{kpi.label}</span>
                <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03]">
                  <Icon className="h-3.5 w-3.5 text-indigo-400" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline justify-between gap-2">
                <p className="text-2xl font-bold tracking-tight text-zinc-100">
                  {kpi.value}
                </p>
                <span className="inline-flex items-center gap-0.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-300">
                  <ArrowUpRight className="h-3 w-3" />
                  {kpi.delta}
                </span>
              </div>
              <p className="mt-1.5 text-xs text-zinc-500">{kpi.detail}</p>
            </div>
          );
        })}
      </section>

      {/* Recharts Trend + Activity Feed */}
      <section className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-[#111116] p-5 lg:col-span-2">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-semibold text-zinc-100">
                Inference Throughput &amp; Fallback Shield
              </h2>
              <p className="text-xs text-zinc-400">
                Live requests vs automatic cached fallback recoveries (24h)
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs text-zinc-400">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-indigo-400" />
                Live Requests
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-amber-400" />
                Fallbacks
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={MOCK_THROUGHPUT_SERIES}
                margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="liveGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.38} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
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
                <Area
                  type="monotone"
                  dataKey="liveRequests"
                  name="Live Requests"
                  stroke="#818cf8"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#liveGradient)"
                />
                <Area
                  type="monotone"
                  dataKey="cachedFallbacks"
                  name="Cached Fallbacks"
                  stroke="#fbbf24"
                  strokeWidth={2}
                  fillOpacity={0.15}
                  fill="#fbbf24"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent AI Activity Feed */}
        <div className="rounded-2xl border border-white/10 bg-[#111116] p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-100">Recent AI Runs</h2>
            <span className="rounded-full border border-white/10 bg-white/[0.03] px-2 py-0.5 text-[11px] text-zinc-400">
              Seeded Stream
            </span>
          </div>

          <div className="space-y-3">
            {MOCK_ACTIVITY_FEED.map((item) => (
              <div
                key={item.id}
                className="rounded-xl border border-white/5 bg-[#09090b]/80 p-3 transition hover:border-white/15"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs font-medium text-zinc-200">{item.title}</p>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                      item.status === 'live'
                        ? 'bg-emerald-500/15 text-emerald-300'
                        : 'bg-amber-500/15 text-amber-300'
                    }`}
                  >
                    {item.status === 'live' ? 'Live' : 'Fallback'}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between font-mono text-[11px] text-zinc-500">
                  <span>{item.pipeline}</span>
                  <span>
                    {item.latency} • {item.timeAgo}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive AI Playground embedded on Dashboard */}
      <section>
        <AIPlaygroundCard compact onRunComplete={onRunComplete} />
      </section>
    </div>
  );
}
