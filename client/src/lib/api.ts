import type {
  AiGenerateResponse,
  ComplianceAuditResponse,
  ServerHealth,
  SyntheticSampleResponse,
  SyntheticTemplateType,
} from '../types';

const API_BASE = (import.meta.env.VITE_API_URL?.trim() || '').replace(/\/$/, '');

function buildUrl(path: string): string {
  return API_BASE ? `${API_BASE}${path}` : path;
}

export async function fetchServerHealth(signal?: AbortSignal): Promise<ServerHealth> {
  const response = await fetch(buildUrl('/api/health'), { signal });
  if (!response.ok) {
    throw new Error(`Health check failed (${response.status})`);
  }
  return (await response.json()) as ServerHealth;
}

export async function generateAiInsight(
  payload: { prompt: string; context?: string; demoMode?: boolean },
  signal?: AbortSignal
): Promise<AiGenerateResponse> {
  const response = await fetch(buildUrl('/api/ai/generate'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal,
  });

  if (!response.ok) {
    const errBody = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(errBody?.error || `AI API ${response.status}: ${response.statusText}`);
  }

  return (await response.json()) as AiGenerateResponse;
}

export async function requestSyntheticSample(
  payload: { templateType: SyntheticTemplateType; demoMode?: boolean },
  signal?: AbortSignal
): Promise<SyntheticSampleResponse> {
  const response = await fetch(buildUrl('/api/ai/synthetic-sample'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal,
  });

  if (!response.ok) {
    const errBody = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(errBody?.error || `Synthetic sample error (${response.status})`);
  }

  return (await response.json()) as SyntheticSampleResponse;
}

export async function requestComplianceAudit(
  payload: {
    sanitizedText: string;
    mode: string;
    stats: {
      totalDetected: number;
      rejectedFalsePositives: number;
      characterCount: number;
    };
    demoMode?: boolean;
  },
  signal?: AbortSignal
): Promise<ComplianceAuditResponse> {
  const response = await fetch(buildUrl('/api/ai/compliance-audit'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal,
  });

  if (!response.ok) {
    const errBody = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(errBody?.error || `Compliance audit error (${response.status})`);
  }

  return (await response.json()) as ComplianceAuditResponse;
}
