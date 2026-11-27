import { Clock, Cpu, ShieldAlert } from 'lucide-react';
import { AIPlaygroundCard } from '../components/ai/AIPlaygroundCard';
import type { AiGenerateResponse, AiRunHistoryItem } from '../types';

interface AIPlaygroundPageProps {
  history: AiRunHistoryItem[];
  onRunComplete: (prompt: string, result: AiGenerateResponse) => void;
}

export function AIPlaygroundPage({ history, onRunComplete }: AIPlaygroundPageProps) {
  return (
    <div className="space-y-6">
      <AIPlaygroundCard onRunComplete={onRunComplete} />

      <section className="rounded-2xl border border-white/10 bg-[#111116] p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-zinc-100">Session Run History</h3>
            <p className="text-xs text-zinc-400">
              Every prompt execution is tracked with model source and latency
            </p>
          </div>
          <span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-xs text-zinc-300">
            {history.length} {history.length === 1 ? 'run' : 'runs'}
          </span>
        </div>

        <div className="space-y-2.5">
          {history.map((item) => (
            <div
              key={item.id}
              className="flex flex-col justify-between gap-2 rounded-xl border border-white/10 bg-[#09090b] p-3.5 sm:flex-row sm:items-center"
            >
              <div className="min-w-0">
                <p className="truncate text-xs font-medium text-zinc-200">{item.prompt}</p>
                <p className="mt-1 line-clamp-1 text-xs text-zinc-400">
                  {item.result.summary}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2.5 text-[11px]">
                <span
                  className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-medium ${
                    item.result.source === 'live'
                      ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                      : 'border-amber-500/30 bg-amber-500/10 text-amber-300'
                  }`}
                >
                  {item.result.source === 'live' ? (
                    <Cpu className="h-3 w-3" />
                  ) : (
                    <ShieldAlert className="h-3 w-3" />
                  )}
                  {item.result.source === 'live' ? 'Live' : 'Fallback'}
                </span>
                <span className="inline-flex items-center gap-1 font-mono text-zinc-400">
                  <Clock className="h-3 w-3" />
                  {item.result.latencyMs}ms
                </span>
                <span className="text-zinc-500">{item.timestamp}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
