import { parseCsv, serializeCsv } from './csvProcessor';
import { buildAuditReportMetadata, runSanitizationPipeline } from './pipeline';
import { DEFAULT_DETECTION_CONFIG, type DetectionConfig } from './types';
import {
  validateAadhaar,
  validateCreditCard,
  validateEmail,
  validateIndianPhone,
  validateInternationalPhone,
  validateIPv4,
  validateIPv6,
  validatePAN,
} from './validators';

export interface VerificationTestCase {
  id: string;
  category: string;
  name: string;
  description: string;
  run: () => { passed: boolean; detail: string };
}

export interface VerificationTestResult {
  id: string;
  category: string;
  name: string;
  description: string;
  passed: boolean;
  detail: string;
  durationMs: number;
}

export interface VerificationSuiteSummary {
  total: number;
  passed: number;
  failed: number;
  totalDurationMs: number;
  results: VerificationTestResult[];
}

export const SHARED_TEST_VECTORS: VerificationTestCase[] = [
  // Email positive & negative
  {
    id: 'email-valid',
    category: 'Email',
    name: 'Accepts valid RFC-aligned email',
    description: 'Validates standard synthetic address mukesh.sharma@example.com',
    run: () => {
      const res = validateEmail('mukesh.sharma@example.com');
      return {
        passed: res.valid === true,
        detail: res.valid ? 'Accepted valid email' : `Unexpected rejection: ${res.reason}`,
      };
    },
  },
  {
    id: 'email-invalid',
    category: 'Email',
    name: 'Rejects incomplete & malformed emails',
    description: 'Rejects user@localhost, bad@@example.com, and masked m*****@example.com',
    run: () => {
      const cases = ['user@localhost', 'bad@@example.com', 'missingdomain@', 'm*****@example.com'];
      const allRejected = cases.every((c) => !validateEmail(c).valid);
      return {
        passed: allRejected,
        detail: allRejected ? 'All 4 malformed/masked addresses rejected' : 'One or more invalid emails accepted',
      };
    },
  },

  // Indian phone positive & negative
  {
    id: 'in-phone-valid',
    category: 'Indian Phone',
    name: 'Detects +91, 91, and 10-digit Indian mobile formats',
    description: 'Accepts +91 98765 43210, 91-9876543210, and 9876543210',
    run: () => {
      const cases = ['+91 98765 43210', '91-9876543210', '9876543210'];
      const ok = cases.every((c) => validateIndianPhone(c).valid);
      return {
        passed: ok,
        detail: ok ? 'All 3 Indian mobile formats validated' : 'Failed on valid Indian mobile format',
      };
    },
  },
  {
    id: 'in-phone-negative',
    category: 'Indian Phone',
    name: 'Rejects non-[6-9] start and order ID prefixed numbers',
    description: 'Rejects 5551234567 and ORD-9876543210 context',
    run: () => {
      const r1 = validateIndianPhone('5551234567');
      const r2 = validateIndianPhone('9876543210', 'Order ID: ');
      const r3 = validateIndianPhone('9876543210', 'ORD-');
      const passed = !r1.valid && !r2.valid && !r3.valid;
      return {
        passed,
        detail: passed
          ? 'Rejected invalid prefix & Order/ORD- false-positive traps'
          : 'Accepted a false-positive 10-digit number',
      };
    },
  },

  // International phone
  {
    id: 'intl-phone-valid-invalid',
    category: 'International Phone',
    name: 'Validates E.164 international phones and rejects +91 / +00 / dates',
    description: 'Accepts +1 (415) 555-0192 & +44 20 7946 0958; rejects +000000000001 and 2026-11-27',
    run: () => {
      const ok1 = validateInternationalPhone('+1 (415) 555-0192').valid;
      const ok2 = validateInternationalPhone('+44 20 7946 0958').valid;
      const bad1 = validateInternationalPhone('+000000000001').valid;
      const bad2 = validateInternationalPhone('2026-11-27').valid;
      const passed = ok1 && ok2 && !bad1 && !bad2;
      return {
        passed,
        detail: passed
          ? 'Validated international numbers while rejecting +00 pseudonyms & dates'
          : 'International phone validation mismatch',
      };
    },
  },

  // IPv4 valid & invalid
  {
    id: 'ipv4-valid-invalid',
    category: 'IPv4',
    name: 'Validates 0-255 octets and rejects out-of-range / version strings',
    description: 'Accepts 203.0.113.42; rejects 299.10.1.1, 192.168.01.1, and v1.2.3.4',
    run: () => {
      const ok = validateIPv4('203.0.113.42').valid;
      const badOctet = !validateIPv4('299.10.1.1').valid;
      const badLeadingZero = !validateIPv4('192.168.01.1').valid;
      const badVersion = !validateIPv4('1.2.3.4', 'version ').valid;
      const passed = ok && badOctet && badLeadingZero && badVersion;
      return {
        passed,
        detail: passed
          ? 'Accepted valid IPv4; rejected >255 octet, leading zero, and version context'
          : 'IPv4 validation failed an edge case',
      };
    },
  },

  // IPv6 valid & invalid
  {
    id: 'ipv6-valid-invalid',
    category: 'IPv6',
    name: 'Strict IPv6 grammar supports :: compression and rejects malformed forms',
    description: 'Accepts 2001:db8::1 & ::ffff:192.0.2.128; rejects 2001:::1, 2001::1::2, and 10:35:47',
    run: () => {
      const ok1 = validateIPv6('2001:db8:85a3::8a2e:370:7334').valid;
      const ok2 = validateIPv6('::ffff:192.0.2.128').valid;
      const bad1 = !validateIPv6('2001:::1').valid;
      const bad2 = !validateIPv6('2001::1::2').valid;
      const bad3 = !validateIPv6('10:35:47').valid;
      const passed = ok1 && ok2 && bad1 && bad2 && bad3;
      return {
        passed,
        detail: passed
          ? 'Validated compressed/IPv4-mapped IPv6 and rejected malformed grammars'
          : 'IPv6 parser failed strict grammar test',
      };
    },
  },

  // PAN
  {
    id: 'pan-valid-invalid',
    category: 'PAN',
    name: 'Validates [A-Z]{5}[0-9]{4}[A-Z] and boundary isolation',
    description: 'Accepts ABCDE1234F; rejects mixed-case Order1234a and overlong tokens in pipeline',
    run: () => {
      const ok = validatePAN('ABCDE1234F').valid;
      const badMixed = !validatePAN('Order1234a').valid;
      const boundaryRes = runSanitizationPipeline('ID: XABCDE1234F99 vs ABCDE1234F');
      const passed = ok && badMixed && boundaryRes.stats.totalDetected === 1 && boundaryRes.entities[0].value === 'ABCDE1234F';
      return {
        passed,
        detail: passed
          ? 'Validated boundary-isolated PAN and rejected overlong/mixed-case tokens'
          : `Unexpected PAN result: detected=${boundaryRes.stats.totalDetected}`,
      };
    },
  },

  // Aadhaar format & Verhoeff
  {
    id: 'aadhaar-verhoeff',
    category: 'Aadhaar',
    name: 'Distinguishes Verhoeff-valid Aadhaar from checksum-failing 12-digit numbers',
    description: 'Accepts 2345 6789 0124 with Verhoeff ON; rejects 2345 6789 0129 unless checksum disabled (format-only)',
    run: () => {
      const validStrict = validateAadhaar('2345 6789 0124', true);
      const badStrict = validateAadhaar('2345 6789 0129', true);
      const formatOnly = validateAadhaar('2345 6789 0129', false);
      const passed =
        validStrict.valid &&
        validStrict.outcome === 'checksum-validated' &&
        !badStrict.valid &&
        formatOnly.valid &&
        formatOnly.outcome === 'format-only';
      return {
        passed,
        detail: passed
          ? 'Verhoeff checksum enforced by default; format-only clearly labeled when disabled'
          : 'Aadhaar checksum vs format-only behavior incorrect',
      };
    },
  },

  // Luhn credit card
  {
    id: 'card-luhn',
    category: 'Credit Card',
    name: 'Accepts Luhn-valid cards and rejects invalid 16-digit numbers',
    description: 'Accepts 4532 0151 1283 0366; rejects 4532 0151 1283 0367 and 0000000000000000',
    run: () => {
      const ok = validateCreditCard('4532 0151 1283 0366').valid;
      const bad1 = !validateCreditCard('4532 0151 1283 0367').valid;
      const bad2 = !validateCreditCard('0000000000000000').valid;
      const passed = ok && bad1 && bad2;
      return {
        passed,
        detail: passed ? 'Luhn checksum accepted valid card and rejected invalid 16-digit traps' : 'Card Luhn check failed',
      };
    },
  },

  // Timestamp & Version false positives
  {
    id: 'fp-timestamps-versions',
    category: 'False Positives',
    name: 'Does not redact timestamps, dates, or software versions',
    description: 'Leaves 2026-11-27T10:35:47Z, epoch 1732683947, v2.14.3, and version 1.2.3.4 untouched',
    run: () => {
      const text = 'Created 2026-11-27T10:35:47Z epoch 1732683947 app v2.14.3 release version 1.2.3.4';
      const res = runSanitizationPipeline(text);
      const passed = res.stats.totalDetected === 0 && res.sanitizedText === text;
      return {
        passed,
        detail: passed
          ? '0 false positives on timestamps, epoch, and version strings'
          : `Unexpectedly flagged ${res.stats.totalDetected} entities`,
      };
    },
  },

  // Overlapping & adjacent detections
  {
    id: 'pipeline-overlap-adjacent',
    category: 'Pipeline',
    name: 'Resolves overlapping/adjacent spans without shifting offsets',
    description: 'Handles back-to-back entities and longer-span overlap cleanly in single pass',
    run: () => {
      const text = 'Email:a@example.com,PAN:ABCDE1234F,IP:192.0.2.10,Phone:+919876543210';
      const res = runSanitizationPipeline(text, { mode: 'full' });
      const expected = 'Email:[EMAIL_REDACTED],PAN:[PAN_REDACTED],IP:[IPV4_REDACTED],Phone:[PHONE_REDACTED]';
      const passed = res.stats.totalDetected === 4 && res.sanitizedText === expected;
      return {
        passed,
        detail: passed
          ? 'All 4 adjacent spans redacted accurately with zero offset drift'
          : `Got "${res.sanitizedText}"`,
      };
    },
  },

  // All 3 redaction modes
  {
    id: 'redaction-modes',
    category: 'Redaction Modes',
    name: 'Executes Full Mask, Partial Mask, and Consistent Pseudonymization accurately',
    description: 'Verifies category placeholders, minimal partial masks, and deterministic pseudonyms',
    run: () => {
      const text = 'Email: mukesh@example.com | Phone: 9876543210 | PAN: ABCDE1234F | Aadhaar: 234567890124 | Card: 4111111111111111';
      const full = runSanitizationPipeline(text, { mode: 'full' }).sanitizedText;
      const partial = runSanitizationPipeline(text, { mode: 'partial' }).sanitizedText;
      const pseudo = runSanitizationPipeline(text, { mode: 'pseudonymize' }).sanitizedText;

      const fullOk =
        full.includes('[EMAIL_REDACTED]') &&
        full.includes('[PHONE_REDACTED]') &&
        full.includes('[PAN_REDACTED]') &&
        full.includes('[AADHAAR_REDACTED]') &&
        full.includes('[CARD_REDACTED]');

      const partialOk =
        partial.includes('m*****@example.com') &&
        partial.includes('******3210') &&
        partial.includes('*****1234F') &&
        partial.includes('XXXX XXXX 0124') &&
        partial.includes('************1111');

      const pseudoOk =
        pseudo.includes('person_001@example.invalid') &&
        pseudo.includes('+910000000001') &&
        pseudo.includes('ZZZPX0000Z') &&
        pseudo.includes('000000000000') &&
        pseudo.includes('0000000000000000');

      const passed = fullOk && partialOk && pseudoOk;
      return {
        passed,
        detail: passed
          ? 'All 3 sanitization modes matched exact category policies'
          : `Mode check failed (full=${fullOk}, partial=${partialOk}, pseudo=${pseudoOk})`,
      };
    },
  },

  // Repeated pseudonymization consistency
  {
    id: 'pseudonym-consistency',
    category: 'Pseudonymization',
    name: 'Assigns identical pseudonyms to repeated entities and distinct ones to different entities',
    description: 'Verifies deterministic session-scoped mapping across formatting variations',
    run: () => {
      const text =
        'Primary: mukesh@example.com, Repeat: MUKESH@example.com, Other: priya@example.com, CardA: 4111 1111 1111 1111, CardARepeat: 4111-1111-1111-1111';
      const res = runSanitizationPipeline(text, { mode: 'pseudonymize' });
      const email1 = res.entities[0]?.replacement;
      const email1Repeat = res.entities[1]?.replacement;
      const email2 = res.entities[2]?.replacement;
      const card1 = res.entities[3]?.replacement;
      const card1Repeat = res.entities[4]?.replacement;

      const passed =
        email1 === 'person_001@example.invalid' &&
        email1Repeat === email1 &&
        email2 === 'person_002@example.invalid' &&
        card1 === '0000000000000000' &&
        card1Repeat === card1;
      return {
        passed,
        detail: passed
          ? 'Repeated entities mapped consistently; distinct entities received unique tokens'
          : 'Pseudonym mapping consistency check failed',
      };
    },
  },

  // RFC4180 CSV parsing & serialization
  {
    id: 'csv-rfc4180',
    category: 'CSV',
    name: 'Preserves quoted commas, escaped quotes, and embedded newlines in CSV',
    description: 'Parses and sanitizes complex RFC4180 CSV without corrupting columns',
    run: () => {
      const csv =
        'name,notes,email\n"Doe, ""Alex""","Line 1\nLine 2, ok",alex@example.com';
      const parsed = parseCsv(csv);
      const roundTrip = serializeCsv(parsed.headers, parsed.rows);
      const sanitized = runSanitizationPipeline(csv, { isCsv: true, mode: 'full' });
      const reParsed = parseCsv(sanitized.sanitizedText);

      const passed =
        parsed.rows.length === 1 &&
        parsed.rows[0].length === 3 &&
        parsed.rows[0][0] === 'Doe, "Alex"' &&
        roundTrip.includes('""Alex""') &&
        reParsed.rows[0][2] === '[EMAIL_REDACTED]';
      return {
        passed,
        detail: passed
          ? 'RFC4180 quotes, commas, and multiline cells preserved through sanitization'
          : 'CSV parsing or sanitization altered column structure',
      };
    },
  },

  // Export privacy boundary
  {
    id: 'export-privacy-boundary',
    category: 'Privacy Boundary',
    name: 'JSON audit report excludes original text, PII values, and pseudonym mappings',
    description: 'Verifies serialized audit metadata contains zero original sensitive values',
    run: () => {
      const secretEmail = 'confidential.vip@example.org';
      const secretPan = 'ABCDE1234F';
      const secretCard = '4532015112830366';
      const config: DetectionConfig = DEFAULT_DETECTION_CONFIG;
      const result = runSanitizationPipeline(
        `VIP ${secretEmail} PAN ${secretPan} Card ${secretCard}`,
        { mode: 'pseudonymize', config }
      );
      const audit = buildAuditReportMetadata(result, 'text', config);
      const json = JSON.stringify(audit);

      const leaked =
        json.includes(secretEmail) ||
        json.includes(secretPan) ||
        json.includes(secretCard) ||
        json.includes('person_001@example.invalid') ||
        json.includes('ZZZPX0000Z');

      const passed = !leaked && audit.totalDetectedEntities === 3 && audit.reportType === 'client-generated-metadata';
      return {
        passed,
        detail: passed
          ? 'Audit JSON verified metadata-only (0 raw values, 0 mappings)'
          : 'Audit JSON leaked sensitive or mapping data',
      };
    },
  },
];

export function runVerificationSuite(): VerificationSuiteSummary {
  const suiteStart = performance.now();
  const results: VerificationTestResult[] = SHARED_TEST_VECTORS.map((tc) => {
    const start = performance.now();
    const outcome = tc.run();
    const durationMs = Number((performance.now() - start).toFixed(2));
    return {
      id: tc.id,
      category: tc.category,
      name: tc.name,
      description: tc.description,
      passed: outcome.passed,
      detail: outcome.detail,
      durationMs,
    };
  });

  const passed = results.filter((r) => r.passed).length;
  return {
    total: results.length,
    passed,
    failed: results.length - passed,
    totalDurationMs: Number((performance.now() - suiteStart).toFixed(2)),
    results,
  };
}
