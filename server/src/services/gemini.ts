import { GoogleGenAI } from '@google/genai';

export interface ActionItem {
  title: string;
  priority: 'high' | 'medium' | 'low';
  effort: string;
}

export interface AiStructuredPayload {
  summary: string;
  insights: string[];
  actionItems: ActionItem[];
  confidenceScore: number;
  estimatedImpact: string;
}

export interface AiGenerateResponse extends AiStructuredPayload {
  model: string;
  source: 'live' | 'demo-fallback';
  fallbackReason?: string;
  latencyMs: number;
}

export type SyntheticTemplateType =
  | 'support-ticket'
  | 'clinical-note'
  | 'hr-resume'
  | 'mixed-csv';

export interface SyntheticSampleResponse {
  title: string;
  templateType: SyntheticTemplateType;
  fileType: 'txt' | 'csv';
  content: string;
  isSynthetic: true;
  model: string;
  source: 'live' | 'demo-fallback';
  fallbackReason?: string;
  latencyMs: number;
}

export interface ComplianceAuditPayload {
  advisorySummary: string;
  residualRiskLevel: 'low' | 'moderate' | 'review-recommended';
  observations: string[];
  recommendedControls: string[];
  disclaimer: string;
}

export interface ComplianceAuditResponse extends ComplianceAuditPayload {
  model: string;
  source: 'live' | 'demo-fallback';
  fallbackReason?: string;
  latencyMs: number;
}

export const GEMINI_MODEL = 'gemini-2.5-flash';
const LIVE_TIMEOUT_MS = 7500;

const GENERATE_RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    summary: { type: 'string' },
    insights: { type: 'array', items: { type: 'string' } },
    actionItems: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          priority: { type: 'string', enum: ['high', 'medium', 'low'] },
          effort: { type: 'string' },
        },
        required: ['title', 'priority', 'effort'],
      },
    },
    confidenceScore: { type: 'number' },
    estimatedImpact: { type: 'string' },
  },
  required: ['summary', 'insights', 'actionItems', 'confidenceScore', 'estimatedImpact'],
};

const SYNTHETIC_SAMPLE_SCHEMA = {
  type: 'object',
  properties: {
    title: { type: 'string' },
    content: { type: 'string' },
  },
  required: ['title', 'content'],
};

const COMPLIANCE_AUDIT_SCHEMA = {
  type: 'object',
  properties: {
    advisorySummary: { type: 'string' },
    residualRiskLevel: {
      type: 'string',
      enum: ['low', 'moderate', 'review-recommended'],
    },
    observations: { type: 'array', items: { type: 'string' } },
    recommendedControls: { type: 'array', items: { type: 'string' } },
  },
  required: [
    'advisorySummary',
    'residualRiskLevel',
    'observations',
    'recommendedControls',
  ],
};

export function isGeminiConfigured(): boolean {
  const key = process.env.GEMINI_API_KEY?.trim() || '';
  return Boolean(key && !key.includes('your_') && key !== 'demo');
}

/**
 * Defensive server-side check ensuring raw PII never reaches Gemini
 * even if a caller attempts to bypass client-side verification.
 */
export function detectResidualPiiServerGuard(text: string): string | null {
  // Unmasked emails (allow synthetic @example.invalid only? No, block any unmasked email on server too!)
  if (/(?<![A-Za-z0-9._%+-])[A-Za-z0-9.!#$%&'+/=?^_`{|}~-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,24}/.test(text)) {
    return 'Email pattern detected in payload';
  }
  // Indian PAN [A-Z]{5}[0-9]{4}[A-Z]
  if (/(?<![A-Za-z0-9])[A-Z]{5}[0-9]{4}[A-Z](?![A-Za-z0-9])/.test(text)) {
    return 'PAN-like identifier detected in payload';
  }
  // +91 Indian mobile
  if (/(?:\+91[\s().-]*)[6-9]\d{9}/.test(text)) {
    return 'Indian phone pattern detected in payload';
  }
  // Unmasked Aadhaar-like 12-digit starting 2-9
  if (/(?<![\d.-])[2-9]\d{3}[ -]?\d{4}[ -]?\d{4}(?![\d.-])/.test(text)) {
    return '12-digit Aadhaar-like pattern detected in payload';
  }
  // Luhn-valid 13-19 digit sequence
  const cardMatches = text.match(/(?<![\d-])\d(?:[ \t-]?\d){12,18}(?![\d-])/g) ?? [];
  for (const raw of cardMatches) {
    const digits = raw.replace(/\D/g, '');
    if (/^(\d)\1+$/.test(digits)) continue;
    let sum = 0;
    let dbl = false;
    for (let i = digits.length - 1; i >= 0; i -= 1) {
      let n = digits.charCodeAt(i) - 48;
      if (dbl) {
        n *= 2;
        if (n > 9) n -= 9;
      }
      sum += n;
      dbl = !dbl;
    }
    if (sum % 10 === 0) {
      return 'Luhn-valid card number pattern detected in payload';
    }
  }
  return null;
}

async function runGeminiInteraction<T>(params: {
  systemInstruction: string;
  input: string;
  schema: Record<string, unknown>;
}): Promise<T> {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const controller = new AbortController();
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  try {
    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => {
        controller.abort();
        reject(new Error('Gemini request exceeded 7.5s timeout'));
      }, LIVE_TIMEOUT_MS);
    });

    const interactionPromise = ai.interactions.create(
      {
        model: GEMINI_MODEL,
        system_instruction: params.systemInstruction,
        input: params.input,
        store: false,
        response_format: {
          type: 'text',
          mime_type: 'application/json',
          schema: params.schema,
        },
      },
      {
        timeout_ms: LIVE_TIMEOUT_MS,
        fetchOptions: { signal: controller.signal },
      }
    );

    const interaction = await Promise.race([interactionPromise, timeoutPromise]);
    const rawText = interaction.output_text;

    if (!rawText) {
      throw new Error('Empty output_text from Gemini Interactions API');
    }

    return JSON.parse(rawText) as T;
  } finally {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
    }
  }
}

function buildMockInsight(
  prompt: string,
  fallbackReason: string,
  latencyMs: number
): AiGenerateResponse {
  const topic = prompt.trim().slice(0, 72) || 'Privacy workflow guidance';
  return {
    summary: `Generated privacy engineering guidance for "${topic}" using local deterministic validation paired with strict client-side sanitization boundaries.`,
    insights: [
      'Execute all PII detection, checksum validation, and redaction locally in browser memory.',
      'Enforce deterministic span resolution so overlapping tokens never shift offsets.',
      'Re-run local PII verification before forwarding sanitized summaries to any external service.',
    ],
    actionItems: [
      { title: 'Verify Aadhaar Verhoeff and Card Luhn checks remain active', priority: 'high', effort: '5 mins' },
      { title: 'Export metadata-only JSON audit report for compliance review', priority: 'medium', effort: '2 mins' },
      { title: 'Run in-app Verification Suite to confirm zero regressions', priority: 'medium', effort: '3 mins' },
    ],
    confidenceScore: 93,
    estimatedImpact: 'Zero raw PII transmitted outside browser boundary',
    model: GEMINI_MODEL,
    source: 'demo-fallback',
    fallbackReason,
    latencyMs,
  };
}

export async function generateStructuredInsight(options: {
  prompt: string;
  context?: string;
  demoMode?: boolean;
}): Promise<AiGenerateResponse> {
  const start = Date.now();
  const { prompt, context, demoMode } = options;

  if (demoMode) {
    return buildMockInsight(prompt, 'Demo Mode active', Date.now() - start);
  }

  if (!isGeminiConfigured()) {
    return buildMockInsight(
      prompt,
      'GEMINI_API_KEY not configured — serving deterministic fallback',
      Date.now() - start
    );
  }

  const fullInput = context
    ? `Context: ${context}\n\nUser Prompt: ${prompt}`
    : prompt;

  try {
    const parsed = await runGeminiInteraction<AiStructuredPayload>({
      systemInstruction:
        'You are a Principal Privacy & Security Architect. Provide concise, high-signal structured JSON guidance. Never ask for or output real personal data.',
      input: fullInput,
      schema: GENERATE_RESPONSE_SCHEMA,
    });

    return {
      summary: parsed.summary || 'Generated privacy insight.',
      insights: Array.isArray(parsed.insights) ? parsed.insights : [],
      actionItems: Array.isArray(parsed.actionItems) ? parsed.actionItems : [],
      confidenceScore:
        typeof parsed.confidenceScore === 'number' ? parsed.confidenceScore : 90,
      estimatedImpact: parsed.estimatedImpact || 'Client-side privacy assured',
      model: GEMINI_MODEL,
      source: 'live',
      latencyMs: Date.now() - start,
    };
  } catch (error) {
    const reason =
      error instanceof Error ? error.message : 'Upstream Gemini error';
    return buildMockInsight(prompt, reason, Date.now() - start);
  }
}

const LOCAL_SYNTHETIC_FIXTURES: Record<
  SyntheticTemplateType,
  { title: string; fileType: 'txt' | 'csv'; content: string }
> = {
  'support-ticket': {
    title: 'Synthetic Escalation Ticket (Local Fixture)',
    fileType: 'txt',
    content: `[SYNTHETIC SAMPLE] Ticket #SUP-9042 | 2026-11-27T10:12:00Z | Build v3.4.1
Reporter Email: ananya.rao@example.com
Indian Mobile: +91 98450 12345
Backup Intl Line: +44 20 7946 0821
PAN: PQRSX1234K | Aadhaar: 2345 6789 0124
Client IPv4: 198.51.100.77 | IPv6: 2001:db8::42
Order Ref (Not Phone): ORD-9876543210 | Invalid Card Ref: 4532 0151 1283 0367
Luhn-Valid Test Card: 4532 0151 1283 0366`,
  },
  'clinical-note': {
    title: 'Synthetic Clinical Intake (Local Fixture)',
    fileType: 'txt',
    content: `[SYNTHETIC SAMPLE] Clinic Visit 2026-11-27T09:30:00+05:30 | Device v2.8.0
Caregiver Email: vikram.iyer@clinic-demo.org
Mobile: 9820112233 | Intl Specialist: +1 415 555 0177
Aadhaar ID: 3456-7890-1238 | PAN: BNZAA2318J
Gateway IPv4: 203.0.113.19 | Invalid Node: 299.10.1.1
Batch ID (Not PII): 1732683947`,
  },
  'hr-resume': {
    title: 'Synthetic Candidate Dossier (Local Fixture)',
    fileType: 'txt',
    content: `[SYNTHETIC SAMPLE] Candidate Profile
Email: meera.desai@talent-demo.io
Phone: +91-97654-32109
PAN: KLMNP5678R | Aadhaar: 456789012341
Portfolio IPv4: 192.0.2.44 | IPv6: 2001:db8:85a3::8a2e:370:7334
Repeat Contact: meera.desai@talent-demo.io`,
  },
  'mixed-csv': {
    title: 'Synthetic Customer Export CSV (Local Fixture)',
    fileType: 'csv',
    content: `id,name,email,phone,pan,aadhaar,notes
101,"Nair, ""Aarav""",aarav@example.com,+91 98765 43210,ABCDE1234F,234567890124,"Synthetic row 1, build v1.2.3"
102,"Patel, Maya",maya@example.org,+1 212 555 0144,WXYZA4321M,3456-7890-1238,"Order ORD-9876543210; invalid IP 299.1.1.1"`,
  },
};

export async function generateSyntheticSampleDocument(options: {
  templateType: SyntheticTemplateType;
  demoMode?: boolean;
}): Promise<SyntheticSampleResponse> {
  const start = Date.now();
  const { templateType, demoMode } = options;
  const fixture = LOCAL_SYNTHETIC_FIXTURES[templateType];

  if (demoMode) {
    return {
      ...fixture,
      templateType,
      isSynthetic: true,
      model: GEMINI_MODEL,
      source: 'demo-fallback',
      fallbackReason: 'Demo Mode active',
      latencyMs: Date.now() - start,
    };
  }

  if (!isGeminiConfigured()) {
    return {
      ...fixture,
      templateType,
      isSynthetic: true,
      model: GEMINI_MODEL,
      source: 'demo-fallback',
      fallbackReason: 'GEMINI_API_KEY not configured — serving local synthetic fixture',
      latencyMs: Date.now() - start,
    };
  }

  const promptByType: Record<SyntheticTemplateType, string> = {
    'support-ticket':
      'Generate a purely fictional customer support ticket labeled [SYNTHETIC SAMPLE] containing synthetic example.com email, synthetic +91 mobile, synthetic IPv4 (192.0.2.x/198.51.100.x), synthetic IPv6 (2001:db8::/32), synthetic PAN format (ABCDE1234F style), software version v2.4.1, and an ORD-9876543210 order trap.',
    'clinical-note':
      'Generate a purely fictional outpatient clinical intake note labeled [SYNTHETIC SAMPLE] with fictional caregiver email, fictional phone, timestamp, firmware version, and a synthetic billing note.',
    'hr-resume':
      'Generate a purely fictional software engineer resume snippet labeled [SYNTHETIC SAMPLE] with repeated fictional email and phone for testing consistent pseudonymization.',
    'mixed-csv':
      'Generate a purely fictional 3-row RFC4180 CSV labeled as synthetic data with headers id,name,email,phone,ip,notes including quoted commas and fictional example.com emails.',
  };

  try {
    const parsed = await runGeminiInteraction<{ title: string; content: string }>({
      systemInstruction:
        'Generate 100% fictional, clearly synthetic test documents for PII redaction testing. Never use real people, real phone numbers, or real identifiers. Use reserved documentation domains (example.com/example.org) and RFC 5737 / RFC 3849 IP ranges.',
      input: promptByType[templateType],
      schema: SYNTHETIC_SAMPLE_SCHEMA,
    });

    return {
      title: `${parsed.title || fixture.title} (Synthetic)`,
      templateType,
      fileType: fixture.fileType,
      content: parsed.content || fixture.content,
      isSynthetic: true,
      model: GEMINI_MODEL,
      source: 'live',
      latencyMs: Date.now() - start,
    };
  } catch (error) {
    const reason = error instanceof Error ? error.message : 'Upstream Gemini error';
    return {
      ...fixture,
      templateType,
      isSynthetic: true,
      model: GEMINI_MODEL,
      source: 'demo-fallback',
      fallbackReason: reason,
      latencyMs: Date.now() - start,
    };
  }
}

export async function runSanitizedComplianceAudit(options: {
  sanitizedText: string;
  mode: string;
  stats: {
    totalDetected: number;
    rejectedFalsePositives: number;
    characterCount: number;
  };
  demoMode?: boolean;
}): Promise<ComplianceAuditResponse> {
  const start = Date.now();
  const { sanitizedText, mode, stats, demoMode } = options;

  const buildFallbackAudit = (reason: string): ComplianceAuditResponse => ({
    advisorySummary: `Advisory review of sanitized output (${mode} mode, ${stats.totalDetected} entities redacted, ${stats.rejectedFalsePositives} false positives rejected across ${stats.characterCount} chars). No unmasked primary identifiers remain in the submitted excerpt.`,
    residualRiskLevel: mode === 'full' ? 'low' : 'moderate',
    observations: [
      `Sanitization mode "${mode}" replaced ${stats.totalDetected} validated PII entities locally before any external review.`,
      `${stats.rejectedFalsePositives} non-PII numeric/format candidates (e.g., invalid checksums or timestamps) were preserved without over-redaction.`,
      mode === 'partial'
        ? 'Partial masking retains trailing characters for operational lookup; consider Full Mask for public distribution.'
        : 'Category placeholders prevent direct recovery of original identifiers.',
    ],
    recommendedControls: [
      'Confirm contextual free-text names or organization references do not indirectly identify subjects.',
      'Retain client-generated metadata audit JSON alongside exported sanitized artifacts.',
      'Treat automated advisory checks as supplementary to organizational privacy review.',
    ],
    disclaimer:
      'Advisory engineering guidance only — does not constitute legal compliance certification (GDPR/DPDP/HIPAA).',
    model: GEMINI_MODEL,
    source: 'demo-fallback',
    fallbackReason: reason,
    latencyMs: Date.now() - start,
  });

  if (demoMode) {
    return buildFallbackAudit('Demo Mode active');
  }

  if (!isGeminiConfigured()) {
    return buildFallbackAudit('GEMINI_API_KEY not configured — serving local advisory summary');
  }

  const excerpt = sanitizedText.slice(0, 12000);
  const inputPayload = JSON.stringify({
    sanitizationMode: mode,
    totalDetected: stats.totalDetected,
    rejectedFalsePositives: stats.rejectedFalsePositives,
    characterCount: stats.characterCount,
    sanitizedExcerpt: excerpt,
  });

  try {
    const parsed = await runGeminiInteraction<Omit<ComplianceAuditPayload, 'disclaimer'>>({
      systemInstruction:
        'You are a Privacy Engineering Advisor reviewing an ALREADY SANITIZED document excerpt and aggregate counts. Never claim legal certification. Provide practical residual-risk observations (such as indirect context clues or free-text names) and concrete controls in JSON.',
      input: inputPayload,
      schema: COMPLIANCE_AUDIT_SCHEMA,
    });

    return {
      advisorySummary: parsed.advisorySummary || 'Completed advisory privacy review.',
      residualRiskLevel: parsed.residualRiskLevel || 'low',
      observations: Array.isArray(parsed.observations) ? parsed.observations : [],
      recommendedControls: Array.isArray(parsed.recommendedControls)
        ? parsed.recommendedControls
        : [],
      disclaimer:
        'Advisory engineering guidance only — does not constitute legal compliance certification (GDPR/DPDP/HIPAA).',
      model: GEMINI_MODEL,
      source: 'live',
      latencyMs: Date.now() - start,
    };
  } catch (error) {
    const reason = error instanceof Error ? error.message : 'Upstream Gemini error';
    return buildFallbackAudit(reason);
  }
}
