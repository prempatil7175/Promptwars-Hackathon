import type {
  DetectionConfig,
  PiiCategory,
  RejectedCandidate,
  ValidationOutcome,
} from './types';
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

export interface ValidatedCandidate {
  category: PiiCategory;
  start: number;
  end: number;
  value: string;
  confidence: number;
  validationResult: Exclude<ValidationOutcome, 'rejected'>;
  explanation: string;
}

export interface DetectionScanResult {
  candidates: ValidatedCandidate[];
  rejected: RejectedCandidate[];
}

function getPrefixContext(text: string, start: number, windowSize = 24): string {
  const from = Math.max(0, start - windowSize);
  return text.slice(from, start);
}

function trimMatchBounds(
  text: string,
  rawStart: number,
  rawValue: string
): { start: number; end: number; value: string } {
  let start = rawStart;
  let end = rawStart + rawValue.length;

  while (start < end && /\s/.test(text[start])) {
    start += 1;
  }
  while (end > start && /[\s.,;:!?)]/.test(text[end - 1])) {
    // Preserve closing ')' if balanced with '(' inside phone number
    if (text[end - 1] === ')') {
      const slice = text.slice(start, end);
      const opens = (slice.match(/\(/g) || []).length;
      const closes = (slice.match(/\)/g) || []).length;
      if (opens >= closes) break;
    }
    end -= 1;
  }

  return { start, end, value: text.slice(start, end) };
}

export function scanDocumentCandidates(
  text: string,
  config: DetectionConfig
): DetectionScanResult {
  const candidates: ValidatedCandidate[] = [];
  const rejected: RejectedCandidate[] = [];

  if (!text) {
    return { candidates, rejected };
  }

  const recordMatch = (
    category: PiiCategory,
    start: number,
    end: number,
    value: string,
    check: ReturnType<typeof validateEmail>
  ) => {
    if (check.valid && check.outcome !== 'rejected') {
      candidates.push({
        category,
        start,
        end,
        value,
        confidence: check.confidence,
        validationResult: check.outcome,
        explanation: check.reason,
      });
    } else {
      rejected.push({
        category,
        start,
        end,
        reason: check.reason,
      });
    }
  };

  // 1. EMAIL
  if (config.enabledCategories.EMAIL) {
    const emailRegex =
      /(?<![A-Za-z0-9.!#$%&'+/=?^_`{|}~-])([A-Za-z0-9.!#$%&'+/=?^_`{|}~-]+@[A-Za-z0-9.-]+)/g;
    for (const match of text.matchAll(emailRegex)) {
      const idx = match.index ?? 0;
      const { start, end, value } = trimMatchBounds(text, idx, match[1]);
      if (!value) continue;
      recordMatch('EMAIL', start, end, value, validateEmail(value));
    }
  }

  // 2. IPV6 (must precede IPV4 to avoid matching embedded IPv4 suffix inside ::ffff:x.x.x.x twice)
  if (config.enabledCategories.IPV6) {
    const ipv6Regex =
      /(?<![A-Za-z0-9:])([0-9A-Za-z.:]*:[0-9A-Za-z.:]*:[0-9A-Za-z.:]*)(?![A-Za-z0-9:])/g;
    for (const match of text.matchAll(ipv6Regex)) {
      const idx = match.index ?? 0;
      const { start, end, value } = trimMatchBounds(text, idx, match[1]);
      if (!value) continue;
      // Ignore wall-clock timestamps like 10:35:47 or 23:59:59.123
      if (/^\d{1,2}:\d{2}:\d{2}(?:\.\d+)?$/.test(value)) continue;
      // Ignore C++/Rust scope resolution like std::vector::push_back
      if (/^[A-Za-z_][A-Za-z0-9_]*::/.test(value) && !/^[0-9a-fA-F]{1,4}::/.test(value)) continue;
      recordMatch('IPV6', start, end, value, validateIPv6(value));
    }
  }

  // 3. IPV4
  if (config.enabledCategories.IPV4) {
    const ipv4Regex = /(?<![\d.])(\d{1,3}(?:\.\d{1,3}){3})(?![\d.])/g;
    for (const match of text.matchAll(ipv4Regex)) {
      const idx = match.index ?? 0;
      const raw = match[1];
      const prefix = getPrefixContext(text, idx);
      recordMatch('IPV4', idx, idx + raw.length, raw, validateIPv4(raw, prefix));
    }
  }

  // 4. PAN
  if (config.enabledCategories.PAN) {
    const panRegex = /(?<![A-Za-z0-9])([A-Za-z]{5}[0-9]{4}[A-Za-z])(?![A-Za-z0-9])/g;
    for (const match of text.matchAll(panRegex)) {
      const idx = match.index ?? 0;
      const raw = match[1];
      recordMatch('PAN', idx, idx + raw.length, raw, validatePAN(raw));
    }
  }

  // 5. CREDIT_CARD (13-19 digits, spaces/hyphens on single line)
  if (config.enabledCategories.CREDIT_CARD) {
    const cardRegex = /(?<![\d-])(\d(?:[ \t-]?\d){12,18})(?![\d-])/g;
    for (const match of text.matchAll(cardRegex)) {
      const idx = match.index ?? 0;
      const raw = match[1];
      const digitsOnly = raw.replace(/\D/g, '');
      // Do not treat +91 or +00 prefixed phones or 12-digit Aadhaars as card candidates
      const prefix = getPrefixContext(text, idx, 4);
      if (prefix.endsWith('+')) continue;
      if (digitsOnly.length < 13 || digitsOnly.length > 19) continue;
      recordMatch('CREDIT_CARD', idx, idx + raw.length, raw, validateCreditCard(raw));
    }
  }

  // 6. AADHAAR (12 digits continuous, spaced, or hyphenated)
  if (config.enabledCategories.AADHAAR) {
    const aadhaarRegex = /(?<![\d.+-])(\d{4}[ -]\d{4}[ -]\d{4}|\d{12})(?![\d.-])/g;
    for (const match of text.matchAll(aadhaarRegex)) {
      const idx = match.index ?? 0;
      const raw = match[1];
      recordMatch(
        'AADHAAR',
        idx,
        idx + raw.length,
        raw,
        validateAadhaar(raw, config.requireAadhaarChecksum)
      );
    }
  }

  // 7. INDIAN_PHONE
  if (config.enabledCategories.INDIAN_PHONE) {
    const indianPhoneRegex =
      /(?<![\dA-Za-z+])((?:\(\+?91\)|\+?91|0)?[ \t().-]*[0-9](?:[ \t().-]*\d){9})(?![\dA-Za-z])/g;
    for (const match of text.matchAll(indianPhoneRegex)) {
      const idx = match.index ?? 0;
      const { start, end, value } = trimMatchBounds(text, idx, match[1]);
      if (!value) continue;

      const prefix = getPrefixContext(text, start);
      const digits = value.replace(/\D/g, '');
      const hasExplicitPrefix = /^\+?91|^\(\+?91\)/.test(value);

      // Avoid treating ISO timestamps/dates/non-phone 10-digit epochs unless explicitly labeled phone or +91
      if (!hasExplicitPrefix && !/^[6-9]/.test(digits) && !/\b(?:phone|mobile|tel|contact)\s*[:=-]?\s*$/i.test(prefix)) {
        continue;
      }

      // Skip if hyphenated like 2026-11-27 or 1234-56-7890 date pattern
      if (/^\d{4}[-/]\d{2}[-/]\d{2}$/.test(value)) continue;

      recordMatch('INDIAN_PHONE', start, end, value, validateIndianPhone(value, prefix));
    }
  }

  // 8. INTL_PHONE
  if (config.enabledCategories.INTL_PHONE) {
    const intlPhoneRegex =
      /(?<![\dA-Za-z+])((?:\+|00)[0-9]{1,3}(?:[ \t().-]*\d){6,13})(?![\dA-Za-z])/g;
    for (const match of text.matchAll(intlPhoneRegex)) {
      const idx = match.index ?? 0;
      const { start, end, value } = trimMatchBounds(text, idx, match[1]);
      if (!value) continue;

      // Skip +91 handled by INDIAN_PHONE
      const compact = value.replace(/[\s().-]/g, '');
      if (compact.startsWith('+91') || compact.startsWith('0091')) continue;

      const prefix = getPrefixContext(text, start);
      recordMatch('INTL_PHONE', start, end, value, validateInternationalPhone(value, prefix));
    }
  }

  return { candidates, rejected };
}
