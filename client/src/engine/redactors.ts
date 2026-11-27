import type { PiiCategory, SanitizationMode } from './types';

const FULL_MASK_MAP: Record<PiiCategory, string> = {
  EMAIL: '[EMAIL_REDACTED]',
  INDIAN_PHONE: '[PHONE_REDACTED]',
  INTL_PHONE: '[INTL_PHONE_REDACTED]',
  IPV4: '[IPV4_REDACTED]',
  IPV6: '[IPV6_REDACTED]',
  PAN: '[PAN_REDACTED]',
  AADHAAR: '[AADHAAR_REDACTED]',
  CREDIT_CARD: '[CARD_REDACTED]',
};

/** Normalizes an entity value for collision-safe session pseudonym deduplication. */
export function normalizeForMappingKey(category: PiiCategory, value: string): string {
  const trimmed = value.trim();
  switch (category) {
    case 'EMAIL':
      return trimmed.toLowerCase();
    case 'PAN':
      return trimmed.toUpperCase();
    case 'INDIAN_PHONE': {
      const digits = trimmed.replace(/\D/g, '');
      return digits.length >= 10 ? digits.slice(-10) : digits;
    }
    case 'INTL_PHONE':
    case 'AADHAAR':
    case 'CREDIT_CARD':
      return trimmed.replace(/\D/g, '');
    case 'IPV4':
    case 'IPV6':
      return trimmed.toLowerCase();
  }
}

export function maskPartial(category: PiiCategory, value: string): string {
  const trimmed = value.trim();

  switch (category) {
    case 'EMAIL': {
      const atIdx = trimmed.indexOf('@');
      if (atIdx <= 0) return FULL_MASK_MAP.EMAIL;
      const local = trimmed.slice(0, atIdx);
      const domain = trimmed.slice(atIdx);
      return `${local[0]}*****${domain}`;
    }
    case 'INDIAN_PHONE':
    case 'INTL_PHONE': {
      const digits = trimmed.replace(/\D/g, '');
      if (digits.length < 4) return FULL_MASK_MAP[category];
      return `******${digits.slice(-4)}`;
    }
    case 'IPV4': {
      const parts = trimmed.split('.');
      if (parts.length !== 4) return FULL_MASK_MAP.IPV4;
      return `${parts[0]}.xxx.xxx.${parts[3]}`;
    }
    case 'IPV6': {
      const firstSeg = trimmed.split(':')[0] || 'xxxx';
      return `${firstSeg}:xxxx::xxxx`;
    }
    case 'PAN': {
      const normalized = trimmed.toUpperCase();
      if (normalized.length !== 10) return FULL_MASK_MAP.PAN;
      return `*****${normalized.slice(5)}`;
    }
    case 'AADHAAR': {
      const digits = trimmed.replace(/\D/g, '');
      if (digits.length !== 12) return FULL_MASK_MAP.AADHAAR;
      return `XXXX XXXX ${digits.slice(-4)}`;
    }
    case 'CREDIT_CARD': {
      const digits = trimmed.replace(/\D/g, '');
      if (digits.length < 4) return FULL_MASK_MAP.CREDIT_CARD;
      return `${'*'.repeat(Math.max(8, digits.length - 4))}${digits.slice(-4)}`;
    }
  }
}

export class PseudonymSessionMapper {
  private readonly mappings = new Map<string, string>();
  private readonly counters: Record<PiiCategory, number> = {
    EMAIL: 0,
    INDIAN_PHONE: 0,
    INTL_PHONE: 0,
    IPV4: 0,
    IPV6: 0,
    PAN: 0,
    AADHAAR: 0,
    CREDIT_CARD: 0,
  };

  reset(): void {
    this.mappings.clear();
    for (const key of Object.keys(this.counters) as PiiCategory[]) {
      this.counters[key] = 0;
    }
  }

  getReplacement(category: PiiCategory, originalValue: string): string {
    const normalizedKey = `${category}:${normalizeForMappingKey(category, originalValue)}`;
    const existing = this.mappings.get(normalizedKey);
    if (existing) return existing;

    this.counters[category] += 1;
    const seq = this.counters[category];
    const generated = this.generateSyntheticValue(category, seq);
    this.mappings.set(normalizedKey, generated);
    return generated;
  }

  private generateSyntheticValue(category: PiiCategory, seq: number): string {
    const padded3 = String(seq).padStart(3, '0');
    const padded4 = String((seq - 1) % 10000).padStart(4, '0');

    switch (category) {
      case 'EMAIL':
        return `person_${padded3}@example.invalid`;
      case 'INDIAN_PHONE':
        return `+91${String(seq).padStart(10, '0')}`;
      case 'INTL_PHONE':
        return `+00${String(seq).padStart(10, '0')}`;
      case 'IPV4': {
        const third = Math.floor((seq - 1) / 254) % 256;
        const fourth = ((seq - 1) % 254) + 1;
        return `192.0.${third}.${fourth}`;
      }
      case 'IPV6':
        return `2001:db8::${seq.toString(16)}`;
      case 'PAN': {
        // ZZZPX0000Z, ZZZPX0001Z, ...; overflow letter if > 10000
        const suffixChar = String.fromCharCode(90 - (Math.floor((seq - 1) / 10000) % 26));
        return `ZZZPX${padded4}${suffixChar}`;
      }
      case 'AADHAAR':
        return seq === 1 ? '000000000000' : `00000000${String(seq - 1).padStart(4, '0')}`;
      case 'CREDIT_CARD':
        return seq === 1 ? '0000000000000000' : `000000000000${String(seq - 1).padStart(4, '0')}`;
    }
  }
}

export function formatReplacement(
  category: PiiCategory,
  originalValue: string,
  mode: SanitizationMode,
  mapper: PseudonymSessionMapper
): string {
  switch (mode) {
    case 'full':
      return FULL_MASK_MAP[category];
    case 'partial':
      return maskPartial(category, originalValue);
    case 'pseudonymize':
      return mapper.getReplacement(category, originalValue);
  }
}

export function getFullMaskPlaceholder(category: PiiCategory): string {
  return FULL_MASK_MAP[category];
}
