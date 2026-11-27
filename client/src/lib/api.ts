import type { AiGenerateResponse, ServerHealth } from '../types';

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
    const errText = await response.text().catch(() => '');
    throw new Error(`AI API ${response.status}: ${errText || response.statusText}`);
  }

  return (await response.json()) as AiGenerateResponse;
}
