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
      className="rounded-2xl border border-[#D8DCE8] bg-white p-4 shadow-[0_6px_20px_-8px_rgba(19,20,32,0.08)] dark:border-[#2E314A] dark:bg-[#1B1D2E] dark:shadow-[0_10px_28px_-10px_rgba(0,0,0,0.45)]"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 id="samples-heading" className="text-xs font-bold uppercase tracking-wider text-[#131420] dark:text-white">
            Synthetic Sample Documents
          </h2>
          <p className="mt-0.5 text-xs text-[#5E6478] dark:text-[#B0B5C9]">
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
            className="rounded-xl border border-[#D8DCE8] bg-[#F4F5FA] px-3 py-1.5 text-xs font-medium text-[#131420] focus:border-[#5A45F5] focus:ring-2 focus:ring-[#5A45F5]/20 focus:outline-none dark:border-[#2E314A] dark:bg-[#131420] dark:text-[#E6E8F0]"
          >
            {TEMPLATE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-white text-[#131420] dark:bg-[#131420] dark:text-[#E6E8F0]">
                {opt.label}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => void handleGenerateSynthetic()}
            disabled={generating}
            className="inline-flex items-center gap-1.5 rounded-full bg-[#5A45F5] px-4 py-1.5 text-xs font-medium text-white shadow-[0_8px_20px_-6px_rgba(90,69,245,0.45)] transition hover:bg-[#4A35E0] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5A45F5] disabled:opacity-50"
          >
            {generating ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Sparkles className="h-3.5 w-3.5 text-white" />
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
              className={`group flex flex-col items-start rounded-xl border p-3 text-left transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5A45F5] ${
                isSelected
                  ? 'border-[#5A45F5] bg-[#EEF0F7] shadow-xs dark:border-[#5A45F5] dark:bg-[#23263B]'
                  : 'border-[#D8DCE8] bg-[#F4F5FA] hover:border-[#5A45F5]/60 hover:bg-white dark:border-[#2E314A] dark:bg-[#131420]/65 dark:hover:border-[#5A45F5] dark:hover:bg-[#23263B]/80'
              }`}
            >
              <div className="flex w-full items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#131420] dark:text-white">
                  {sample.fileType === 'csv' ? (
                    <FileSpreadsheet className="h-3.5 w-3.5 text-[#5A45F5] dark:text-[#A5B4FC]" />
                  ) : (
                    <FileText className="h-3.5 w-3.5 text-[#5A45F5] dark:text-[#A5B4FC]" />
                  )}
                  {sample.title}
                </span>
                <span className="rounded-full border border-[#D8DCE8] bg-[#EEF0F7] px-2 py-0.5 font-mono text-[10px] uppercase text-[#3B3E59] dark:border-[#2E314A] dark:bg-[#1B1D2E] dark:text-[#E6E8F0]">
                  .{sample.fileType}
                </span>
              </div>
              <p className="mt-1.5 line-clamp-2 text-[11px] leading-relaxed text-[#5E6478] dark:text-[#B0B5C9]">
                {sample.description}
              </p>
            </button>
          );
        })}
      </div>
    </section>
  );
}
