import type { ValidationOutcome } from './types';

export interface ValidationCheckResult {
  valid: boolean;
  outcome: ValidationOutcome;
  confidence: number;
  reason: string;
}

const VERHOEFF_D: readonly (readonly number[])[] = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
  [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
  [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
  [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
  [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
  [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
  [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
  [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
  [9, 8, 7, 6, 5, 4, 3, 2, 1, 0],
];

const VERHOEFF_P: readonly (readonly number[])[] = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
  [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
  [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
  [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
  [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
  [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
  [7, 0, 4, 6, 9, 1, 3, 2, 5, 8],
];

const VERHOEFF_INV: readonly number[] = [0, 4, 3, 2, 1, 5, 6, 7, 8, 9];

/** Computes the Verhoeff check digit for a numeric string (without check digit). */
export function computeVerhoeffCheckDigit(partialDigits: string): number {
  let c = 0;
  for (let i = 0; i < partialDigits.length; i += 1) {
    const digit = partialDigits.charCodeAt(partialDigits.length - 1 - i) - 48;
    c = VERHOEFF_D[c][VERHOEFF_P[(i + 1) % 8][digit]];
  }
  return VERHOEFF_INV[c];
}

/** Verifies a numeric string against the Verhoeff checksum algorithm. */
export function verifyVerhoeff(digits: string): boolean {
  if (!/^\d+$/.test(digits)) return false;
  let c = 0;
  for (let i = 0; i < digits.length; i += 1) {
    const digit = digits.charCodeAt(digits.length - 1 - i) - 48;
    c = VERHOEFF_D[c][VERHOEFF_P[i % 8][digit]];
  }
  return c === 0;
}

/** Verifies a numeric string against the Luhn mod-10 checksum algorithm. */
export function verifyLuhn(digits: string): boolean {
  if (!/^\d{13,19}$/.test(digits)) return false;
  if (/^(\d)\1+$/.test(digits)) return false;

  let sum = 0;
  let shouldDouble = false;
  for (let i = digits.length - 1; i >= 0; i -= 1) {
    let n = digits.charCodeAt(i) - 48;
    if (shouldDouble) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0;
}

export function validateEmail(candidate: string): ValidationCheckResult {
  const trimmed = candidate.trim();
  if (!trimmed || trimmed.length > 254) {
    return { valid: false, outcome: 'rejected', confidence: 0, reason: 'Email length out of range' };
  }
  const atIndex = trimmed.indexOf('@');
  if (atIndex <= 0 || atIndex !== trimmed.lastIndexOf('@')) {
    return { valid: false, outcome: 'rejected', confidence: 0, reason: 'Missing or multiple @ symbols' };
  }

  const local = trimmed.slice(0, atIndex);
  const domain = trimmed.slice(atIndex + 1);

  if (local.length > 64 || local.startsWith('.') || local.endsWith('.') || local.includes('..')) {
    return { valid: false, outcome: 'rejected', confidence: 0, reason: 'Malformed local email part' };
  }
  if (!/^[A-Za-z0-9.!#$%&'+/=?^_`{|}~-]+$/.test(local)) {
    return { valid: false, outcome: 'rejected', confidence: 0, reason: 'Unsupported characters in email local part' };
  }

  if (domain.length < 3 || domain.length > 253 || domain.startsWith('.') || domain.endsWith('.') || domain.includes('..')) {
    return { valid: false, outcome: 'rejected', confidence: 0, reason: 'Malformed email domain' };
  }
  const labels = domain.split('.');
  if (labels.length < 2) {
    return { valid: false, outcome: 'rejected', confidence: 0, reason: 'Email domain missing TLD' };
  }
  const labelPattern = /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?$/;
  if (!labels.every((label) => labelPattern.test(label))) {
    return { valid: false, outcome: 'rejected', confidence: 0, reason: 'Invalid email domain label' };
  }
  const tld = labels[labels.length - 1];
  if (!/^[A-Za-z]{2,24}$/.test(tld)) {
    return { valid: false, outcome: 'rejected', confidence: 0, reason: 'Invalid email TLD' };
  }

  return {
    valid: true,
    outcome: 'validated',
    confidence: 0.98,
    reason: 'RFC-aligned email syntax validated',
  };
}

const NON_PHONE_PREFIX_KEYWORDS =
  /\b(?:order|ord|invoice|inv|txn|transaction|ref|reference|ticket|epoch|timestamp|ts|build|ver|version|account|acct|tracking|serial|sku|doc|batch|id)\s*[:#=-]?\s*$/i;
const PHONE_CONTEXT_KEYWORDS =
  /\b(?:phone|mobile|mob|cell|tel|telephone|contact|call|whatsapp|sms|ph)\s*[:#=-]?\s*$/i;

export function validateIndianPhone(candidate: string, prefixContext = ''): ValidationCheckResult {
  const trimmed = candidate.trim();
  const digits = trimmed.replace(/\D/g, '');

  const hasExplicitIndiaPrefix = /^\+?91[\s().-]*[6-9]/.test(trimmed) || trimmed.startsWith('+91');

  let national10 = '';
  if (digits.length === 10) {
    national10 = digits;
  } else if (digits.length === 11 && digits.startsWith('0')) {
    national10 = digits.slice(1);
  } else if (digits.length === 12 && digits.startsWith('91')) {
    national10 = digits.slice(2);
  } else {
    return { valid: false, outcome: 'rejected', confidence: 0, reason: 'Invalid Indian phone digit count' };
  }

  if (!/^[6-9]\d{9}$/.test(national10)) {
    return {
      valid: false,
      outcome: 'rejected',
      confidence: 0,
      reason: 'Indian mobile number must begin with digits 6-9',
    };
  }

  if (/^(\d)\1{9}$/.test(national10)) {
    return {
      valid: false,
      outcome: 'rejected',
      confidence: 0,
      reason: 'Rejected uniform repeated-digit sequence',
    };
  }

  if (/[A-Za-z]-$/.test(prefixContext)) {
    return {
      valid: false,
      outcome: 'rejected',
      confidence: 0,
      reason: 'Rejected alphanumeric identifier suffix (e.g. ORD-9876543210)',
    };
  }

  if (!hasExplicitIndiaPrefix && NON_PHONE_PREFIX_KEYWORDS.test(prefixContext) && !PHONE_CONTEXT_KEYWORDS.test(prefixContext)) {
    return {
      valid: false,
      outcome: 'rejected',
      confidence: 0,
      reason: 'Rejected bare 10-digit number following non-phone identifier keyword',
    };
  }

  return {
    valid: true,
    outcome: 'validated',
    confidence: hasExplicitIndiaPrefix ? 0.98 : PHONE_CONTEXT_KEYWORDS.test(prefixContext) ? 0.95 : 0.88,
    reason: hasExplicitIndiaPrefix
      ? 'Validated +91/91 Indian mobile format'
      : 'Validated 10-digit Indian mobile range ([6-9]xxxxxxxxx)',
  };
}

export function validateInternationalPhone(candidate: string, prefixContext = ''): ValidationCheckResult {
  const trimmed = candidate.trim();

  if (!trimmed.startsWith('+') && !trimmed.startsWith('00')) {
    return {
      valid: false,
      outcome: 'rejected',
      confidence: 0,
      reason: 'International phone requires explicit + or 00 country prefix',
    };
  }

  if (/^\+?(?:91|0091)(?:[\s().-]|$)/.test(trimmed) || /^\+?91[6-9]\d{9}$/.test(trimmed.replace(/[\s().-]/g, ''))) {
    return {
      valid: false,
      outcome: 'rejected',
      confidence: 0,
      reason: 'Handled by Indian phone detector',
    };
  }

  // Reject synthetic placeholder +00... pseudonyms or invalid country code +0
  if (/^\+0/.test(trimmed)) {
    return {
      valid: false,
      outcome: 'rejected',
      confidence: 0,
      reason: 'Invalid country calling code starting with 0',
    };
  }

  // Reject ISO date or version-like forms
  if (/^\d{4}[-/]\d{2}[-/]\d{2}/.test(trimmed) || /\b(?:v|ver|version)\s*$/i.test(prefixContext)) {
    return {
      valid: false,
      outcome: 'rejected',
      confidence: 0,
      reason: 'Rejected date or version string',
    };
  }

  const digits = trimmed.replace(/\D/g, '');
  const normalizedDigits = trimmed.startsWith('00') ? digits.slice(2) : digits;

  if (normalizedDigits.length < 8 || normalizedDigits.length > 15) {
    return {
      valid: false,
      outcome: 'rejected',
      confidence: 0,
      reason: 'E.164 international number must contain 8-15 digits',
    };
  }

  if (/^(\d)\1+$/.test(normalizedDigits)) {
    return {
      valid: false,
      outcome: 'rejected',
      confidence: 0,
      reason: 'Rejected uniform repeated-digit sequence',
    };
  }

  // Require at least one separator OR explicit E.164 structure of 9-15 digits
  const hasSeparator = /[\s().-]/.test(trimmed);
  if (!hasSeparator && normalizedDigits.length < 9) {
    return {
      valid: false,
      outcome: 'rejected',
      confidence: 0,
      reason: 'Insufficient length for unformatted international number',
    };
  }

  return {
    valid: true,
    outcome: 'validated',
    confidence: 0.94,
    reason: 'Validated E.164 international phone structure',
  };
}

export function validateIPv4(candidate: string, prefixContext = ''): ValidationCheckResult {
  const trimmed = candidate.trim();
  if (/(?:^|\s)(?:v|ver|version|release|rel|build)\s*\.?\s*$/i.test(prefixContext) || /v$/i.test(prefixContext)) {
    return {
      valid: false,
      outcome: 'rejected',
      confidence: 0,
      reason: 'Rejected software version pattern',
    };
  }

  const octets = trimmed.split('.');
  if (octets.length !== 4) {
    return { valid: false, outcome: 'rejected', confidence: 0, reason: 'IPv4 must have exactly 4 octets' };
  }

  for (const octet of octets) {
    if (!/^(?:0|[1-9]\d{0,2})$/.test(octet)) {
      return { valid: false, outcome: 'rejected', confidence: 0, reason: 'Invalid octet format or leading zero' };
    }
    const num = Number(octet);
    if (num < 0 || num > 255) {
      return { valid: false, outcome: 'rejected', confidence: 0, reason: `Octet ${num} exceeds 255` };
    }
  }

  return {
    valid: true,
    outcome: 'validated',
    confidence: 0.97,
    reason: 'All 4 IPv4 octets validated in 0-255 range',
  };
}

export function validateIPv6(candidate: string): ValidationCheckResult {
  const trimmed = candidate.trim();
  if (!trimmed.includes(':') || trimmed.length < 3 || trimmed.length > 45) {
    return { valid: false, outcome: 'rejected', confidence: 0, reason: 'Invalid IPv6 length or separator' };
  }

  if (trimmed.includes(':::')) {
    return { valid: false, outcome: 'rejected', confidence: 0, reason: 'Invalid triple-colon in IPv6' };
  }

  const doubleColonSplit = trimmed.split('::');
  if (doubleColonSplit.length > 2) {
    return { valid: false, outcome: 'rejected', confidence: 0, reason: 'Multiple :: compressions in IPv6' };
  }

  const parseSegmentList = (raw: string, allowTrailingIpv4: boolean): number | null => {
    if (!raw) return 0;
    const parts = raw.split(':');
    let groupCount = 0;

    for (let i = 0; i < parts.length; i += 1) {
      const part = parts[i];
      if (!part) return null;

      if (part.includes('.')) {
        if (!allowTrailingIpv4 || i !== parts.length - 1) return null;
        const ipv4Res = validateIPv4(part);
        if (!ipv4Res.valid) return null;
        groupCount += 2;
      } else {
        if (!/^[0-9a-fA-F]{1,4}$/.test(part)) return null;
        groupCount += 1;
      }
    }

    return groupCount;
  };

  if (doubleColonSplit.length === 2) {
    const [leftRaw, rightRaw] = doubleColonSplit;
    if (!leftRaw && !rightRaw) {
      return { valid: false, outcome: 'rejected', confidence: 0, reason: 'Rejected bare :: token' };
    }
    const leftCount = parseSegmentList(leftRaw, false);
    const rightCount = parseSegmentList(rightRaw, true);
    if (leftCount === null || rightCount === null) {
      return { valid: false, outcome: 'rejected', confidence: 0, reason: 'Malformed IPv6 hextet' };
    }
    if (leftCount + rightCount >= 8) {
      return { valid: false, outcome: 'rejected', confidence: 0, reason: 'Compressed IPv6 exceeds 7 explicit groups' };
    }
    return {
      valid: true,
      outcome: 'validated',
      confidence: 0.98,
      reason: 'Strict compressed IPv6 grammar validated',
    };
  }

  const totalCount = parseSegmentList(trimmed, true);
  if (totalCount !== 8) {
    return { valid: false, outcome: 'rejected', confidence: 0, reason: 'Uncompressed IPv6 must contain 8 groups' };
  }

  return {
    valid: true,
    outcome: 'validated',
    confidence: 0.99,
    reason: 'Strict 8-group IPv6 grammar validated',
  };
}

export function validatePAN(candidate: string): ValidationCheckResult {
  const trimmed = candidate.trim();
  // Reject mixed-case camelCase words like Order1234a; accept uppercase or full lowercase normalized to uppercase
  const isAllUpper = /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(trimmed);
  const isAllLower = /^[a-z]{5}[0-9]{4}[a-z]$/.test(trimmed);
  if (!isAllUpper && !isAllLower) {
    return {
      valid: false,
      outcome: 'rejected',
      confidence: 0,
      reason: 'PAN must match [A-Z]{5}[0-9]{4}[A-Z] without mixed-case tokens',
    };
  }

  const normalized = trimmed.toUpperCase();
  if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(normalized)) {
    return { valid: false, outcome: 'rejected', confidence: 0, reason: 'Invalid PAN structure' };
  }

  return {
    valid: true,
    outcome: 'validated',
    confidence: isAllUpper ? 0.96 : 0.86,
    reason: isAllUpper
      ? 'Validated Indian PAN format ([A-Z]{5}[0-9]{4}[A-Z])'
      : 'Validated uppercase-normalized Indian PAN format',
  };
}

export function validateAadhaar(
  candidate: string,
  requireChecksum = true
): ValidationCheckResult {
  const trimmed = candidate.trim();
  const formatMatch = /^(?:\d{12}|\d{4}\s\d{4}\s\d{4}|\d{4}-\d{4}-\d{4})$/.test(trimmed);
  if (!formatMatch) {
    return {
      valid: false,
      outcome: 'rejected',
      confidence: 0,
      reason: 'Aadhaar must be 12 continuous, spaced, or hyphenated digits',
    };
  }

  const digits = trimmed.replace(/\D/g, '');
  if (/^(\d)\1{11}$/.test(digits)) {
    return {
      valid: false,
      outcome: 'rejected',
      confidence: 0,
      reason: 'Rejected uniform dummy 12-digit sequence',
    };
  }

  if (digits.startsWith('0') || digits.startsWith('1')) {
    return {
      valid: false,
      outcome: 'rejected',
      confidence: 0,
      reason: 'Aadhaar numbers do not start with 0 or 1',
    };
  }

  const checksumOk = verifyVerhoeff(digits);
  if (requireChecksum && !checksumOk) {
    return {
      valid: false,
      outcome: 'rejected',
      confidence: 0,
      reason: 'Failed Verhoeff checksum validation',
    };
  }

  if (checksumOk) {
    return {
      valid: true,
      outcome: 'checksum-validated',
      confidence: 0.98,
      reason: 'Format and Verhoeff checksum validated (structural check only)',
    };
  }

  return {
    valid: true,
    outcome: 'format-only',
    confidence: 0.72,
    reason: 'Format-only match (Verhoeff checksum validation disabled)',
  };
}

export function validateCreditCard(candidate: string): ValidationCheckResult {
  const trimmed = candidate.trim();
  if (!/^\d(?:[\s-]?\d){12,18}$/.test(trimmed)) {
    return {
      valid: false,
      outcome: 'rejected',
      confidence: 0,
      reason: 'Card number must be 13-19 digits with optional spaces or hyphens',
    };
  }

  const digits = trimmed.replace(/\D/g, '');
  if (digits.length < 13 || digits.length > 19) {
    return {
      valid: false,
      outcome: 'rejected',
      confidence: 0,
      reason: 'Card digit length outside 13-19 range',
    };
  }

  if (/^(\d)\1+$/.test(digits)) {
    return {
      valid: false,
      outcome: 'rejected',
      confidence: 0,
      reason: 'Rejected uniform zero/repeated digit sequence',
    };
  }

  if (!verifyLuhn(digits)) {
    return {
      valid: false,
      outcome: 'rejected',
      confidence: 0,
      reason: 'Failed Luhn mod-10 checksum validation',
    };
  }

  return {
    valid: true,
    outcome: 'checksum-validated',
    confidence: 0.99,
    reason: 'Luhn mod-10 checksum validated',
  };
}
