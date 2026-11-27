import { motion, useReducedMotion } from 'framer-motion';
import {
  Check,
  CloudOff,
  EyeOff,
  Fingerprint,
  Lock,
  ShieldAlert,
  ShieldCheck,
  Zap,
} from 'lucide-react';

const CARD_BASE =
  'rounded-2xl border border-[#D8DCE8] bg-white p-6 shadow-[0_6px_20px_-8px_rgba(19,20,32,0.08)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_32px_-10px_rgba(19,20,32,0.12)] sm:p-7';

const GRAPHIC_WELL =
  'mt-5 overflow-hidden rounded-2xl border border-[#D8DCE8] bg-[#F4F5FA] shadow-[inset_0_1px_2px_rgba(19,20,32,0.03)]';

const VIEWPORT = { once: true, margin: '0px 0px -60px 0px' } as const;
const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number];

/** Returns animate props for a card, shifted by `delay` seconds */
function cardAnim(delay: number, reduced: boolean) {
  if (reduced) {
    return {
      initial: { opacity: 0 },
      whileInView: { opacity: 1 },
      viewport: VIEWPORT,
      transition: { duration: 0.3, delay },
    };
  }
  return {
    initial: { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: VIEWPORT,
    transition: { duration: 0.5, ease: EASE, delay },
  };
}

/** Returns animate props for a whole row */
function rowAnim(reduced: boolean) {
  if (reduced) {
    return {
      initial: { opacity: 0 },
      whileInView: { opacity: 1 },
      viewport: VIEWPORT,
      transition: { duration: 0.3 },
    };
  }
  return {
    initial: { opacity: 0, y: 32 },
    whileInView: { opacity: 1, y: 0 },
    viewport: VIEWPORT,
    transition: { duration: 0.55, ease: EASE },
  };
}

export function BentoShowcase() {
  const prefersReducedMotion = useReducedMotion() ?? false;

  return (
    <section
      aria-label="Core privacy capabilities"
      className="relative z-20 mx-auto -mt-8 max-w-5xl space-y-5 px-6 pb-20 sm:-mt-12"
    >
      {/* ── Row 1: Asymmetric 2-Column (8 / 4) ───────────────────────────── */}
      <motion.div className="grid grid-cols-1 gap-5 md:grid-cols-12" {...rowAnim(prefersReducedMotion)}>
        {/* Card 1: Wide Centered Statement */}
        <motion.article
          className={`${CARD_BASE} flex min-h-[264px] flex-col items-center justify-center text-center md:col-span-8`}
          {...cardAnim(0, prefersReducedMotion)}
        >
          <h2 className="text-3xl font-bold leading-[1.12] tracking-tight text-[#131420] sm:text-4xl">
            <span className="inline-flex flex-wrap items-center justify-center gap-2.5">
              <span>PII Leaks</span>
              <span
                aria-hidden="true"
                className="inline-flex h-9 w-12 items-center justify-center rounded-xl border border-[#D8DCE8] bg-[#EEF0F7] text-[#131420] shadow-xs"
              >
                <span className="font-mono text-sm font-bold tracking-widest text-[#5A45F5]">
                  •••
                </span>
              </span>
              <span>Suck</span>
            </span>
            <br />
            <span className="mt-1 inline-flex flex-wrap items-center justify-center gap-2.5">
              <span>We Fix</span>
              <span
                aria-hidden="true"
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[#D8DCE8] bg-[#EEF0F7] text-[#131420] shadow-xs"
              >
                <Zap className="h-4 w-4 text-[#5A45F5]" />
              </span>
              <span>That</span>
            </span>
          </h2>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-[#5E6478]">
            Stop accidental leaks of emails, phone numbers, Aadhaar, PAN, and payment cards before pasting logs, CSVs, or tickets into external tools.
          </p>
        </motion.article>

        {/* Card 2: Narrow Zero Server Egress */}
        <motion.article
          className={`${CARD_BASE} flex flex-col justify-between md:col-span-4`}
          {...cardAnim(0.1, prefersReducedMotion)}
        >
          <div>
            <h3 className="text-base font-bold leading-snug tracking-tight text-[#131420]">
              Zero Server Egress
            </h3>
            <p className="mt-1.5 text-xs leading-relaxed text-[#5E6478]">
              100% client-side execution — raw documents never leave browser memory.
            </p>
          </div>

          <div className={`${GRAPHIC_WELL} relative flex h-40 items-center justify-center`}>
            <div className="absolute h-44 w-44 rounded-full border border-[#5A45F5]/14" />
            <div className="absolute h-32 w-32 rounded-full border border-[#5A45F5]/22" />
            <div className="absolute h-20 w-20 rounded-full border border-[#5A45F5]/30 bg-[#5A45F5]/[0.05]" />
            <div className="relative flex h-14 w-14 items-center justify-center rounded-full border border-[#D8DCE8] bg-white shadow-[0_12px_28px_-6px_rgba(90,69,245,0.32)]">
              <CloudOff className="h-6 w-6 text-[#5A45F5]" aria-hidden="true" />
            </div>
          </div>
        </motion.article>
      </motion.div>

      {/* ── Row 2: Asymmetric 2-Column (4 / 8) ───────────────────────────── */}
      <motion.div className="grid grid-cols-1 gap-5 md:grid-cols-12" {...rowAnim(prefersReducedMotion)}>
        {/* Card 3: Narrow Instant PII Radar */}
        <motion.article
          className={`${CARD_BASE} flex flex-col justify-between md:col-span-4`}
          {...cardAnim(0, prefersReducedMotion)}
        >
          <div>
            <h3 className="text-base font-bold leading-snug tracking-tight text-[#131420]">
              Instant PII Radar
            </h3>
            <p className="mt-1.5 text-xs leading-relaxed text-[#5E6478]">
              Precision scanners for emails, Indian &amp; intl phones, PAN, IPv4/IPv6, and cards.
            </p>
          </div>

          <div className={`${GRAPHIC_WELL} relative flex h-40 items-center justify-center`}>
            <div
              aria-hidden="true"
              className="h-36 w-36 rounded-full"
              style={{
                background:
                  'conic-gradient(from 210deg at 50% 50%, rgba(90, 69, 245, 0.52) 0deg, rgba(90, 69, 245, 0.14) 95deg, transparent 210deg)',
              }}
            />
            <div className="absolute h-24 w-24 rounded-full border border-white/80" />
            <div className="absolute flex h-13 w-13 items-center justify-center rounded-full border border-[#D8DCE8] bg-white shadow-[0_10px_26px_-6px_rgba(90,69,245,0.38)]">
              <ShieldAlert className="h-5 w-5 text-[#5A45F5]" aria-hidden="true" />
            </div>
          </div>
        </motion.article>

        {/* Card 4: Wide Smart Redaction on Steroids */}
        <motion.article
          className={`${CARD_BASE} flex flex-col justify-between md:col-span-8`}
          {...cardAnim(0.1, prefersReducedMotion)}
        >
          <div>
            <h3 className="text-base font-bold leading-snug tracking-tight text-[#131420]">
              Smart Redaction on Steroids
            </h3>
            <p className="mt-1.5 max-w-lg text-xs leading-relaxed text-[#5E6478]">
              Switch seamlessly between Full Mask, Partial Mask, and deterministic Pseudonyms with side-by-side diff inspection.
            </p>
          </div>

          <div className={`${GRAPHIC_WELL} relative flex h-40 items-center justify-center px-5`}>
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 flex flex-col justify-between p-4 font-mono text-[11px] leading-relaxed text-[#131420]/25 select-none"
            >
              <div className="flex justify-between">
                <span>4532 •••• 8910</span>
                <span>Aadhaar: 9412 ••••</span>
                <span>192.168.10.42</span>
              </div>
              <div className="flex justify-between">
                <span>ABCDE1234F</span>
                <span>priya.sharma@corp.in</span>
                <span>+91-98201-•••••</span>
              </div>
            </div>

            <div className="relative flex w-full max-w-md items-center justify-between gap-3 rounded-full border border-[#D8DCE8] bg-white px-5 py-3 shadow-[0_14px_34px_-10px_rgba(19,20,32,0.14)]">
              <div className="flex min-w-0 items-center gap-2.5 overflow-hidden">
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#5A45F5] shadow-[0_0_10px_rgba(90,69,245,0.75)]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#5A45F5] shadow-[0_0_10px_rgba(90,69,245,0.75)]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#5A45F5] shadow-[0_0_10px_rgba(90,69,245,0.75)]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#5A45F5]/80 shadow-[0_0_10px_rgba(90,69,245,0.55)]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#5A45F5]/60" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#5A45F5]/40" />
                </span>
                <span className="truncate font-mono text-xs text-[#5E6478] blur-[2px] select-none">
                  4532-8812-9014
                </span>
              </div>
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#EEF0F7] text-[#131420]">
                <EyeOff className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
            </div>
          </div>
        </motion.article>
      </motion.div>

      {/* ── Row 3: Equal 3-Column Grid ────────────────────────────────────── */}
      <motion.div className="grid grid-cols-1 gap-5 md:grid-cols-3" {...rowAnim(prefersReducedMotion)}>
        {/* Card 5: Auto-Sanitize Files */}
        <motion.article
          className={`${CARD_BASE} flex flex-col justify-between`}
          {...cardAnim(0, prefersReducedMotion)}
        >
          <div>
            <h3 className="text-base font-bold leading-snug tracking-tight text-[#131420]">
              Auto-Sanitize Files (.txt / .csv)
            </h3>
            <p className="mt-1.5 text-xs leading-relaxed text-[#5E6478]">
              RFC-4180 CSV structure stays intact while every sensitive cell is sanitized.
            </p>
          </div>

          <div className={`${GRAPHIC_WELL} flex h-40 flex-col justify-center gap-2 p-4`}>
            <div className="flex items-center justify-between gap-2 rounded-xl border border-[#D8DCE8] bg-white px-3 py-2 text-[11px] font-medium text-[#3B3E59] shadow-xs">
              <span className="min-w-0 truncate">customer_export.csv</span>
              <span className="shrink-0 whitespace-nowrap font-mono text-[10px] text-[#5E6478]">Row 01</span>
            </div>
            <div className="flex items-center justify-between gap-2 rounded-xl border border-[#D8DCE8] bg-white/90 px-3 py-2 text-[11px] font-medium text-[#3B3E59] shadow-xs">
              <span className="min-w-0 truncate">support_logs.txt</span>
              <span className="shrink-0 whitespace-nowrap font-mono text-[10px] text-[#5E6478]">UTF-8</span>
            </div>
            <div className="flex items-center justify-between gap-2 rounded-xl bg-[#5A45F5] px-3 py-2 text-[11px] font-semibold text-white shadow-[0_8px_18px_-4px_rgba(90,69,245,0.45)]">
              <span className="min-w-0 truncate font-mono">USER_01 • Sanitized</span>
              <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-white/25">
                <Check className="h-2.5 w-2.5 text-white" aria-hidden="true" />
              </span>
            </div>
          </div>
        </motion.article>

        {/* Card 6: Checksum Validated */}
        <motion.article
          className={`${CARD_BASE} flex flex-col justify-between`}
          {...cardAnim(0.1, prefersReducedMotion)}
        >
          <div>
            <h3 className="text-base font-bold leading-snug tracking-tight text-[#131420]">
              Checksum Validated
            </h3>
            <p className="mt-1.5 text-xs leading-relaxed text-[#5E6478]">
              Verhoeff &amp; Luhn mod-10 validation eliminates noisy false positives.
            </p>
          </div>

          <div className={`${GRAPHIC_WELL} relative flex h-40 items-center justify-center p-4`}>
            <div
              aria-hidden="true"
              className="grid grid-cols-4 gap-2 opacity-65 blur-[1px]"
            >
              {Array.from({ length: 12 }).map((_, idx) => (
                <div
                  key={idx}
                  className="h-7 w-7 rounded-lg border border-[#D8DCE8] bg-white shadow-xs"
                />
              ))}
            </div>
            <div className="absolute h-20 w-20 rounded-full bg-[#5A45F5]/25 blur-xl" />
            <div className="absolute flex h-13 w-13 items-center justify-center rounded-full border border-[#D8DCE8] bg-white shadow-[0_12px_30px_-4px_rgba(90,69,245,0.45)]">
              <Lock className="h-5 w-5 text-[#5A45F5]" aria-hidden="true" />
            </div>
          </div>
        </motion.article>

        {/* Card 7: Instant Audit & Export */}
        <motion.article
          className={`${CARD_BASE} flex flex-col justify-between`}
          {...cardAnim(0.2, prefersReducedMotion)}
        >
          <div>
            <h3 className="text-base font-bold leading-snug tracking-tight text-[#131420]">
              Instant Audit &amp; Export
            </h3>
            <p className="mt-1.5 text-xs leading-relaxed text-[#5E6478]">
              Download sanitized files alongside zero-PII compliance audit reports.
            </p>
          </div>

          <div className={`${GRAPHIC_WELL} flex h-40 items-center justify-center p-4`}>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#D8DCE8] bg-white py-2 pr-2 pl-4 shadow-[0_10px_26px_-8px_rgba(19,20,32,0.12)]">
              <span className="text-xs font-semibold text-[#131420]">1-Click Export</span>
              <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[#5A45F5]/20 bg-[#EEF0F7] text-[#5A45F5] shadow-xs">
                <span className="relative flex items-center justify-center">
                  <ShieldCheck className="h-4 w-4 text-[#5A45F5]" aria-hidden="true" />
                  <Fingerprint className="sr-only" />
                </span>
              </span>
            </div>
          </div>
        </motion.article>
      </motion.div>
    </section>
  );
}
