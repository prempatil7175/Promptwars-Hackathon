import { ShieldCheck, SlidersHorizontal } from 'lucide-react';
import {
  ALL_PII_CATEGORIES,
  CATEGORY_LABELS,
  type DetectionConfig,
  type PiiCategory,
} from '../../engine/types';

interface DetectionSettingsProps {
  config: DetectionConfig;
  onChange: (next: DetectionConfig) => void;
}

export function DetectionSettings({ config, onChange }: DetectionSettingsProps) {
  const toggleCategory = (category: PiiCategory) => {
    onChange({
      ...config,
      enabledCategories: {
        ...config.enabledCategories,
        [category]: !config.enabledCategories[category],
      },
    });
  };

  const toggleAll = (enabled: boolean) => {
    const next = { ...config.enabledCategories };
    for (const cat of ALL_PII_CATEGORIES) {
      next[cat] = enabled;
    }
    onChange({ ...config, enabledCategories: next });
  };

  const enabledCount = ALL_PII_CATEGORIES.filter(
    (c) => config.enabledCategories[c]
  ).length;

  return (
    <section
      aria-labelledby="detection-config-heading"
      className="rounded-2xl border border-white/10 bg-[#111116] p-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-indigo-400" />
          <h3 id="detection-config-heading" className="text-xs font-semibold uppercase tracking-wider text-zinc-200">
            Detection Rules ({enabledCount}/{ALL_PII_CATEGORIES.length})
          </h3>
        </div>
        <div className="flex items-center gap-2 text-[11px]">
          <button
            type="button"
            onClick={() => toggleAll(true)}
            className="text-indigo-400 hover:text-indigo-300"
          >
            Enable all
          </button>
          <span className="text-zinc-600">•</span>
          <button
            type="button"
            onClick={() => toggleAll(false)}
            className="text-zinc-400 hover:text-zinc-200"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        {ALL_PII_CATEGORIES.map((category) => {
          const checked = config.enabledCategories[category];
          return (
            <label
              key={category}
              className={`flex cursor-pointer items-center gap-2 rounded-lg border px-2.5 py-2 text-xs transition ${
                checked
                  ? 'border-indigo-500/35 bg-indigo-500/10 text-zinc-100'
                  : 'border-white/10 bg-[#09090b] text-zinc-400 hover:border-white/20'
              }`}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggleCategory(category)}
                className="h-3.5 w-3.5 rounded border-white/20 bg-zinc-950 accent-indigo-500"
              />
              <span className="truncate">{CATEGORY_LABELS[category]}</span>
            </label>
          );
        })}
      </div>

      {/* Explicit Aadhaar Verhoeff setting */}
      <div className="mt-3 rounded-xl border border-white/10 bg-[#09090b] p-3">
        <label className="flex cursor-pointer items-start gap-2.5">
          <input
            type="checkbox"
            checked={config.requireAadhaarChecksum}
            onChange={(e) =>
              onChange({ ...config, requireAadhaarChecksum: e.target.checked })
            }
            className="mt-0.5 h-3.5 w-3.5 rounded border-white/20 bg-zinc-950 accent-emerald-500"
          />
          <div className="min-w-0 flex-1">
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-200">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              Enforce Aadhaar Verhoeff Checksum
            </span>
            <p className="mt-0.5 text-[11px] leading-relaxed text-zinc-400">
              {config.requireAadhaarChecksum
                ? 'Checksum-validated mode: rejects invalid 12-digit numbers. Structural validation only — never verifies real issuance.'
                : 'Format-only mode: flags any 12-digit Aadhaar-shaped pattern without Verhoeff rejection.'}
            </p>
          </div>
        </label>
      </div>
    </section>
  );
}
