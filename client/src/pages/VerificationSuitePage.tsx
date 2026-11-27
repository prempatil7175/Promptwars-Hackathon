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
      {/* Midnight Navy Hero Banner & Summary */}
      <section className="rounded-3xl border border-[#2E314A] bg-gradient-to-r from-[#131420] to-[#1B1D2E] p-6 shadow-[0_12px_32px_-12px_rgba(19,20,32,0.35)] dark:border-[#5A45F5]/40 dark:from-[#1B1D2E] dark:via-[#23263B] dark:to-[#181A2A] dark:shadow-[0_16px_40px_-12px_rgba(0,0,0,0.65)]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-0.5 text-[11px] font-semibold text-white">
              <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-white" aria-hidden="true" />
              Live Engine Self-Test (Shared with Vitest Vectors)
            </div>
            <h2 className="mt-2 text-base font-bold leading-snug tracking-tight text-white">
              PII Detection, Sanitization &amp; Privacy Boundary Verification Suite
            </h2>
            <p className="mt-0.5 text-xs leading-relaxed text-[#B0B5C9]">
              Executes the actual production validators, overlap resolver, CSV parser, redactors, and audit privacy checks live in your browser.
            </p>
          </div>

          <button
            type="button"
            onClick={handleRerun}
            className="inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-[#5A45F5] px-5 py-2.5 text-xs font-medium text-white shadow-[0_8px_20px_-6px_rgba(90,69,245,0.45)] transition hover:bg-[#4A35E0] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A5B4FC] focus-visible:ring-offset-2 focus-visible:ring-offset-[#131420]"
          >
            <Play className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            Re-run Verification Suite
          </button>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-[#D8DCE8] bg-white p-3.5 dark:border-[#2E314A] dark:bg-[#131420]/70">
            <p className="text-xs font-medium text-[#5E6478] dark:text-[#B0B5C9]">Total Test Vectors</p>
            <p className="mt-1.5 font-mono text-2xl font-bold text-[#131420] dark:text-white">
              {summary.total}
            </p>
          </div>
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3.5 dark:border-emerald-500/35 dark:bg-emerald-500/15">
            <p className="text-xs font-medium text-emerald-700 dark:text-emerald-300">Passed</p>
            <p className="mt-1.5 font-mono text-2xl font-bold text-emerald-700 dark:text-emerald-200">
              {summary.passed}
            </p>
          </div>
          <div className="rounded-2xl border border-[#D8DCE8] bg-white p-3.5 dark:border-[#2E314A] dark:bg-[#131420]/70">
            <p className="text-xs font-medium text-[#5E6478] dark:text-[#B0B5C9]">Failed</p>
            <p
              className={`mt-1.5 font-mono text-2xl font-bold ${
                summary.failed > 0
                  ? 'text-rose-700 dark:text-rose-300'
                  : 'text-[#131420] dark:text-white'
              }`}
            >
              {summary.failed}
            </p>
          </div>
          <div className="rounded-2xl border border-[#D8DCE8] bg-white p-3.5 dark:border-[#2E314A] dark:bg-[#131420]/70">
            <p className="text-xs font-medium text-[#5E6478] dark:text-[#B0B5C9]">Execution Duration</p>
            <p className="mt-1.5 inline-flex items-center gap-1.5 font-mono text-2xl font-bold text-[#131420] dark:text-white">
              <Clock className="h-4 w-4 text-[#5E6478] dark:text-[#B0B5C9]" aria-hidden="true" />
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
                ? 'border-[#5A45F5] bg-[#5A45F5] font-semibold text-white shadow-[0_8px_20px_-6px_rgba(90,69,245,0.45)]'
                : 'border-[#D8DCE8] bg-white text-[#5E6478] hover:bg-[#F4F5FA] hover:text-[#131420] dark:border-[#2E314A] dark:bg-[#1B1D2E] dark:text-[#B0B5C9] dark:hover:border-[#5A45F5] dark:hover:text-white'
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
            className={`rounded-2xl border p-4 shadow-[0_6px_20px_-8px_rgba(19,20,32,0.08)] dark:shadow-[0_10px_28px_-10px_rgba(0,0,0,0.45)] ${
              item.passed
                ? 'border-[#D8DCE8] bg-white dark:border-[#2E314A] dark:bg-[#1B1D2E]'
                : 'border-rose-200 bg-rose-50 dark:border-rose-500/40 dark:bg-rose-950/45'
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
                    <span className="rounded-md border border-[#D8DCE8] bg-[#EEF0F7] px-2 py-0.5 font-mono text-[10px] font-semibold text-[#3B3E59] dark:border-[#2E314A] dark:bg-[#23263B] dark:text-[#E6E8F0]">
                      {item.category}
                    </span>
                    <h3 className="text-xs font-semibold text-[#131420] dark:text-white">{item.name}</h3>
                  </div>
                  <p className="mt-1 text-xs leading-normal text-[#5E6478] dark:text-[#B0B5C9]">{item.description}</p>
                  <p
                    className={`mt-1.5 inline-block rounded-md border px-2 py-0.5 font-mono text-[11px] font-medium ${
                      item.passed
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/35 dark:bg-emerald-500/15 dark:text-emerald-200'
                        : 'border-rose-200 bg-white text-rose-700 dark:border-rose-500/40 dark:bg-rose-950 dark:text-rose-200'
                    }`}
                  >
                    {item.passed ? 'PASS: ' : 'FAIL: '}
                    {item.detail}
                  </p>
                </div>
              </div>

              <span className="font-mono text-[11px] font-medium text-[#5E6478] dark:text-[#B0B5C9]">
                {item.durationMs.toFixed(2)} ms
              </span>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
