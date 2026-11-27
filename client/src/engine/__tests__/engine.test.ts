import { describe, expect, it } from 'vitest';
import { parseCsv, serializeCsv } from '../csvProcessor';
import {
  buildAuditReportMetadata,
  resolveOverlaps,
  runSanitizationPipeline,
  verifyZeroResidualPii,
} from '../pipeline';
import { SYNTHETIC_SAMPLES } from '../samples';
import { runVerificationSuite, SHARED_TEST_VECTORS } from '../testVectors';
import { DEFAULT_DETECTION_CONFIG } from '../types';
import {
  computeVerhoeffCheckDigit,
  validateAadhaar,
  validateCreditCard,
  validateEmail,
  validateIndianPhone,
  validateInternationalPhone,
  validateIPv4,
  validateIPv6,
  validatePAN,
  verifyLuhn,
  verifyVerhoeff,
} from '../validators';

describe('PII Validators', () => {
  it('validates emails and rejects incomplete/masked addresses', () => {
    expect(validateEmail('mukesh@example.com').valid).toBe(true);
    expect(validateEmail('first.last+tag@sub.domain.org').valid).toBe(true);
    expect(validateEmail('incomplete@').valid).toBe(false);
    expect(validateEmail('user@localhost').valid).toBe(false);
    expect(validateEmail('bad..dot@example.com').valid).toBe(false);
    expect(validateEmail('m*****@example.com').valid).toBe(false);
  });

  it('validates Indian mobile numbers and rejects non-phone traps', () => {
    expect(validateIndianPhone('+91 98765 43210').valid).toBe(true);
    expect(validateIndianPhone('91-9876543210').valid).toBe(true);
    expect(validateIndianPhone('9876543210').valid).toBe(true);
    expect(validateIndianPhone('5876543210').valid).toBe(false);
    expect(validateIndianPhone('9999999999').valid).toBe(false);
    expect(validateIndianPhone('9876543210', 'Order ID: ').valid).toBe(false);
    expect(validateIndianPhone('9876543210', 'ORD-').valid).toBe(false);
  });

  it('validates international phones and rejects +91 / +00 / dates', () => {
    expect(validateInternationalPhone('+1 (415) 555-0192').valid).toBe(true);
    expect(validateInternationalPhone('+44 20 7946 0958').valid).toBe(true);
    expect(validateInternationalPhone('0044 20 7946 0958').valid).toBe(true);
    expect(validateInternationalPhone('+91 98765 43210').valid).toBe(false);
    expect(validateInternationalPhone('+000000000001').valid).toBe(false);
    expect(validateInternationalPhone('2026-11-27').valid).toBe(false);
  });

  it('validates IPv4 octets strictly and rejects versions / out-of-range', () => {
    expect(validateIPv4('192.0.2.1').valid).toBe(true);
    expect(validateIPv4('0.0.0.0').valid).toBe(true);
    expect(validateIPv4('255.255.255.255').valid).toBe(true);
    expect(validateIPv4('256.1.1.1').valid).toBe(false);
    expect(validateIPv4('192.168.01.1').valid).toBe(false);
    expect(validateIPv4('1.2.3.4', 'v').valid).toBe(false);
    expect(validateIPv4('2.14.3.0', 'version ').valid).toBe(false);
  });

  it('validates IPv6 strict grammar including compression and embedded IPv4', () => {
    expect(validateIPv6('2001:0db8:85a3:0000:0000:8a2e:0370:7334').valid).toBe(true);
    expect(validateIPv6('2001:db8::1').valid).toBe(true);
    expect(validateIPv6('::1').valid).toBe(true);
    expect(validateIPv6('::ffff:192.0.2.128').valid).toBe(true);
    expect(validateIPv6('2001:::1').valid).toBe(false);
    expect(validateIPv6('2001::1::2').valid).toBe(false);
    expect(validateIPv6('10:35:47').valid).toBe(false);
    expect(validateIPv6('::').valid).toBe(false);
  });

  it('validates PAN format and rejects mixed-case tokens', () => {
    expect(validatePAN('ABCDE1234F').valid).toBe(true);
    expect(validatePAN('abcde1234f').valid).toBe(true);
    expect(validatePAN('Order1234a').valid).toBe(false);
    expect(validatePAN('ABC1234F').valid).toBe(false);
  });

  it('validates Aadhaar with Verhoeff checksum and supports format-only toggle', () => {
    const check = computeVerhoeffCheckDigit('23456789012');
    expect(check).toBe(4);
    expect(verifyVerhoeff('234567890124')).toBe(true);
    expect(verifyVerhoeff('234567890129')).toBe(false);

    expect(validateAadhaar('2345 6789 0124', true).outcome).toBe('checksum-validated');
    expect(validateAadhaar('2345-6789-0124', true).valid).toBe(true);
    expect(validateAadhaar('2345 6789 0129', true).valid).toBe(false);
    expect(validateAadhaar('2345 6789 0129', false).outcome).toBe('format-only');
    expect(validateAadhaar('000000000000', false).valid).toBe(false);
  });

  it('validates payment cards using Luhn checksum and rejects arbitrary 16-digit numbers', () => {
    expect(verifyLuhn('4532015112830366')).toBe(true);
    expect(verifyLuhn('4532015112830367')).toBe(false);
    expect(validateCreditCard('4532 0151 1283 0366').valid).toBe(true);
    expect(validateCreditCard('3782-822463-10005').valid).toBe(true);
    expect(validateCreditCard('4532 0151 1283 0367').valid).toBe(false);
    expect(validateCreditCard('0000 0000 0000 0000').valid).toBe(false);
  });
});

describe('Detection Pipeline, Overlaps, and Redaction Modes', () => {
  it('resolves overlapping candidates deterministically without offset shifts', () => {
    const resolved = resolveOverlaps([
      {
        category: 'IPV4',
        start: 10,
        end: 19,
        value: '1.2.3.4',
        confidence: 0.9,
        validationResult: 'validated',
        explanation: 'test',
      },
      {
        category: 'EMAIL',
        start: 0,
        end: 23,
        value: 'user@sub.1.2.3.4.com',
        confidence: 0.98,
        validationResult: 'validated',
        explanation: 'test',
      },
    ]);
    expect(resolved).toHaveLength(1);
    expect(resolved[0].category).toBe('EMAIL');
  });

  it('rejects false positives across timestamps, versions, order IDs, and invalid IPs/cards', () => {
    const doc =
      'Time 2026-11-27T10:35:47Z epoch 1732683947 app v2.14.3.1 ORD-9876543210 badIP 299.10.1.1 badCard 4532015112830367';
    const res = runSanitizationPipeline(doc);
    expect(res.stats.totalDetected).toBe(0);
    expect(res.stats.rejectedFalsePositives).toBeGreaterThanOrEqual(2);
    expect(res.sanitizedText).toBe(doc);
  });

  it('maintains consistent pseudonymization within a session and resets between runs', () => {
    const doc = 'A: mukesh@example.com, B: MUKESH@example.com, C: other@example.com';
    const res1 = runSanitizationPipeline(doc, { mode: 'pseudonymize' });
    expect(res1.entities[0].replacement).toBe('person_001@example.invalid');
    expect(res1.entities[1].replacement).toBe('person_001@example.invalid');
    expect(res1.entities[2].replacement).toBe('person_002@example.invalid');

    const res2 = runSanitizationPipeline('C: other@example.com', { mode: 'pseudonymize' });
    expect(res2.entities[0].replacement).toBe('person_001@example.invalid');
  });

  it('processes all synthetic samples accurately with zero leftover full-mask PII', () => {
    for (const sample of SYNTHETIC_SAMPLES) {
      const res = runSanitizationPipeline(sample.content, {
        mode: 'full',
        isCsv: sample.fileType === 'csv',
      });
      expect(res.stats.totalDetected).toBeGreaterThan(0);
      const residual = verifyZeroResidualPii(res.sanitizedText, DEFAULT_DETECTION_CONFIG);
      expect(residual.safe).toBe(true);
    }
  });
});

describe('RFC4180 CSV Processor', () => {
  it('parses and serializes quoted commas, escaped quotes, and multiline cells', () => {
    const raw =
      'id,customer,notes,email\r\n1,"Nair, ""Aarav""","Line 1\r\nLine 2, urgent",aarav@example.com';
    const parsed = parseCsv(raw);
    expect(parsed.headers).toEqual(['id', 'customer', 'notes', 'email']);
    expect(parsed.rows).toHaveLength(1);
    expect(parsed.rows[0][1]).toBe('Nair, "Aarav"');
    expect(parsed.rows[0][2]).toBe('Line 1\r\nLine 2, urgent');

    const sanitized = runSanitizationPipeline(raw, { isCsv: true, mode: 'full' });
    const reParsed = parseCsv(sanitized.sanitizedText);
    expect(reParsed.rows[0][1]).toBe('Nair, "Aarav"');
    expect(reParsed.rows[0][3]).toBe('[EMAIL_REDACTED]');

    const serialized = serializeCsv(parsed.headers, parsed.rows);
    expect(serialized).toContain('"Nair, ""Aarav"""');
  });

  it('handles malformed CSV gracefully with warnings instead of throwing', () => {
    const malformed = 'col1,col2\n"unclosed quote,val2\nextra,col2,col3';
    const parsed = parseCsv(malformed);
    expect(parsed.warnings.length).toBeGreaterThan(0);
    expect(parsed.rows.length).toBeGreaterThan(0);
  });
});

describe('Privacy Boundary, Audit JSON, Shared Test Vectors, and Large Input', () => {
  it('excludes all original text, raw PII, and pseudonym mappings from Audit JSON', () => {
    const rawEmail = 'secret.exec@example.org';
    const rawCard = '4532015112830366';
    const rawPan = 'ABCDE1234F';
    const res = runSanitizationPipeline(
      `Contact ${rawEmail} card ${rawCard} pan ${rawPan}`,
      { mode: 'pseudonymize' }
    );
    const audit = buildAuditReportMetadata(res, 'txt', DEFAULT_DETECTION_CONFIG);
    const serialized = JSON.stringify(audit);

    expect(serialized).not.toContain(rawEmail);
    expect(serialized).not.toContain(rawCard);
    expect(serialized).not.toContain(rawPan);
    expect(serialized).not.toContain('person_001@example.invalid');
    expect(serialized).not.toContain('ZZZPX0000Z');
    expect(audit.totalDetectedEntities).toBe(3);
  });

  it('passes all shared verification test vectors used by the in-app Verification Suite', () => {
    const summary = runVerificationSuite();
    expect(summary.total).toBe(SHARED_TEST_VECTORS.length);
    expect(summary.results.filter((r) => !r.passed)).toEqual([]);
    expect(summary.failed).toBe(0);
    expect(summary.passed).toBe(summary.total);
  });

  it('processes > 60,000 character synthetic documents accurately and quickly', () => {
    const chunk =
      'Ticket note: user.demo@example.com | +91 98765 43210 | 203.0.113.42 | ABCDE1234F | v1.2.3\n';
    const largeDoc = chunk.repeat(750); // > 60,000 chars
    expect(largeDoc.length).toBeGreaterThan(50_000);

    const res = runSanitizationPipeline(largeDoc, { mode: 'full' });
    expect(res.stats.totalDetected).toBe(750 * 4);
    expect(res.stats.processingDurationMs).toBeLessThan(3000);
    expect(verifyZeroResidualPii(res.sanitizedText).safe).toBe(true);
  });

  it('handles empty input and masks IPv4, IPv6, and Intl Phone in partial & pseudonym modes', () => {
    const empty = runSanitizationPipeline('');
    expect(empty.sanitizedText).toBe('');
    expect(empty.stats.totalDetected).toBe(0);

    const netDoc = 'IP4: 203.0.113.42 IP6: 2001:db8::42 Intl: +44 20 7946 0958';
    const partial = runSanitizationPipeline(netDoc, { mode: 'partial' });
    expect(partial.sanitizedText).toContain('203.xxx.xxx.42');
    expect(partial.sanitizedText).toContain('2001:xxxx::xxxx');
    expect(partial.sanitizedText).toContain('******0958');

    const pseudo = runSanitizationPipeline(netDoc, { mode: 'pseudonymize' });
    expect(pseudo.sanitizedText).toContain('192.0.0.1');
    expect(pseudo.sanitizedText).toContain('2001:db8::1');
    expect(pseudo.sanitizedText).toContain('+000000000001');
  });
});
