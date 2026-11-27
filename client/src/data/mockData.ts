import { SYNTHETIC_SAMPLES } from '../engine/samples';
import type {
  ComplianceAuditResponse,
  DemoUser,
  ServerHealth,
  SessionActivityItem,
  SyntheticSampleResponse,
  SyntheticTemplateType,
} from '../types';

export const DEMO_USER: DemoUser = {
  id: 'demo-user-001',
  name: 'Alex Rivera',
  email: 'alex@piiguard.local',
  role: 'Lead Privacy Engineer',
  organization: 'PII GUARD Demo',
  avatarInitials: 'AR',
  isDemoUser: true,
};

export const MOCK_HEALTH: ServerHealth = {
  status: 'ok',
  timestamp: new Date().toISOString(),
  services: {
    geminiConfigured: false,
    supabaseConfigured: false,
  },
};

export const DEMO_FIXTURE_ACTIVITY: SessionActivityItem[] = [
  {
    id: 'fixture-1',
    documentLabel: 'support-ticket-synthetic.txt (Demo Fixture)',
    fileType: 'txt',
    mode: 'full',
    detectedCount: 10,
    sanitizedCount: 10,
    rejectedCount: 4,
    durationMs: 1.8,
    timestamp: 'Fixture baseline',
    isDemoFixture: true,
  },
  {
    id: 'fixture-2',
    documentLabel: 'customer-export-synthetic.csv (Demo Fixture)',
    fileType: 'csv',
    mode: 'pseudonymize',
    detectedCount: 15,
    sanitizedCount: 15,
    rejectedCount: 3,
    durationMs: 2.4,
    timestamp: 'Fixture baseline',
    isDemoFixture: true,
  },
];

export function buildLocalSyntheticSampleFallback(
  templateType: SyntheticTemplateType,
  reason = 'Demo Mode active'
): SyntheticSampleResponse {
  const map: Record<SyntheticTemplateType, number> = {
    'support-ticket': 0,
    'clinical-note': 1,
    'hr-resume': 2,
    'mixed-csv': 3,
  };
  const sample = SYNTHETIC_SAMPLES[map[templateType]] ?? SYNTHETIC_SAMPLES[0];
  return {
    title: `${sample.title} (Local Synthetic Fixture)`,
    templateType,
    fileType: sample.fileType,
    content: sample.content,
    isSynthetic: true,
    model: 'gemini-2.5-flash',
    source: 'demo-fallback',
    fallbackReason: reason,
    latencyMs: 6,
  };
}

export function buildLocalComplianceAuditFallback(
  mode: string,
  stats: { totalDetected: number; rejectedFalsePositives: number; characterCount: number },
  reason = 'Demo Mode active'
): ComplianceAuditResponse {
  return {
    advisorySummary: `Local advisory check on sanitized payload (${mode} mode): ${stats.totalDetected} PII entities redacted and ${stats.rejectedFalsePositives} non-PII numeric candidates preserved across ${stats.characterCount.toLocaleString()} characters.`,
    residualRiskLevel: mode === 'full' ? 'low' : 'moderate',
    observations: [
      'Deterministic local PII re-scan confirmed zero unredacted direct identifiers prior to dispatch.',
      mode === 'partial'
        ? 'Partial masking reveals minimal trailing characters; use Full Mask for untrusted external sharing.'
        : 'Sanitized placeholders isolate sensitive fields without altering document structure.',
      `${stats.rejectedFalsePositives} invalid/non-PII candidates (e.g. timestamps, versions, failed checksums) were safely excluded.`,
    ],
    recommendedControls: [
      'Review unstructured free-text notes for indirect context clues (job titles, rare locations).',
      'Store the client-generated metadata-only JSON audit report alongside sanitized exports.',
    ],
    disclaimer:
      'Advisory engineering guidance only — not a legal compliance certification.',
    model: 'gemini-2.5-flash',
    source: 'demo-fallback',
    fallbackReason: reason,
    latencyMs: 8,
  };
}
