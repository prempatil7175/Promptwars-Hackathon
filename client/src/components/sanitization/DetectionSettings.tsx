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
      className="rounded-2xl border border-[#AFB4CE] bg-white p-4 shadow-[0_8px_24px_-10px_rgba(18,20,31,0.10)] dark:border-[#383E5C] dark:bg-[#1B1F30] dark:shadow-[0_12px_32px_-12px_rgba(0,0,0,0.55)]"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-[#4F5580] dark:text-[#AFB4CE]" />
          <h3 id="detection-config-heading" className="text-xs font-bold uppercase tracking-wider text-[#12141F] dark:text-white">
            Detection Rules ({enabledCount}/{ALL_PII_CATEGORIES.length})
          </h3>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-medium">
          <button
            type="button"
            onClick={() => toggleAll(true)}
            className="text-[#4F5580] hover:text-[#12141F] dark:text-[#AFB4CE] dark:hover:text-white"
          >
            Enable all
          </button>
          <span className="text-[#AFB4CE] dark:text-[#7B81A8]">•</span>
          <button
            type="button"
            onClick={() => toggleAll(false)}
            className="text-[#4F5580] hover:text-[#12141F] dark:text-[#AFB4CE] dark:hover:text-white"
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
                  ? 'border-[#4F5580] bg-[#E4E6F0]/75 text-[#12141F] dark:border-[#7B81A8] dark:bg-[#232739] dark:text-white'
                  : 'border-[#AFB4CE] bg-[#E4E6F0]/25 text-[#4F5580] hover:border-[#4F5580]/60 dark:border-[#383E5C] dark:bg-[#12141F]/65 dark:text-[#AFB4CE] dark:hover:border-[#5B6396]'
              }`}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggleCategory(category)}
                className="h-3.5 w-3.5 rounded border-[#AFB4CE] bg-white accent-[#4F5580] dark:border-[#383E5C] dark:bg-[#12141F] dark:accent-[#5B6396]"
              />
              <span className="truncate">{CATEGORY_LABELS[category]}</span>
            </label>
          );
        })}
      </div>

      {/* Explicit Aadhaar Verhoeff setting */}
      <div className="mt-3 rounded-xl border border-[#AFB4CE] bg-[#E4E6F0]/35 p-3 dark:border-[#383E5C] dark:bg-[#12141F]/65">
        <label className="flex cursor-pointer items-start gap-2.5">
          <input
            type="checkbox"
            checked={config.requireAadhaarChecksum}
            onChange={(e) =>
              onChange({ ...config, requireAadhaarChecksum: e.target.checked })
            }
            className="mt-0.5 h-3.5 w-3.5 rounded border-[#AFB4CE] bg-white accent-[#12141F] dark:border-[#383E5C] dark:bg-[#12141F] dark:accent-[#5B6396]"
          />
          <div className="min-w-0 flex-1">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#12141F] dark:text-white">
              <ShieldCheck className="h-3.5 w-3.5 text-[#4F5580] dark:text-[#AFB4CE]" />
              Enforce Aadhaar Verhoeff Checksum
            </span>
            <p className="mt-0.5 text-[11px] leading-relaxed text-[#4F5580] dark:text-[#AFB4CE]">
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
