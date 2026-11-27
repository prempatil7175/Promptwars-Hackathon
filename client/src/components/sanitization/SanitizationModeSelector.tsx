import { EyeOff, KeyRound, Lock } from 'lucide-react';
import type { SanitizationMode } from '../../engine/types';

interface SanitizationModeSelectorProps {
  mode: SanitizationMode;
  onChange: (mode: SanitizationMode) => void;
}

const MODE_OPTIONS: {
  id: SanitizationMode;
  title: string;
  example: string;
  description: string;
  Icon: React.ComponentType<{ className?: string }>;
}[] = [
    {
      id: 'full',
      title: 'Full Mask',
      example: '[EMAIL_REDACTED]',
      description: 'Replaces every entity with a strict category placeholder.',
      Icon: Lock,
    },
    {
      id: 'partial',
      title: 'Partial Mask',
      example: 'm*****@example.com',
      description: 'Retains minimal trailing/prefix context for support triage.',
      Icon: EyeOff,
    },
    {
      id: 'pseudonymize',
      title: 'Consistent Pseudonym',
      example: 'person_001@example.invalid',
      description: 'Deterministic session tokens; mappings never persist or export.',
      Icon: KeyRound,
    },
  ];

export function SanitizationModeSelector({
  mode,
  onChange,
}: SanitizationModeSelectorProps) {
  return (
    <section
      aria-labelledby="sanitization-mode-heading"
      className="rounded-2xl border border-[#AFB4CE] bg-white p-4 shadow-[0_8px_24px_-10px_rgba(18,20,31,0.10)] dark:border-[#383E5C] dark:bg-[#1B1F30] dark:shadow-[0_12px_32px_-12px_rgba(0,0,0,0.55)]"
    >
      <h3
        id="sanitization-mode-heading"
        className="text-xs font-bold uppercase tracking-wider text-[#12141F] dark:text-white"
      >
        Sanitization Mode
      </h3>

      <div className="mt-3 space-y-2" role="radiogroup" aria-labelledby="sanitization-mode-heading">
        {MODE_OPTIONS.map(({ id, title, example, description, Icon }) => {
          const active = mode === id;
          return (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(id)}
              className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4F5580] ${active
                ? 'border-[#4F5580] bg-[#E4E6F0]/75 shadow-xs dark:border-[#7B81A8] dark:bg-[#232739]'
                : 'border-[#AFB4CE] bg-[#E4E6F0]/25 hover:border-[#4F5580]/60 hover:bg-white dark:border-[#383E5C] dark:bg-[#12141F]/65 dark:hover:border-[#5B6396] dark:hover:bg-[#232739]/80'
                }`}
            >
              <div
                className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border ${active
                  ? 'border-[#4F5580] bg-[#4F5580] text-white dark:border-[#5B6396] dark:bg-[#5B6396]'
                  : 'border-[#AFB4CE] bg-white text-[#4F5580] dark:border-[#383E5C] dark:bg-[#1B1F30] dark:text-[#AFB4CE]'
                  }`}
              >
                <Icon className="h-3.5 w-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-1.5">
                  <span className="text-xs font-semibold text-[#12141F] dark:text-white">{title}</span>
                  <code className="rounded-md border border-[#AFB4CE] bg-white px-1.5 py-0.5 font-mono text-[10px] font-medium text-[#12141F] dark:border-[#383E5C] dark:bg-[#12141F] dark:text-[#E4E6F0]">
                    {example}
                  </code>
                </div>
                <p className="mt-1 text-[11px] leading-relaxed text-[#4F5580] dark:text-[#AFB4CE]">
                  {description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
