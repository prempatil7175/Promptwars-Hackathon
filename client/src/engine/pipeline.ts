import { parseCsv, serializeCsv } from './csvProcessor';
import { scanDocumentCandidates, type ValidatedCandidate } from './detectors';
import { formatReplacement, PseudonymSessionMapper } from './redactors';
import {
  ALL_PII_CATEGORIES,
  DEFAULT_DETECTION_CONFIG,
  type AuditReportMetadata,
  type DetectionConfig,
  type DetectionStats,
  type PiiCategory,
  type PiiEntity,
  type RejectedCandidate,
  type SanitizationMode,
  type SanitizationResult,
} from './types';

const CATEGORY_PRIORITY: Record<PiiCategory, number> = {
  EMAIL: 8,
  CREDIT_CARD: 7,
  IPV6: 6,
  AADHAAR: 5,
  PAN: 4,
  INDIAN_PHONE: 3,
  INTL_PHONE: 2,
  IPV4: 1,
};

function emptyCategoryCounts(): Record<PiiCategory, number> {
  return {
    EMAIL: 0,
    INDIAN_PHONE: 0,
    INTL_PHONE: 0,
    IPV4: 0,
    IPV6: 0,
    PAN: 0,
    AADHAAR: 0,
    CREDIT_CARD: 0,
  };
}

/**
 * Resolves overlapping validated candidates deterministically:
 * Longer span wins first, then category specificity, then earlier start offset.
 * Finally re-sorts accepted non-overlapping spans in strict ascending source order.
 */
export function resolveOverlaps(candidates: ValidatedCandidate[]): ValidatedCandidate[] {
  if (candidates.length <= 1) return [...candidates];

  const ranked = [...candidates].sort((a, b) => {
    const lenDiff = (b.end - b.start) - (a.end - a.start);
    if (lenDiff !== 0) return lenDiff;
    const prioDiff = CATEGORY_PRIORITY[b.category] - CATEGORY_PRIORITY[a.category];
    if (prioDiff !== 0) return prioDiff;
    return a.start - b.start;
  });

  const accepted: ValidatedCandidate[] = [];
  for (const candidate of ranked) {
    const overlaps = accepted.some(
      (existing) => candidate.start < existing.end && candidate.end > existing.start
    );
    if (!overlaps) {
      accepted.push(candidate);
    }
  }

  return accepted.sort((a, b) => a.start - b.start);
}

/** Single-pass span-based replacement preserving original offsets and source order. */
export function applySpanReplacements(text: string, entities: PiiEntity[]): string {
  if (entities.length === 0) return text;
  const chunks: string[] = [];
  let cursor = 0;

  for (const entity of entities) {
    if (entity.start > cursor) {
      chunks.push(text.slice(cursor, entity.start));
    }
    chunks.push(entity.replacement);
    cursor = entity.end;
  }

  if (cursor < text.length) {
    chunks.push(text.slice(cursor));
  }

  return chunks.join('');
}

function getUtf8ByteLength(text: string): number {
  return new TextEncoder().encode(text).length;
}

function countLines(text: string): number {
  if (!text) return 0;
  return text.split(/\r\n|\r|\n/).length;
}

function processPlainTextSegment(
  text: string,
  mode: SanitizationMode,
  config: DetectionConfig,
  mapper: PseudonymSessionMapper,
  idPrefix: string
): {
  sanitizedText: string;
  entities: PiiEntity[];
  rejectedCandidates: RejectedCandidate[];
} {
  const { candidates, rejected } = scanDocumentCandidates(text, config);
  const nonOverlapping = resolveOverlaps(candidates);

  const entities: PiiEntity[] = nonOverlapping.map((cand, index) => ({
    id: `${idPrefix}_${String(index + 1).padStart(4, '0')}_${cand.category.toLowerCase()}_${cand.start}`,
    category: cand.category,
    start: cand.start,
    end: cand.end,
    value: cand.value,
    confidence: cand.confidence,
    validationResult: cand.validationResult,
    replacement: formatReplacement(cand.category, cand.value, mode, mapper),
    explanation: cand.explanation,
  }));

  const sanitizedText = applySpanReplacements(text, entities);
  return { sanitizedText, entities, rejectedCandidates: rejected };
}

export interface RunPipelineOptions {
  mode?: SanitizationMode;
  config?: DetectionConfig;
  isCsv?: boolean;
  onProgress?: (percent: number, stage: string) => void;
}

/**
 * Authoritative client-side PII detection and sanitization pipeline.
 * Preserves source offsets, applies deterministic overlap resolution,
 * handles RFC4180 CSV structure safely, and never mutates the original input.
 */
export function runSanitizationPipeline(
  inputText: string,
  options: RunPipelineOptions = {}
): SanitizationResult {
  const startTime = performance.now();
  const mode: SanitizationMode = options.mode ?? 'full';
  const config: DetectionConfig = options.config ?? DEFAULT_DETECTION_CONFIG;
  const isCsv = Boolean(options.isCsv);
  const mapper = new PseudonymSessionMapper();

  const categoryCounts = emptyCategoryCounts();
  const rejectedByCategory = emptyCategoryCounts();
  const byteCount = getUtf8ByteLength(inputText);
  const lineCount = countLines(inputText);

  if (!inputText) {
    const duration = Math.max(0.1, Number((performance.now() - startTime).toFixed(2)));
    return {
      sanitizedText: '',
      entities: [],
      rejectedCandidates: [],
      mode,
      isCsv,
      stats: {
        totalDetected: 0,
        totalSanitized: 0,
        validatedCount: 0,
        rejectedFalsePositives: 0,
        processingDurationMs: duration,
        characterCount: 0,
        lineCount: 0,
        byteCount: 0,
        categoryCounts,
        rejectedByCategory,
      },
    };
  }

  options.onProgress?.(15, 'Scanning input spans');

  let finalSanitizedText = '';
  const allEntities: PiiEntity[] = [];
  const allRejected: RejectedCandidate[] = [];
  let csvMeta: SanitizationResult['csvMeta'];

  if (isCsv) {
    const parsed = parseCsv(inputText);
    const sanitizedHeaders = parsed.headers.map((cell, cIdx) => {
      const res = processPlainTextSegment(cell, mode, config, mapper, `hdr_${cIdx}`);
      allEntities.push(...res.entities);
      allRejected.push(...res.rejectedCandidates);
      return res.sanitizedText;
    });

    let sanitizedCellCount = 0;
    const totalRows = Math.max(1, parsed.rows.length);
    const sanitizedRows = parsed.rows.map((row, rIdx) => {
      if (rIdx % 50 === 0) {
        const pct = 20 + Math.round(((rIdx + 1) / totalRows) * 65);
        options.onProgress?.(pct, `Sanitizing CSV row ${rIdx + 1} of ${parsed.rows.length}`);
      }
      return row.map((cell, cIdx) => {
        const res = processPlainTextSegment(cell, mode, config, mapper, `r${rIdx}_c${cIdx}`);
        if (res.entities.length > 0) sanitizedCellCount += 1;
        allEntities.push(...res.entities);
        allRejected.push(...res.rejectedCandidates);
        return res.sanitizedText;
      });
    });

    finalSanitizedText = serializeCsv(sanitizedHeaders, sanitizedRows);
    csvMeta = {
      rowCount: parsed.rows.length,
      columnCount: parsed.headers.length,
      sanitizedCellCount,
      warnings: parsed.warnings,
    };

    // Also compute document-level display entities on raw input so ComparisonPanel highlights exact offsets in original text
    const displayScan = processPlainTextSegment(inputText, mode, config, new PseudonymSessionMapper(), 'det');
    // Note: keep allEntities from cell-wise scan for accurate CSV sanitization counts,
    // or align if identical. Wait: for ComparisonPanel side-by-side highlights, offsets in inputText vs finalSanitizedText are needed.
    // Let's re-index entities against raw inputText for exact left-pane highlighting while preserving exact cell-wise CSV counts!
    if (displayScan.entities.length > 0 && allEntities.length === 0) {
      allEntities.push(...displayScan.entities);
    } else if (displayScan.entities.length === allEntities.length) {
      // Preserve exact source offsets from inputText when 1:1
      for (let i = 0; i < allEntities.length; i += 1) {
        allEntities[i] = {
          ...allEntities[i],
          start: displayScan.entities[i].start,
          end: displayScan.entities[i].end,
        };
      }
    }
  } else {
    options.onProgress?.(45, 'Validating candidates & resolving overlaps');
    const plainRes = processPlainTextSegment(inputText, mode, config, mapper, 'det');
    finalSanitizedText = plainRes.sanitizedText;
    allEntities.push(...plainRes.entities);
    allRejected.push(...plainRes.rejectedCandidates);
  }

  options.onProgress?.(90, 'Computing privacy statistics');

  for (const entity of allEntities) {
    categoryCounts[entity.category] += 1;
  }

  // Filter out rejected candidates that overlap an accepted valid entity (e.g. a shorter sub-candidate inside a valid match)
  const trueRejected = allRejected.filter(
    (rej) =>
      !allEntities.some(
        (ent) => rej.start < ent.end && rej.end > ent.start && ent.category === rej.category
      )
  );

  for (const rej of trueRejected) {
    rejectedByCategory[rej.category] += 1;
  }

  const duration = Math.max(0.1, Number((performance.now() - startTime).toFixed(2)));
  options.onProgress?.(100, 'Complete');

  const stats: DetectionStats = {
    totalDetected: allEntities.length,
    totalSanitized: allEntities.length,
    validatedCount: allEntities.length,
    rejectedFalsePositives: trueRejected.length,
    processingDurationMs: duration,
    characterCount: inputText.length,
    lineCount,
    byteCount,
    categoryCounts,
    rejectedByCategory,
  };

  return {
    sanitizedText: finalSanitizedText,
    entities: allEntities,
    rejectedCandidates: trueRejected,
    stats,
    mode,
    isCsv,
    csvMeta,
  };
}

/**
 * Re-runs the local PII detector on sanitized output to verify zero residual PII remains
 * before any optional external AI action or export verification.
 */
export function verifyZeroResidualPii(
  sanitizedText: string,
  config: DetectionConfig = DEFAULT_DETECTION_CONFIG
): { safe: boolean; residualCount: number; residualCategories: PiiCategory[] } {
  const { candidates } = scanDocumentCandidates(sanitizedText, config);
  const nonOverlapping = resolveOverlaps(candidates);
  const categories = Array.from(new Set(nonOverlapping.map((c) => c.category)));
  return {
    safe: nonOverlapping.length === 0,
    residualCount: nonOverlapping.length,
    residualCategories: categories,
  };
}

/**
 * Generates metadata-only JSON audit report.
 * Strictly excludes original document text, original PII values, and pseudonym mappings.
 */
export function buildAuditReportMetadata(
  result: SanitizationResult,
  fileType: 'text' | 'txt' | 'csv',
  config: DetectionConfig
): AuditReportMetadata {
  const residualCheck = verifyZeroResidualPii(result.sanitizedText, config);
  const categoryCounts = emptyCategoryCounts();
  const rejectedByCategory = emptyCategoryCounts();

  for (const cat of ALL_PII_CATEGORIES) {
    categoryCounts[cat] = result.stats.categoryCounts[cat] ?? 0;
    rejectedByCategory[cat] = result.stats.rejectedByCategory[cat] ?? 0;
  }

  return {
    reportType: 'client-generated-metadata',
    application: 'PII GUARD | Intelligent Data Privacy Platform',
    applicationVersion: '1.0.0',
    generatedAt: new Date().toISOString(),
    sanitizationMode: result.mode,
    fileType,
    aadhaarChecksumValidation: config.requireAadhaarChecksum,
    inputCharacterCount: result.stats.characterCount,
    inputByteCount: result.stats.byteCount,
    inputLineCount: result.stats.lineCount,
    totalDetectedEntities: result.stats.totalDetected,
    totalSanitizedEntities: result.stats.totalSanitized,
    validatedCandidates: result.stats.validatedCount,
    falsePositiveRejections: result.stats.rejectedFalsePositives,
    categoryCounts,
    rejectedByCategory,
    processingDurationMs: result.stats.processingDurationMs,
    privacyVerificationStatus: residualCheck.safe
      ? 'verified-local-only'
      : 'residual-pii-detected',
    privacyNotice:
      'Client-generated metadata only. Original document text, original PII values, and pseudonymization mappings are excluded.',
  };
}
