export type PiiCategory =
  | 'EMAIL'
  | 'INDIAN_PHONE'
  | 'INTL_PHONE'
  | 'IPV4'
  | 'IPV6'
  | 'PAN'
  | 'AADHAAR'
  | 'CREDIT_CARD';

export type SanitizationMode = 'full' | 'partial' | 'pseudonymize';

export type ValidationOutcome =
  | 'validated'
  | 'checksum-validated'
  | 'format-only'
  | 'rejected';

export interface DetectionConfig {
  enabledCategories: Record<PiiCategory, boolean>;
  requireAadhaarChecksum: boolean;
}

export interface PiiEntity {
  id: string;
  category: PiiCategory;
  start: number;
  end: number;
  /** Stored only in transient local memory during active processing; never exported or logged. */
  value: string;
  confidence: number;
  validationResult: Exclude<ValidationOutcome, 'rejected'>;
  replacement: string;
  explanation: string;
}

export interface RejectedCandidate {
  category: PiiCategory;
  start: number;
  end: number;
  reason: string;
}

export interface CategoryBreakdownItem {
  category: PiiCategory;
  label: string;
  detected: number;
  sanitized: number;
  rejected: number;
}

export interface DetectionStats {
  totalDetected: number;
  totalSanitized: number;
  validatedCount: number;
  rejectedFalsePositives: number;
  processingDurationMs: number;
  characterCount: number;
  lineCount: number;
  byteCount: number;
  categoryCounts: Record<PiiCategory, number>;
  rejectedByCategory: Record<PiiCategory, number>;
}

export interface SanitizationResult {
  sanitizedText: string;
  entities: PiiEntity[];
  rejectedCandidates: RejectedCandidate[];
  stats: DetectionStats;
  mode: SanitizationMode;
  isCsv: boolean;
  csvMeta?: {
    rowCount: number;
    columnCount: number;
    sanitizedCellCount: number;
    warnings: string[];
  };
}

export interface AuditReportMetadata {
  reportType: 'client-generated-metadata';
  application: string;
  applicationVersion: string;
  generatedAt: string;
  sanitizationMode: SanitizationMode;
  fileType: 'text' | 'txt' | 'csv';
  aadhaarChecksumValidation: boolean;
  inputCharacterCount: number;
  inputByteCount: number;
  inputLineCount: number;
  totalDetectedEntities: number;
  totalSanitizedEntities: number;
  validatedCandidates: number;
  falsePositiveRejections: number;
  categoryCounts: Record<PiiCategory, number>;
  rejectedByCategory: Record<PiiCategory, number>;
  processingDurationMs: number;
  privacyVerificationStatus: 'verified-local-only' | 'residual-pii-detected';
  privacyNotice: string;
}

export interface SampleDocument {
  id: string;
  title: string;
  description: string;
  fileType: 'txt' | 'csv';
  fileName: string;
  isSynthetic: true;
  highlights: string[];
  content: string;
}

export interface CsvParseResult {
  headers: string[];
  rows: string[][];
  warnings: string[];
  hasHeader: boolean;
}

export const ALL_PII_CATEGORIES: PiiCategory[] = [
  'EMAIL',
  'INDIAN_PHONE',
  'INTL_PHONE',
  'IPV4',
  'IPV6',
  'PAN',
  'AADHAAR',
  'CREDIT_CARD',
];

export const CATEGORY_LABELS: Record<PiiCategory, string> = {
  EMAIL: 'Email Address',
  INDIAN_PHONE: 'Indian Mobile',
  INTL_PHONE: 'International Phone',
  IPV4: 'IPv4 Address',
  IPV6: 'IPv6 Address',
  PAN: 'Indian PAN',
  AADHAAR: 'Aadhaar Number',
  CREDIT_CARD: 'Payment Card',
};

export const DEFAULT_DETECTION_CONFIG: DetectionConfig = {
  enabledCategories: {
    EMAIL: true,
    INDIAN_PHONE: true,
    INTL_PHONE: true,
    IPV4: true,
    IPV6: true,
    PAN: true,
    AADHAAR: true,
    CREDIT_CARD: true,
  },
  requireAadhaarChecksum: true,
};
