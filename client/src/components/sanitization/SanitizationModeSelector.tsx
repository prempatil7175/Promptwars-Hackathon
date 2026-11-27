import { EyeOff, KeyRound, Lock } from 'lucide-react';
import type { SanitizationMode } from '../../engine/types';

interface SanitizationModeSelectorProps {
  mode: SanitizationMode;
  onChange: (mode: SanitizationMode) => void;
}

const MODE_OPTIONS: {
  id: SanitizationMode;
  shortLabel: string;
  title: string;
  example: string;
  description: string;
  Icon: React.ComponentType<{ className?: string }>;
}[] = [
  {
    id: 'full',
    shortLabel: 'Full Mask',
    title: 'Full Mask',
    example: '[EMAIL_REDACTED]',
    description: 'Replaces every entity with a strict category placeholder.',
    Icon: Lock,
  },
  {
    id: 'partial',
    shortLabel: 'Partial Mask',
    title: 'Partial Mask',
    example: 'm*****@example.com',
    description: 'Retains minimal trailing/prefix context for support triage.',
    Icon: EyeOff,
  },
  {
    id: 'pseudonymize',
    shortLabel: 'Pseudonymize',
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
      className="rounded-2xl border border-[#D8DCE8] bg-white p-4 shadow-[0_6px_20px_-8px_rgba(19,20,32,0.08)] dark:border-[#2E314A] dark:bg-[#1B1D2E] dark:shadow-[0_10px_28px_-10px_rgba(0,0,0,0.45)]"
    >
      <h3
        id="sanitization-mode-heading"
        className="text-xs font-bold uppercase tracking-wider text-[#131420] dark:text-white"
      >
        Sanitization Mode
      </h3>

      {/* Compact Segmented Pill Control */}
      <div
        role="radiogroup"
        aria-labelledby="sanitization-mode-heading"
        className="mt-3 grid grid-cols-3 gap-1 rounded-full border border-[#D8DCE8] bg-[#EEF0F7] p-1 dark:border-[#2E314A] dark:bg-[#131420]"
      >
        {MODE_OPTIONS.map(({ id, shortLabel }) => {
          const active = mode === id;
          return (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(id)}
              className={`truncate rounded-full px-2.5 py-1.5 text-[11px] font-medium transition ${
                active
                  ? 'bg-[#5A45F5] text-white shadow-sm'
                  : 'text-[#5E6478] hover:text-[#131420] dark:text-[#B0B5C9] dark:hover:text-white'
              }`}
            >
              {shortLabel}
            </button>
          );
        })}
      </div>

      <div className="mt-3 space-y-2">
        {MODE_OPTIONS.map(({ id, title, example, description, Icon }) => {
          const active = mode === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onChange(id)}
              className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5A45F5] ${
                active
                  ? 'border-[#5A45F5] bg-[#EEF0F7] shadow-xs dark:border-[#5A45F5] dark:bg-[#23263B]'
                  : 'border-[#D8DCE8] bg-[#F4F5FA] hover:border-[#5A45F5]/50 hover:bg-white dark:border-[#2E314A] dark:bg-[#131420]/65 dark:hover:border-[#5A45F5] dark:hover:bg-[#23263B]/80'
              }`}
            >
              <div
                className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${
                  active
                    ? 'border-[#5A45F5] bg-[#5A45F5] text-white'
                    : 'border-[#D8DCE8] bg-white text-[#5E6478] dark:border-[#2E314A] dark:bg-[#1B1D2E] dark:text-[#B0B5C9]'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-1.5">
                  <span className="text-xs font-semibold text-[#131420] dark:text-white">{title}</span>
                  <code className="rounded-md border border-[#D8DCE8] bg-white px-1.5 py-0.5 font-mono text-[10px] font-medium text-[#131420] dark:border-[#2E314A] dark:bg-[#131420] dark:text-[#E6E8F0]">
                    {example}
                  </code>
                </div>
                <p className="mt-1 text-[11px] leading-relaxed text-[#5E6478] dark:text-[#B0B5C9]">
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
