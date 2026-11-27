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

const SANITIZED_PILL_STYLE =
  'border-emerald-400 bg-emerald-100 text-emerald-900 font-semibold dark:border-emerald-400/50 dark:bg-emerald-500/20 dark:text-emerald-100';
const SANITIZED_TAG_STYLE = 'bg-emerald-700 text-white font-bold dark:bg-emerald-600';

const CATEGORY_BADGE_STYLES: Record<
  PiiCategory,
  { original: string; originalTag: string; sanitized: string; sanitizedTag: string; tag: string }
> = {
  EMAIL: {
    original: 'border-blue-400 bg-blue-100 text-blue-900 font-semibold dark:border-blue-400/50 dark:bg-blue-500/20 dark:text-blue-100',
    originalTag: 'bg-blue-600 text-white font-bold',
    sanitized: SANITIZED_PILL_STYLE,
    sanitizedTag: SANITIZED_TAG_STYLE,
    tag: 'EMAIL',
  },
  INDIAN_PHONE: {
    original: 'border-purple-400 bg-purple-100 text-purple-900 font-semibold dark:border-purple-400/50 dark:bg-purple-500/20 dark:text-purple-100',
    originalTag: 'bg-purple-600 text-white font-bold',
    sanitized: SANITIZED_PILL_STYLE,
    sanitizedTag: SANITIZED_TAG_STYLE,
    tag: 'IN-PH',
  },
  INTL_PHONE: {
    original: 'border-purple-400 bg-purple-100 text-purple-900 font-semibold dark:border-purple-400/50 dark:bg-purple-500/20 dark:text-purple-100',
    originalTag: 'bg-purple-600 text-white font-bold',
    sanitized: SANITIZED_PILL_STYLE,
    sanitizedTag: SANITIZED_TAG_STYLE,
    tag: 'INTL-PH',
  },
  IPV4: {
    original: 'border-teal-400 bg-teal-100 text-teal-900 font-semibold dark:border-teal-400/50 dark:bg-teal-500/20 dark:text-teal-100',
    originalTag: 'bg-teal-600 text-white font-bold',
    sanitized: SANITIZED_PILL_STYLE,
    sanitizedTag: SANITIZED_TAG_STYLE,
    tag: 'IPv4',
  },
  IPV6: {
    original: 'border-teal-400 bg-teal-100 text-teal-900 font-semibold dark:border-teal-400/50 dark:bg-teal-500/20 dark:text-teal-100',
    originalTag: 'bg-teal-600 text-white font-bold',
    sanitized: SANITIZED_PILL_STYLE,
    sanitizedTag: SANITIZED_TAG_STYLE,
    tag: 'IPv6',
  },
  PAN: {
    original: 'border-amber-400 bg-amber-100 text-amber-900 font-semibold dark:border-amber-400/50 dark:bg-amber-500/20 dark:text-amber-100',
    originalTag: 'bg-amber-600 text-white font-bold',
    sanitized: SANITIZED_PILL_STYLE,
    sanitizedTag: SANITIZED_TAG_STYLE,
    tag: 'PAN',
  },
  AADHAAR: {
    original: 'border-amber-400 bg-amber-100 text-amber-900 font-semibold dark:border-amber-400/50 dark:bg-amber-500/20 dark:text-amber-100',
    originalTag: 'bg-amber-600 text-white font-bold',
    sanitized: SANITIZED_PILL_STYLE,
    sanitizedTag: SANITIZED_TAG_STYLE,
    tag: 'UID',
  },
  CREDIT_CARD: {
    original: 'border-rose-400 bg-rose-100 text-rose-900 font-semibold dark:border-rose-400/50 dark:bg-rose-500/20 dark:text-rose-100',
    originalTag: 'bg-rose-600 text-white font-bold',
    sanitized: SANITIZED_PILL_STYLE,
    sanitizedTag: SANITIZED_TAG_STYLE,
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
  const tagClass = variant === 'original' ? styles.originalTag : styles.sanitizedTag;
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
      className={`group relative mx-0.5 inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 font-mono text-[11px] leading-snug focus:outline-2 focus:outline-offset-1 focus:outline-[#4F5580] ${colorClass}`}
    >
      <span className={`rounded px-1 text-[9px] tracking-wider uppercase ${tagClass}`}>
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
        className="rounded-2xl border border-[#D8DCE8] bg-white p-8 text-center shadow-[0_6px_20px_-8px_rgba(19,20,32,0.08)] dark:border-[#2E314A] dark:bg-[#1B1D2E] dark:shadow-[0_10px_28px_-10px_rgba(0,0,0,0.45)]"
      >
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-[#D8DCE8] bg-[#EEF0F7] dark:border-[#2E314A] dark:bg-[#23263B]">
          <Eye className="h-5 w-5 text-[#5A45F5] dark:text-[#A5B4FC]" />
        </div>
        <h3 className="mt-3 text-sm font-bold text-[#131420] dark:text-white">
          Side-by-Side Comparison Ready
        </h3>
        <p className="mx-auto mt-1 max-w-md text-xs leading-relaxed text-[#5E6478] dark:text-[#B0B5C9]">
          Paste text, upload a <code className="rounded bg-[#EEF0F7] px-1 py-0.5 text-[#3B3E59] dark:bg-[#23263B] dark:text-[#E6E8F0]">.txt</code> or{' '}
          <code className="rounded bg-[#EEF0F7] px-1 py-0.5 text-[#3B3E59] dark:bg-[#23263B] dark:text-[#E6E8F0]">.csv</code> file, or choose a synthetic sample above to inspect detected PII spans alongside sanitized output.
        </p>
      </section>
    );
  }

  return (
    <section
      aria-labelledby="comparison-heading"
      className="rounded-2xl border border-[#D8DCE8] bg-white p-5 shadow-[0_6px_20px_-8px_rgba(19,20,32,0.08)] dark:border-[#2E314A] dark:bg-[#1B1D2E] dark:shadow-[0_10px_28px_-10px_rgba(0,0,0,0.45)]"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E6E8F0] pb-3.5 dark:border-[#2E314A]">
        <div>
          <h2 id="comparison-heading" className="text-sm font-bold tracking-tight text-[#131420] dark:text-white">
            Before / After Privacy Comparison
          </h2>
          <p className="text-xs text-[#5E6478] dark:text-[#B0B5C9]">
            Hover or focus any highlighted span to inspect category, confidence, and validation rule.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-medium text-[#131420] dark:text-[#E6E8F0]">
            <input
              type="checkbox"
              checked={syncScroll}
              onChange={(e) => setSyncScroll(e.target.checked)}
              className="h-3.5 w-3.5 rounded border-[#D8DCE8] bg-white accent-[#5A45F5] dark:border-[#2E314A] dark:bg-[#131420]"
            />
            Sync scroll
          </label>
          {isProcessing && (
            <span className="rounded-full border border-[#D8DCE8] bg-[#EEF0F7] px-2.5 py-1 text-[11px] font-medium text-[#3B3E59] dark:border-[#2E314A] dark:bg-[#23263B] dark:text-[#E6E8F0]">
              Updating...
            </span>
          )}
        </div>
      </div>

      {/* Accessible live inspector bar */}
      <div
        aria-live="polite"
        className="mt-3 flex min-h-[36px] flex-wrap items-center justify-between gap-2 rounded-xl border border-[#D8DCE8] bg-[#F4F5FA] px-3.5 py-2 text-xs dark:border-[#2E314A] dark:bg-[#131420]/70"
      >
        {inspectedEntity ? (
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="rounded-full border border-[#5A45F5] bg-[#5A45F5] px-2.5 py-0.5 text-[10px] font-semibold text-white">
              {CATEGORY_LABELS[inspectedEntity.category]}
            </span>
            <span className="text-[#131420] dark:text-[#E6E8F0]">{inspectedEntity.explanation}</span>
            <span className="font-mono text-[11px] font-semibold text-[#5E6478] dark:text-[#B0B5C9]">
              Validation: {inspectedEntity.validationResult} ({Math.round(inspectedEntity.confidence * 100)}%)
            </span>
          </div>
        ) : (
          <span className="text-[#5E6478] dark:text-[#B0B5C9]">
            Tip: Tab or hover over any highlighted entity badge to inspect its validation metadata.
          </span>
        )}
      </div>

      {isTruncatedPreview && (
        <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2 text-xs text-amber-900 dark:border-amber-500/40 dark:bg-amber-950/50 dark:text-amber-200">
          Showing first {PREVIEW_CHAR_LIMIT.toLocaleString()} characters in visual diff preview to preserve UI responsiveness. Copy and file exports include the full document.
        </div>
      )}

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        {/* Left: Original */}
        <div className="flex flex-col rounded-xl border border-[#D8DCE8] bg-white dark:border-[#2E314A] dark:bg-[#131420]">
          <div className="flex items-center justify-between rounded-t-[11px] border-b border-rose-200 bg-rose-50 px-3.5 py-2.5 dark:border-rose-800/50 dark:bg-rose-950/45">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-700 dark:text-rose-300">
              <ShieldAlert className="h-3.5 w-3.5 text-rose-700 dark:text-rose-400" />
              Original Document (Local Memory Only)
            </span>
            <span className="font-mono text-[11px] font-semibold text-rose-700 dark:text-rose-300">
              {result?.stats.totalDetected ?? 0} detected
            </span>
          </div>

          <div
            ref={leftRef}
            onScroll={() => handleScroll('left')}
            tabIndex={0}
            aria-label="Original document with detected PII highlighted"
            className="h-80 overflow-auto rounded-b-[11px] bg-white p-3.5 font-mono text-xs leading-relaxed whitespace-pre-wrap break-words text-[#131420] focus:outline-2 focus:outline-[#5A45F5] dark:bg-[#131420] dark:text-[#E6E8F0]"
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
        <div className="flex flex-col rounded-xl border border-[#D8DCE8] bg-white dark:border-[#2E314A] dark:bg-[#131420]">
          <div className="flex items-center justify-between rounded-t-[11px] border-b border-emerald-200 bg-emerald-50 px-3.5 py-2.5 dark:border-emerald-800/50 dark:bg-emerald-950/45">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-400" />
              Sanitized Output
            </span>
            <span className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
              <Lock className="h-3 w-3 text-emerald-700 dark:text-emerald-400" />
              {result?.stats.totalSanitized ?? 0} protected
            </span>
          </div>

          <div
            ref={rightRef}
            onScroll={() => handleScroll('right')}
            tabIndex={0}
            aria-label="Sanitized document output with replacements highlighted"
            className="h-80 overflow-auto rounded-b-[11px] bg-white p-3.5 font-mono text-xs leading-relaxed whitespace-pre-wrap break-words text-[#131420] focus:outline-2 focus:outline-[#5A45F5] dark:bg-[#131420] dark:text-[#E6E8F0]"
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
