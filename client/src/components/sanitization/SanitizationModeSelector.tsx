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
      className="rounded-2xl border border-white/10 bg-[#111116] p-4"
    >
      <h3
        id="sanitization-mode-heading"
        className="text-xs font-semibold uppercase tracking-wider text-zinc-200"
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
              className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400 ${
                active
                  ? 'border-indigo-500/50 bg-indigo-500/12'
                  : 'border-white/10 bg-[#09090b] hover:border-white/25'
              }`}
            >
              <div
                className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border ${
                  active
                    ? 'border-indigo-400/40 bg-indigo-500/20 text-indigo-300'
                    : 'border-white/10 bg-white/[0.03] text-zinc-400'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-1.5">
                  <span className="text-xs font-semibold text-zinc-100">{title}</span>
                  <code className="rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-[10px] text-emerald-300">
                    {example}
                  </code>
                </div>
                <p className="mt-1 text-[11px] leading-relaxed text-zinc-400">
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
