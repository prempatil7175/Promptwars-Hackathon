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
      className="rounded-2xl border border-[#D8DCE8] bg-white p-4 shadow-[0_6px_20px_-8px_rgba(19,20,32,0.08)] dark:border-[#2E314A] dark:bg-[#1B1D2E] dark:shadow-[0_10px_28px_-10px_rgba(0,0,0,0.45)]"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-[#5A45F5] dark:text-[#A5B4FC]" />
          <h3 id="detection-config-heading" className="text-xs font-bold uppercase tracking-wider text-[#131420] dark:text-white">
            Detection Rules ({enabledCount}/{ALL_PII_CATEGORIES.length})
          </h3>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-medium">
          <button
            type="button"
            onClick={() => toggleAll(true)}
            className="text-[#5A45F5] hover:text-[#4A35E0] dark:text-[#A5B4FC] dark:hover:text-white"
          >
            Enable all
          </button>
          <span className="text-[#D8DCE8] dark:text-[#5E6478]">•</span>
          <button
            type="button"
            onClick={() => toggleAll(false)}
            className="text-[#5E6478] hover:text-[#131420] dark:text-[#B0B5C9] dark:hover:text-white"
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
              className={`flex cursor-pointer items-center gap-2 rounded-xl border px-2.5 py-2 text-xs font-medium transition ${
                checked
                  ? 'border-[#5A45F5] bg-[#EEF0F7] text-[#131420] dark:border-[#5A45F5] dark:bg-[#23263B] dark:text-white'
                  : 'border-[#D8DCE8] bg-[#F4F5FA] text-[#5E6478] hover:border-[#5A45F5]/50 dark:border-[#2E314A] dark:bg-[#131420]/65 dark:text-[#B0B5C9] dark:hover:border-[#5A45F5]'
              }`}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggleCategory(category)}
                className="h-3.5 w-3.5 rounded border-[#D8DCE8] bg-white accent-[#5A45F5] dark:border-[#2E314A] dark:bg-[#131420]"
              />
              <span className="truncate">{CATEGORY_LABELS[category]}</span>
            </label>
          );
        })}
      </div>

      {/* Explicit Aadhaar Verhoeff setting */}
      <div className="mt-3 rounded-xl border border-[#D8DCE8] bg-[#F4F5FA] p-3 dark:border-[#2E314A] dark:bg-[#131420]/65">
        <label className="flex cursor-pointer items-start gap-2.5">
          <input
            type="checkbox"
            checked={config.requireAadhaarChecksum}
            onChange={(e) =>
              onChange({ ...config, requireAadhaarChecksum: e.target.checked })
            }
            className="mt-0.5 h-3.5 w-3.5 rounded border-[#D8DCE8] bg-white accent-[#5A45F5] dark:border-[#2E314A] dark:bg-[#131420]"
          />
          <div className="min-w-0 flex-1">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#131420] dark:text-white">
              <ShieldCheck className="h-3.5 w-3.5 text-[#5A45F5] dark:text-[#A5B4FC]" />
              Enforce Aadhaar Verhoeff Checksum
            </span>
            <p className="mt-0.5 text-[11px] leading-relaxed text-[#5E6478] dark:text-[#B0B5C9]">
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
