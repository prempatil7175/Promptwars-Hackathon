import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  Code2,
  Cpu,
  Loader2,
  Send,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import { useDemoMode } from '../../context/DemoModeContext';
import { useToast } from '../../context/ToastContext';
import { buildClientMockAiResponse, PROMPT_PRESETS } from '../../data/mockData';
import { generateAiInsight } from '../../lib/api';
import type { AiGenerateResponse } from '../../types';
import { Skeleton } from '../ui/Skeleton';

interface AIPlaygroundCardProps {
  compact?: boolean;
  onRunComplete?: (prompt: string, result: AiGenerateResponse) => void;
}

const PRIORITY_BADGE: Record<'high' | 'medium' | 'low', string> = {
  high: 'border-rose-500/30 bg-rose-500/10 text-rose-300',
  medium: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
  low: 'border-zinc-500/30 bg-zinc-500/10 text-zinc-300',
};

export function AIPlaygroundCard({ compact = false, onRunComplete }: AIPlaygroundCardProps) {
  const { isDemoMode, runWithFallback } = useDemoMode();
  const { addToast } = useToast();

  const [prompt, setPrompt] = useState(PROMPT_PRESETS[0].prompt);
  const [loading, setLoading] = useState(false);
  const [showRawJson, setShowRawJson] = useState(false);
  const [result, setResult] = useState<AiGenerateResponse | null>(() =>
    buildClientMockAiResponse(PROMPT_PRESETS[0].prompt, 'Pre-seeded initial output')
  );

  const handleRun = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const cleanPrompt = prompt.trim();
    if (!cleanPrompt || loading) return;

    setLoading(true);
    const response = await runWithFallback(
      (signal) => generateAiInsight({ prompt: cleanPrompt, demoMode: isDemoMode }, signal),
      () => buildClientMockAiResponse(cleanPrompt),
      'AI Generate'
    );

    setResult(response.data);
    setLoading(false);
    onRunComplete?.(cleanPrompt, response.data);

    if (!isDemoMode && response.source === 'live' && response.data.source === 'demo-fallback') {
      addToast({
        title: 'Server Demo Fallback Active',
        description: response.data.fallbackReason || 'Returned realistic structured JSON.',
        variant: 'info',
      });
    } else if (response.source === 'live' && response.data.source === 'live') {
      addToast({
        title: `Generated via ${response.data.model}`,
        description: `Completed in ${response.data.latencyMs}ms`,
        variant: 'success',
      });
    }
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-[#111116] p-5 shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-indigo-500/30 bg-indigo-500/15">
            <Sparkles className="h-4 w-4 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-zinc-100">
              Gemini Structured AI Playground
            </h2>
            <p className="text-xs text-zinc-400">
              POST <code className="text-zinc-300">/api/ai/generate</code> • Auto-fallback on timeout or missing key
            </p>
          </div>
        </div>

        {result && (
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium ${
                result.source === 'live'
                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                  : 'border-amber-500/30 bg-amber-500/10 text-amber-300'
              }`}
            >
              {result.source === 'live' ? (
                <Cpu className="h-3 w-3" />
              ) : (
                <ShieldAlert className="h-3 w-3" />
              )}
              {result.source === 'live' ? 'Live Gemini' : 'Demo Fallback'} • {result.latencyMs}ms
            </span>

            <button
              type="button"
              onClick={() => setShowRawJson((v) => !v)}
              className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[11px] font-medium text-zinc-300 transition hover:bg-white/10"
            >
              <Code2 className="h-3 w-3" />
              {showRawJson ? 'Formatted' : 'Raw JSON'}
            </button>
          </div>
        )}
      </div>

      {/* Preset prompt chips */}
      <div className="mt-4 flex flex-wrap gap-2">
        {PROMPT_PRESETS.map((preset) => (
          <button
            key={preset.label}
            type="button"
            onClick={() => setPrompt(preset.prompt)}
            className="rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1 text-xs text-zinc-300 transition hover:border-indigo-500/40 hover:bg-indigo-500/10 hover:text-indigo-200"
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Prompt input form */}
      <form onSubmit={handleRun} className="mt-3 flex flex-col gap-2.5 sm:flex-row">
        <textarea
          rows={compact ? 2 : 3}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe an AI product, workflow, or hackathon feature to synthesize..."
          className="flex-1 resize-none rounded-xl border border-white/10 bg-[#09090b] px-3.5 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-indigo-500/60 focus:outline-none"
        />
        <button
          type="submit"
          disabled={loading || !prompt.trim()}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-50 sm:self-end"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              Run Prompt
            </>
          )}
        </button>
      </form>

      {/* Output area */}
      <div className="mt-5">
        {loading ? (
          <div className="space-y-3 rounded-xl border border-white/10 bg-[#09090b] p-4">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <div className="grid gap-3 pt-2 md:grid-cols-2">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          </div>
        ) : result && showRawJson ? (
          <pre className="max-h-96 overflow-auto rounded-xl border border-white/10 bg-[#09090b] p-4 font-mono text-xs leading-relaxed text-emerald-300">
            {JSON.stringify(result, null, 2)}
          </pre>
        ) : (
          result && (
            <motion.div
              key={result.summary + result.latencyMs}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-4 rounded-xl border border-white/10 bg-[#09090b]/90 p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-white/10 pb-3.5">
                <div className="max-w-2xl">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-indigo-400">
                    Executive Summary
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-zinc-200">
                    {result.summary}
                  </p>
                </div>
                <div className="flex gap-3">
                  <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-right">
                    <p className="text-[10px] uppercase tracking-wider text-zinc-400">
                      Confidence
                    </p>
                    <p className="text-base font-bold text-emerald-400">
                      {result.confidenceScore}%
                    </p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-right">
                    <p className="text-[10px] uppercase tracking-wider text-zinc-400">
                      Impact
                    </p>
                    <p className="max-w-[160px] truncate text-xs font-semibold text-zinc-100">
                      {result.estimatedImpact}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold text-zinc-300">Key Insights</p>
                  <ul className="mt-2 space-y-2">
                    {result.insights.map((insight, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2 rounded-lg border border-white/5 bg-white/[0.02] p-2.5 text-xs leading-relaxed text-zinc-300"
                      >
                        <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-indigo-400" />
                        <span>{insight}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <p className="text-xs font-semibold text-zinc-300">Action Checklist</p>
                  <div className="mt-2 space-y-2">
                    {result.actionItems.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between gap-2 rounded-lg border border-white/5 bg-white/[0.02] p-2.5"
                      >
                        <span className="text-xs text-zinc-200">{item.title}</span>
                        <div className="flex shrink-0 items-center gap-1.5">
                          <span
                            className={`rounded-full border px-2 py-0.5 text-[10px] font-medium capitalize ${
                              PRIORITY_BADGE[item.priority]
                            }`}
                          >
                            {item.priority}
                          </span>
                          <span className="font-mono text-[10px] text-zinc-400">
                            {item.effort}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )
        )}
      </div>
    </div>
  );
}
