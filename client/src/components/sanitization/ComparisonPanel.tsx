import { useMemo, useRef, useState } from 'react';
import { Eye, Lock, ShieldAlert, ShieldCheck } from 'lucide-react';
import {
  CATEGORY_LABELS,
  type PiiCategory,
  type PiiEntity,
  type SanitizationResult,
} from '../../engine/types';

interface ComparisonPanelProps {
  originalText: string;
  result: SanitizationResult | null;
  isProcessing: boolean;
}

const PREVIEW_CHAR_LIMIT = 120_000;

const CATEGORY_BADGE_STYLES: Record<
  PiiCategory,
  { original: string; sanitized: string; tag: string }
> = {
  EMAIL: {
    original: 'border-rose-500/40 bg-rose-500/15 text-rose-200',
    sanitized: 'border-emerald-500/40 bg-emerald-500/15 text-emerald-200',
    tag: 'EMAIL',
  },
  INDIAN_PHONE: {
    original: 'border-amber-500/40 bg-amber-500/15 text-amber-200',
    sanitized: 'border-emerald-500/40 bg-emerald-500/15 text-emerald-200',
    tag: 'IN-PH',
  },
  INTL_PHONE: {
    original: 'border-orange-500/40 bg-orange-500/15 text-orange-200',
    sanitized: 'border-emerald-500/40 bg-emerald-500/15 text-emerald-200',
    tag: 'INTL-PH',
  },
  IPV4: {
    original: 'border-sky-500/40 bg-sky-500/15 text-sky-200',
    sanitized: 'border-emerald-500/40 bg-emerald-500/15 text-emerald-200',
    tag: 'IPv4',
  },
  IPV6: {
    original: 'border-cyan-500/40 bg-cyan-500/15 text-cyan-200',
    sanitized: 'border-emerald-500/40 bg-emerald-500/15 text-emerald-200',
    tag: 'IPv6',
  },
  PAN: {
    original: 'border-fuchsia-500/40 bg-fuchsia-500/15 text-fuchsia-200',
    sanitized: 'border-emerald-500/40 bg-emerald-500/15 text-emerald-200',
    tag: 'PAN',
  },
  AADHAAR: {
    original: 'border-red-500/40 bg-red-500/15 text-red-200',
    sanitized: 'border-emerald-500/40 bg-emerald-500/15 text-emerald-200',
    tag: 'UID',
  },
  CREDIT_CARD: {
    original: 'border-violet-500/40 bg-violet-500/15 text-violet-200',
    sanitized: 'border-emerald-500/40 bg-emerald-500/15 text-emerald-200',
    tag: 'CARD',
  },
};

interface TextSegment {
  key: string;
  text: string;
  entity?: PiiEntity;
}

function buildOriginalSegments(text: string, entities: PiiEntity[]): TextSegment[] {
  const displayLimit = Math.min(text.length, PREVIEW_CHAR_LIMIT);
  const sliced = text.slice(0, displayLimit);
  if (entities.length === 0) {
    return [{ key: 'plain-0', text: sliced }];
  }

  const segments: TextSegment[] = [];
  let cursor = 0;

  for (const entity of entities) {
    if (entity.start >= displayLimit) break;
    const clampedEnd = Math.min(entity.end, displayLimit);
    // Verify offset matches original substring safely before slicing
    if (
      entity.start < cursor ||
      sliced.slice(entity.start, clampedEnd) !== entity.value.slice(0, clampedEnd - entity.start)
    ) {
      continue;
    }

    if (entity.start > cursor) {
      segments.push({
        key: `txt-${cursor}`,
        text: sliced.slice(cursor, entity.start),
      });
    }
    segments.push({
      key: `ent-${entity.id}`,
      text: sliced.slice(entity.start, clampedEnd),
      entity,
    });
    cursor = clampedEnd;
  }

  if (cursor < sliced.length) {
    segments.push({ key: `txt-${cursor}`, text: sliced.slice(cursor) });
  }

  return segments;
}

function buildSanitizedSegments(
  sanitizedText: string,
  entities: PiiEntity[],
  isCsv: boolean
): TextSegment[] {
  const displayLimit = Math.min(sanitizedText.length, PREVIEW_CHAR_LIMIT);
  const sliced = sanitizedText.slice(0, displayLimit);
  if (entities.length === 0) {
    return [{ key: 'san-plain-0', text: sliced }];
  }

  if (!isCsv) {
    const segments: TextSegment[] = [];
    let origCursor = 0;
    let sanCursor = 0;

    for (const entity of entities) {
      const gap = entity.start - origCursor;
      if (gap < 0) continue;
      const sanStart = sanCursor + gap;
      if (sanStart >= displayLimit) break;

      if (gap > 0) {
        segments.push({
          key: `san-txt-${sanCursor}`,
          text: sliced.slice(sanCursor, sanStart),
        });
      }

      const sanEnd = Math.min(sanStart + entity.replacement.length, displayLimit);
      segments.push({
        key: `san-ent-${entity.id}`,
        text: sliced.slice(sanStart, sanEnd),
        entity,
      });

      origCursor = entity.end;
      sanCursor = sanStart + entity.replacement.length;
    }

    if (sanCursor < sliced.length) {
      segments.push({ key: `san-txt-${sanCursor}`, text: sliced.slice(sanCursor) });
    }
    return segments;
  }

  // For CSV outputs (where RFC4180 serialization may normalize line breaks/quoting), match unique replacement tokens safely
  const uniqueReplacements = new Map<string, PiiEntity>();
  for (const entity of entities) {
    if (entity.replacement && !uniqueReplacements.has(entity.replacement)) {
      uniqueReplacements.set(entity.replacement, entity);
    }
  }
  const tokens = Array.from(uniqueReplacements.keys()).sort((a, b) => b.length - a.length);
  if (tokens.length === 0) {
    return [{ key: 'san-plain-0', text: sliced }];
  }

  const segments: TextSegment[] = [];
  let cursor = 0;
  let matchIdx = 0;
  while (cursor < sliced.length) {
    let earliestIndex = -1;
    let earliestToken = '';

    for (const token of tokens) {
      const found = sliced.indexOf(token, cursor);
      if (found !== -1 && (earliestIndex === -1 || found < earliestIndex)) {
        earliestIndex = found;
        earliestToken = token;
      }
    }

    if (earliestIndex === -1) {
      segments.push({ key: `san-tail-${cursor}`, text: sliced.slice(cursor) });
      break;
    }

    if (earliestIndex > cursor) {
      segments.push({
        key: `san-gap-${cursor}`,
        text: sliced.slice(cursor, earliestIndex),
      });
    }

    segments.push({
      key: `san-tok-${matchIdx++}`,
      text: earliestToken,
      entity: uniqueReplacements.get(earliestToken),
    });
    cursor = earliestIndex + earliestToken.length;
  }

  return segments;
}

function HighlightedToken({
  segment,
  variant,
  onInspect,
}: {
  segment: TextSegment;
  variant: 'original' | 'sanitized';
  onInspect: (entity: PiiEntity | null) => void;
}) {
  const { entity, text } = segment;
  if (!entity) {
    return <>{text}</>;
  }

  const styles = CATEGORY_BADGE_STYLES[entity.category];
  const colorClass = variant === 'original' ? styles.original : styles.sanitized;
  const label = CATEGORY_LABELS[entity.category];

  return (
    <span
      tabIndex={0}
      role="mark"
      aria-label={`${label}: ${variant === 'original' ? 'sensitive value detected' : `replaced with ${text}`}`}
      title={`${label} • ${entity.explanation}`}
      onMouseEnter={() => onInspect(entity)}
      onMouseLeave={() => onInspect(null)}
      onFocus={() => onInspect(entity)}
      onBlur={() => onInspect(null)}
      className={`group relative mx-0.5 inline-flex items-center gap-1 rounded border px-1 py-0.2 font-mono text-[11px] leading-snug focus:outline-2 focus:outline-offset-1 focus:outline-indigo-400 ${colorClass}`}
    >
      <span className="rounded bg-black/30 px-1 text-[9px] font-semibold tracking-wider uppercase">
        {styles.tag}
      </span>
      <span className="break-all">{text}</span>
    </span>
  );
}

export function ComparisonPanel({
  originalText,
  result,
  isProcessing,
}: ComparisonPanelProps) {
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const syncingRef = useRef<'left' | 'right' | null>(null);
  const [syncScroll, setSyncScroll] = useState(true);
  const [inspectedEntity, setInspectedEntity] = useState<PiiEntity | null>(null);

  const handleScroll = (source: 'left' | 'right') => {
    if (!syncScroll) return;
    if (syncingRef.current && syncingRef.current !== source) return;

    const fromEl = source === 'left' ? leftRef.current : rightRef.current;
    const toEl = source === 'left' ? rightRef.current : leftRef.current;
    if (!fromEl || !toEl) return;

    syncingRef.current = source;
    const maxFrom = Math.max(1, fromEl.scrollHeight - fromEl.clientHeight);
    const ratio = fromEl.scrollTop / maxFrom;
    const maxTo = Math.max(0, toEl.scrollHeight - toEl.clientHeight);
    toEl.scrollTop = ratio * maxTo;

    window.requestAnimationFrame(() => {
      syncingRef.current = null;
    });
  };

  const originalSegments = useMemo(
    () => buildOriginalSegments(originalText, result?.entities ?? []),
    [originalText, result]
  );

  const sanitizedSegments = useMemo(
    () =>
      buildSanitizedSegments(
        result?.sanitizedText ?? '',
        result?.entities ?? [],
        Boolean(result?.isCsv)
      ),
    [result]
  );

  const isTruncatedPreview =
    originalText.length > PREVIEW_CHAR_LIMIT ||
    (result?.sanitizedText.length ?? 0) > PREVIEW_CHAR_LIMIT;

  if (!originalText) {
    return (
      <section
        aria-label="Before and after comparison"
        className="rounded-2xl border border-white/10 bg-[#111116] p-8 text-center"
      >
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-indigo-500/30 bg-indigo-500/10">
          <Eye className="h-5 w-5 text-indigo-400" />
        </div>
        <h3 className="mt-3 text-sm font-semibold text-zinc-100">
          Side-by-Side Comparison Ready
        </h3>
        <p className="mx-auto mt-1 max-w-md text-xs leading-relaxed text-zinc-400">
          Paste text, upload a <code className="text-zinc-300">.txt</code> or{' '}
          <code className="text-zinc-300">.csv</code> file, or choose a synthetic sample above to inspect detected PII spans alongside sanitized output.
        </p>
      </section>
    );
  }

  return (
    <section
      aria-labelledby="comparison-heading"
      className="rounded-2xl border border-white/10 bg-[#111116] p-5 shadow-xl"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3.5">
        <div>
          <h2 id="comparison-heading" className="text-sm font-semibold text-zinc-100">
            Before / After Privacy Comparison
          </h2>
          <p className="text-xs text-zinc-400">
            Hover or focus any highlighted span to inspect category, confidence, and validation rule.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label className="inline-flex cursor-pointer items-center gap-2 text-xs text-zinc-300">
            <input
              type="checkbox"
              checked={syncScroll}
              onChange={(e) => setSyncScroll(e.target.checked)}
              className="h-3.5 w-3.5 rounded border-white/20 bg-zinc-950 accent-indigo-500"
            />
            Sync scroll
          </label>
          {isProcessing && (
            <span className="rounded-full border border-indigo-500/35 bg-indigo-500/10 px-2.5 py-1 text-[11px] font-medium text-indigo-300">
              Updating...
            </span>
          )}
        </div>
      </div>

      {/* Accessible live inspector bar (replaces fragile floating tooltips on touch/keyboard) */}
      <div
        aria-live="polite"
        className="mt-3 flex min-h-[36px] flex-wrap items-center justify-between gap-2 rounded-xl border border-white/10 bg-[#09090b] px-3.5 py-2 text-xs"
      >
        {inspectedEntity ? (
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="rounded-full border border-indigo-500/35 bg-indigo-500/15 px-2 py-0.5 text-[10px] font-semibold text-indigo-200">
              {CATEGORY_LABELS[inspectedEntity.category]}
            </span>
            <span className="text-zinc-300">{inspectedEntity.explanation}</span>
            <span className="font-mono text-[11px] text-emerald-300">
              Validation: {inspectedEntity.validationResult} ({Math.round(inspectedEntity.confidence * 100)}%)
            </span>
          </div>
        ) : (
          <span className="text-zinc-500">
            Tip: Tab or hover over any highlighted entity badge to inspect its validation metadata.
          </span>
        )}
      </div>

      {isTruncatedPreview && (
        <div className="mt-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3.5 py-2 text-xs text-amber-200">
          Showing first {PREVIEW_CHAR_LIMIT.toLocaleString()} characters in visual diff preview to preserve UI responsiveness. Copy and file exports include the full document.
        </div>
      )}

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        {/* Left: Original */}
        <div className="flex flex-col rounded-xl border border-rose-500/20 bg-[#09090b]">
          <div className="flex items-center justify-between border-b border-white/10 px-3.5 py-2.5">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-300">
              <ShieldAlert className="h-3.5 w-3.5" />
              Original Document (Local Memory Only)
            </span>
            <span className="font-mono text-[11px] text-zinc-400">
              {result?.stats.totalDetected ?? 0} detected
            </span>
          </div>

          <div
            ref={leftRef}
            onScroll={() => handleScroll('left')}
            tabIndex={0}
            aria-label="Original document with detected PII highlighted"
            className="h-80 overflow-auto p-3.5 font-mono text-xs leading-relaxed whitespace-pre-wrap break-words text-zinc-300 focus:outline-2 focus:outline-indigo-500"
          >
            {originalSegments.map((seg) => (
              <HighlightedToken
                key={seg.key}
                segment={seg}
                variant="original"
                onInspect={setInspectedEntity}
              />
            ))}
          </div>
        </div>

        {/* Right: Sanitized */}
        <div className="flex flex-col rounded-xl border border-emerald-500/25 bg-[#09090b]">
          <div className="flex items-center justify-between border-b border-white/10 px-3.5 py-2.5">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-300">
              <ShieldCheck className="h-3.5 w-3.5" />
              Sanitized Output
            </span>
            <span className="inline-flex items-center gap-1 font-mono text-[11px] text-emerald-300">
              <Lock className="h-3 w-3" />
              {result?.stats.totalSanitized ?? 0} protected
            </span>
          </div>

          <div
            ref={rightRef}
            onScroll={() => handleScroll('right')}
            tabIndex={0}
            aria-label="Sanitized document output with replacements highlighted"
            className="h-80 overflow-auto p-3.5 font-mono text-xs leading-relaxed whitespace-pre-wrap break-words text-zinc-200 focus:outline-2 focus:outline-indigo-500"
          >
            {sanitizedSegments.map((seg) => (
              <HighlightedToken
                key={seg.key}
                segment={seg}
                variant="sanitized"
                onInspect={setInspectedEntity}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
