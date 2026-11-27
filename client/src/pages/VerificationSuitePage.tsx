import { useMemo, useState } from 'react';
import { CheckCircle2, Clock, Play, ShieldCheck, XCircle } from 'lucide-react';
import { runVerificationSuite, type VerificationSuiteSummary } from '../engine/testVectors';

export function VerificationSuitePage() {
  const [summary, setSummary] = useState<VerificationSuiteSummary>(() =>
    runVerificationSuite()
  );
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const categories = useMemo(() => {
    const unique = Array.from(new Set(summary.results.map((r) => r.category)));
    return ['ALL', ...unique];
  }, [summary]);

  const filteredResults = useMemo(() => {
    if (selectedCategory === 'ALL') return summary.results;
    return summary.results.filter((r) => r.category === selectedCategory);
  }, [summary, selectedCategory]);

  const handleRerun = () => {
    setSummary(runVerificationSuite());
  };

  return (
    <div className="space-y-6">
      {/* Midnight Navy -> Dark Slate Header & Summary */}
      <section className="rounded-3xl border border-[#383E5C] bg-gradient-to-r from-[#12141F] to-[#232739] p-6 shadow-[0_12px_32px_-12px_rgba(18,20,31,0.32)] dark:border-[#5B6396]/65 dark:bg-gradient-to-br dark:from-[#232739] dark:via-[#2B314E] dark:to-[#1E2336] dark:shadow-[0_16px_40px_-12px_rgba(0,0,0,0.65)]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-[#7B81A8]/60 bg-[#383E5C]/70 px-3 py-0.5 text-[11px] font-semibold text-[#E4E6F0]">
              <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-[#E4E6F0]" aria-hidden="true" />
              Live Engine Self-Test (Shared with Vitest Vectors)
            </div>
            <h2 className="mt-2 text-base font-bold leading-snug tracking-[-0.01em] text-white">
              PII Detection, Sanitization &amp; Privacy Boundary Verification Suite
            </h2>
            <p className="mt-0.5 text-xs leading-relaxed text-[#CBD0E6]">
              Executes the actual production validators, overlap resolver, CSV parser, redactors, and audit privacy checks live in your browser.
            </p>
          </div>

          <button
            type="button"
            onClick={handleRerun}
            className="inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-[#4F46E5] px-5 py-2.5 text-xs font-semibold text-white shadow-[0_8px_20px_-6px_rgba(79,70,229,0.55)] transition hover:bg-[#4338CA] active:scale-[0.98] active:bg-[#3730A3] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A5B4FC] focus-visible:ring-offset-2 focus-visible:ring-offset-[#12141F]"
          >
            <Play className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            Re-run Verification Suite
          </button>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-[#AFB4CE] bg-white p-3.5 dark:border-[#383E5C] dark:bg-[#1B1F30]">
            <p className="text-xs font-medium text-[#4F5580] dark:text-[#AFB4CE]">Total Test Vectors</p>
            <p className="mt-1.5 font-mono text-2xl font-bold text-[#12141F] dark:text-white">
              {summary.total}
            </p>
          </div>
          <div className="rounded-2xl border border-emerald-400 bg-emerald-50 p-3.5 dark:border-emerald-500/40 dark:bg-emerald-950/45">
            <p className="text-xs font-medium text-emerald-800 dark:text-emerald-300">Passed</p>
            <p className="mt-1.5 font-mono text-2xl font-bold text-emerald-800 dark:text-emerald-200">
              {summary.passed}
            </p>
          </div>
          <div className="rounded-2xl border border-[#AFB4CE] bg-white p-3.5 dark:border-[#383E5C] dark:bg-[#1B1F30]">
            <p className="text-xs font-medium text-[#4F5580] dark:text-[#AFB4CE]">Failed</p>
            <p
              className={`mt-1.5 font-mono text-2xl font-bold ${
                summary.failed > 0
                  ? 'text-rose-700 dark:text-rose-300'
                  : 'text-[#12141F] dark:text-white'
              }`}
            >
              {summary.failed}
            </p>
          </div>
          <div className="rounded-2xl border border-[#AFB4CE] bg-white p-3.5 dark:border-[#383E5C] dark:bg-[#1B1F30]">
            <p className="text-xs font-medium text-[#4F5580] dark:text-[#AFB4CE]">Execution Duration</p>
            <p className="mt-1.5 inline-flex items-center gap-1.5 font-mono text-2xl font-bold text-[#12141F] dark:text-white">
              <Clock className="h-4 w-4 text-[#4F5580] dark:text-[#AFB4CE]" aria-hidden="true" />
              {summary.totalDurationMs.toFixed(2)} ms
            </p>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            className={`whitespace-nowrap rounded-full border px-3.5 py-1.5 text-xs font-medium transition ${
              selectedCategory === cat
                ? 'border-[#4F46E5] bg-[#4F46E5] font-semibold text-white shadow-xs'
                : 'border-[#AFB4CE] bg-white text-[#4F5580] hover:border-[#4F5580] hover:text-[#12141F] dark:border-[#383E5C] dark:bg-[#1B1F30] dark:text-[#AFB4CE] dark:hover:border-[#7B81A8] dark:hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Individual Results */}
      <section className="space-y-2.5">
        {filteredResults.map((item) => (
          <div
            key={item.id}
            className={`rounded-2xl border p-4 shadow-[0_8px_24px_-10px_rgba(18,20,31,0.10)] dark:shadow-[0_10px_28px_-10px_rgba(0,0,0,0.45)] ${
              item.passed
                ? 'border-[#AFB4CE] bg-white dark:border-[#383E5C] dark:bg-[#1B1F30]'
                : 'border-rose-300 bg-rose-50 dark:border-rose-500/40 dark:bg-rose-950/45'
            }`}
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="flex items-start gap-2.5">
                {item.passed ? (
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700 dark:text-emerald-400" aria-hidden="true" />
                ) : (
                  <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-700 dark:text-rose-400" aria-hidden="true" />
                )}
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-md border border-[#AFB4CE] bg-[#E4E6F0] px-2 py-0.5 font-mono text-[10px] font-semibold text-[#12141F] dark:border-[#383E5C] dark:bg-[#232739] dark:text-[#E4E6F0]">
                      {item.category}
                    </span>
                    <h3 className="text-xs font-semibold text-[#12141F] dark:text-white">{item.name}</h3>
                  </div>
                  <p className="mt-1 text-xs leading-normal text-[#4F5580] dark:text-[#AFB4CE]">{item.description}</p>
                  <p
                    className={`mt-1.5 inline-block rounded-md border px-2 py-0.5 font-mono text-[11px] font-medium ${
                      item.passed
                        ? 'border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-500/35 dark:bg-emerald-500/15 dark:text-emerald-200'
                        : 'border-rose-300 bg-white text-rose-800 dark:border-rose-500/40 dark:bg-rose-950 dark:text-rose-200'
                    }`}
                  >
                    {item.passed ? 'PASS: ' : 'FAIL: '}
                    {item.detail}
                  </p>
                </div>
              </div>

              <span className="font-mono text-[11px] font-medium text-[#4F5580] dark:text-[#AFB4CE]">
                {item.durationMs.toFixed(2)} ms
              </span>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
