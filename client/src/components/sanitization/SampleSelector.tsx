import { useState } from 'react';
import { FileSpreadsheet, FileText, Loader2, Sparkles } from 'lucide-react';
import { useDemoMode } from '../../context/DemoModeContext';
import { useToast } from '../../context/ToastContext';
import { buildLocalSyntheticSampleFallback } from '../../data/mockData';
import { SYNTHETIC_SAMPLES } from '../../engine/samples';
import type { SampleDocument } from '../../engine/types';
import { requestSyntheticSample } from '../../lib/api';
import type { SyntheticTemplateType } from '../../types';

interface SampleSelectorProps {
  activeSampleId: string | null;
  onSelectSample: (sample: SampleDocument) => void;
  onLoadAiSynthetic: (payload: {
    title: string;
    fileType: 'txt' | 'csv';
    content: string;
    source: 'live' | 'demo-fallback';
  }) => void;
}

const TEMPLATE_OPTIONS: { value: SyntheticTemplateType; label: string }[] = [
  { value: 'support-ticket', label: 'Support Ticket' },
  { value: 'clinical-note', label: 'Clinical Note' },
  { value: 'hr-resume', label: 'HR Resume' },
  { value: 'mixed-csv', label: 'Mixed CSV' },
];

export function SampleSelector({
  activeSampleId,
  onSelectSample,
  onLoadAiSynthetic,
}: SampleSelectorProps) {
  const { isDemoMode, runWithFallback } = useDemoMode();
  const { addToast } = useToast();
  const [aiTemplate, setAiTemplate] = useState<SyntheticTemplateType>('support-ticket');
  const [generating, setGenerating] = useState(false);

  const handleGenerateSynthetic = async () => {
    if (generating) return;
    setGenerating(true);

    const outcome = await runWithFallback(
      (signal) => requestSyntheticSample({ templateType: aiTemplate, demoMode: isDemoMode }, signal),
      () => buildLocalSyntheticSampleFallback(aiTemplate),
      'Synthetic Sample Generator'
    );

    onLoadAiSynthetic({
      title: outcome.data.title,
      fileType: outcome.data.fileType,
      content: outcome.data.content,
      source: outcome.data.source,
    });

    addToast({
      title:
        outcome.data.source === 'live'
          ? 'Generated Synthetic Sample (Gemini 2.5 Flash)'
          : 'Loaded Synthetic Fixture',
      description: '100% fictional test data — no user input was sent to AI.',
      variant: outcome.data.source === 'live' ? 'success' : 'info',
    });

    setGenerating(false);
  };

  return (
    <section
      aria-labelledby="samples-heading"
      className="rounded-2xl border border-white/10 bg-[#111116] p-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 id="samples-heading" className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
            Synthetic Sample Documents
          </h2>
          <p className="mt-0.5 text-xs text-zinc-400">
            Includes valid PII + false-positive traps (invalid cards, versions, timestamps, order IDs)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <label htmlFor="ai-template-select" className="sr-only">
            Synthetic template type for optional Gemini generation
          </label>
          <select
            id="ai-template-select"
            value={aiTemplate}
            onChange={(e) => setAiTemplate(e.target.value as SyntheticTemplateType)}
            className="rounded-lg border border-white/10 bg-[#09090b] px-2.5 py-1.5 text-xs text-zinc-200 focus:border-indigo-500/60 focus:outline-none"
          >
            {TEMPLATE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => void handleGenerateSynthetic()}
            disabled={generating}
            className="inline-flex items-center gap-1.5 rounded-lg border border-violet-500/35 bg-violet-500/15 px-3 py-1.5 text-xs font-medium text-violet-200 transition hover:bg-violet-500/25 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-400 disabled:opacity-50"
          >
            {generating ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Sparkles className="h-3.5 w-3.5" />
            )}
            {generating ? 'Generating...' : 'AI Synthetic Sample'}
          </button>
        </div>
      </div>

      <div className="mt-3 grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
        {SYNTHETIC_SAMPLES.map((sample) => {
          const isSelected = activeSampleId === sample.id;
          return (
            <button
              key={sample.id}
              type="button"
              onClick={() => onSelectSample(sample)}
              className={`group flex flex-col items-start rounded-xl border p-3 text-left transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400 ${
                isSelected
                  ? 'border-indigo-500/50 bg-indigo-500/10'
                  : 'border-white/10 bg-[#09090b] hover:border-white/25 hover:bg-white/[0.03]'
              }`}
            >
              <div className="flex w-full items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-100">
                  {sample.fileType === 'csv' ? (
                    <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-400" />
                  ) : (
                    <FileText className="h-3.5 w-3.5 text-indigo-400" />
                  )}
                  {sample.title}
                </span>
                <span className="rounded-full border border-white/10 bg-white/[0.04] px-1.5 py-0.5 font-mono text-[10px] uppercase text-zinc-400">
                  .{sample.fileType}
                </span>
              </div>
              <p className="mt-1.5 line-clamp-2 text-[11px] leading-relaxed text-zinc-400">
                {sample.description}
              </p>
            </button>
          );
        })}
      </div>
    </section>
  );
}
