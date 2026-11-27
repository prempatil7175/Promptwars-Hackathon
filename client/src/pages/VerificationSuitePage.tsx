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
      {/* Header & Summary */}
      <section className="rounded-2xl border border-white/10 bg-[#111116] p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-0.5 text-[11px] font-medium text-indigo-300">
              <ShieldCheck className="h-3.5 w-3.5" />
              Live Engine Self-Test (Shared with Vitest Vectors)
            </div>
            <h2 className="mt-2 text-base font-semibold text-zinc-100">
              PII Detection, Sanitization &amp; Privacy Boundary Verification Suite
            </h2>
            <p className="mt-0.5 text-xs text-zinc-400">
              Executes the actual production validators, overlap resolver, CSV parser, redactors, and audit privacy checks live in your browser.
            </p>
          </div>

          <button
            type="button"
            onClick={handleRerun}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-400"
          >
            <Play className="h-3.5 w-3.5" />
            Re-run Verification Suite
          </button>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-white/10 bg-[#09090b] p-3.5">
            <p className="text-xs text-zinc-400">Total Test Vectors</p>
            <p className="mt-1.5 font-mono text-2xl font-bold text-zinc-100">
              {summary.total}
            </p>
          </div>
          <div className="rounded-xl border border-emerald-500/25 bg-[#09090b] p-3.5">
            <p className="text-xs text-zinc-400">Passed</p>
            <p className="mt-1.5 font-mono text-2xl font-bold text-emerald-400">
              {summary.passed}
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-[#09090b] p-3.5">
            <p className="text-xs text-zinc-400">Failed</p>
            <p
              className={`mt-1.5 font-mono text-2xl font-bold ${
                summary.failed > 0 ? 'text-rose-400' : 'text-zinc-300'
              }`}
            >
              {summary.failed}
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-[#09090b] p-3.5">
            <p className="text-xs text-zinc-400">Execution Duration</p>
            <p className="mt-1.5 inline-flex items-center gap-1.5 font-mono text-2xl font-bold text-zinc-100">
              <Clock className="h-4 w-4 text-indigo-400" />
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
            className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
              selectedCategory === cat
                ? 'border-indigo-500/50 bg-indigo-500/15 text-indigo-200'
                : 'border-white/10 bg-[#111116] text-zinc-400 hover:border-white/25 hover:text-zinc-200'
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
            className={`rounded-xl border p-4 ${
              item.passed
                ? 'border-white/10 bg-[#111116]'
                : 'border-rose-500/40 bg-rose-500/10'
            }`}
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="flex items-start gap-2.5">
                {item.passed ? (
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                ) : (
                  <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />
                )}
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded border border-white/10 bg-white/[0.04] px-1.5 py-0.5 font-mono text-[10px] text-zinc-300">
                      {item.category}
                    </span>
                    <h3 className="text-xs font-semibold text-zinc-100">{item.name}</h3>
                  </div>
                  <p className="mt-1 text-xs text-zinc-400">{item.description}</p>
                  <p
                    className={`mt-1.5 font-mono text-[11px] ${
                      item.passed ? 'text-emerald-300' : 'text-rose-200'
                    }`}
                  >
                    {item.passed ? 'PASS: ' : 'FAIL: '}
                    {item.detail}
                  </p>
                </div>
              </div>

              <span className="font-mono text-[11px] text-zinc-400">
                {item.durationMs.toFixed(2)} ms
              </span>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
