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
      className="rounded-2xl border border-[#AFB4CE] bg-white p-4 shadow-[0_8px_24px_-10px_rgba(18,20,31,0.10)] dark:border-[#383E5C] dark:bg-[#1B1F30] dark:shadow-[0_12px_32px_-12px_rgba(0,0,0,0.55)]"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 id="samples-heading" className="text-xs font-bold uppercase tracking-wider text-[#12141F] dark:text-white">
            Synthetic Sample Documents
          </h2>
          <p className="mt-0.5 text-xs text-[#4F5580] dark:text-[#AFB4CE]">
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
            className="rounded-xl border border-[#AFB4CE] bg-[#E4E6F0]/40 px-3 py-1.5 text-xs font-medium text-[#12141F] focus:border-[#4F5580] focus:outline-none dark:border-[#383E5C] dark:bg-[#12141F] dark:text-[#E4E6F0] dark:focus:border-[#7B81A8]"
          >
            {TEMPLATE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-white text-[#12141F] dark:bg-[#12141F] dark:text-[#E4E6F0]">
                {opt.label}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => void handleGenerateSynthetic()}
            disabled={generating}
            className="inline-flex items-center gap-1.5 rounded-full bg-[#4F5580] px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-[#383E5C] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4F5580] disabled:opacity-50 dark:bg-[#5B6396] dark:hover:bg-[#4F5580]"
          >
            {generating ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Sparkles className="h-3.5 w-3.5 text-[#E4E6F0]" />
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
              className={`group flex flex-col items-start rounded-xl border p-3 text-left transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4F5580] ${
                isSelected
                  ? 'border-[#4F5580] bg-[#E4E6F0]/75 shadow-xs dark:border-[#7B81A8] dark:bg-[#232739]'
                  : 'border-[#AFB4CE] bg-[#E4E6F0]/30 hover:border-[#4F5580] hover:bg-white dark:border-[#383E5C] dark:bg-[#12141F]/65 dark:hover:border-[#5B6396] dark:hover:bg-[#232739]/80'
              }`}
            >
              <div className="flex w-full items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#12141F] dark:text-white">
                  {sample.fileType === 'csv' ? (
                    <FileSpreadsheet className="h-3.5 w-3.5 text-[#4F5580] dark:text-[#AFB4CE]" />
                  ) : (
                    <FileText className="h-3.5 w-3.5 text-[#4F5580] dark:text-[#AFB4CE]" />
                  )}
                  {sample.title}
                </span>
                <span className="rounded-full border border-[#AFB4CE] bg-white px-2 py-0.5 font-mono text-[10px] uppercase text-[#12141F] dark:border-[#383E5C] dark:bg-[#1B1F30] dark:text-[#E4E6F0]">
                  .{sample.fileType}
                </span>
              </div>
              <p className="mt-1.5 line-clamp-2 text-[11px] leading-relaxed text-[#4F5580] dark:text-[#AFB4CE]">
                {sample.description}
              </p>
            </button>
          );
        })}
      </div>
    </section>
  );
}
