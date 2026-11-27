import type {
  ActivityItem,
  AiGenerateResponse,
  CategoryMetric,
  DemoUser,
  KpiMetric,
  ServerHealth,
  ThroughputPoint,
} from '../types';

export const DEMO_USER: DemoUser = {
  id: 'demo-user-001',
  name: 'Alex Rivera',
  email: 'alex@pulseforge.ai',
  role: 'Lead AI Architect',
  organization: 'PulseForge Labs',
  avatarInitials: 'AR',
  isDemoUser: true,
};

export const MOCK_KPIS: KpiMetric[] = [
  {
    id: 'kpi-workflows',
    label: 'AI Workflows Executed',
    value: '1,482',
    delta: '+24.8%',
    trend: 'up',
    detail: 'Last 24h across 4 pipelines',
  },
  {
    id: 'kpi-latency',
    label: 'Median Inference Latency',
    value: '342 ms',
    delta: '-18.2%',
    trend: 'up',
    detail: 'gemini-4-hydrogen structured JSON',
  },
  {
    id: 'kpi-uptime',
    label: 'Demo Uptime Guarantee',
    value: '100.0%',
    delta: '0 crashes',
    trend: 'up',
    detail: '8s auto-fallback shield active',
  },
  {
    id: 'kpi-accuracy',
    label: 'Schema Validation Pass',
    value: '99.4%',
    delta: '+3.1%',
    trend: 'up',
    detail: 'Zero malformed JSON payloads',
  },
];

export const MOCK_THROUGHPUT_SERIES: ThroughputPoint[] = [
  { label: '09:00', liveRequests: 120, cachedFallbacks: 4, latencyMs: 390 },
  { label: '11:00', liveRequests: 195, cachedFallbacks: 6, latencyMs: 365 },
  { label: '13:00', liveRequests: 280, cachedFallbacks: 9, latencyMs: 348 },
  { label: '15:00', liveRequests: 340, cachedFallbacks: 12, latencyMs: 355 },
  { label: '17:00', liveRequests: 410, cachedFallbacks: 8, latencyMs: 332 },
  { label: '19:00', liveRequests: 465, cachedFallbacks: 5, latencyMs: 324 },
  { label: '21:00', liveRequests: 530, cachedFallbacks: 3, latencyMs: 318 },
];

export const MOCK_CATEGORY_BREAKDOWN: CategoryMetric[] = [
  { category: 'Triage & Routing', runs: 540, accuracy: 96 },
  { category: 'Structured Extract', runs: 420, accuracy: 98 },
  { category: 'Pitch Synthesis', runs: 310, accuracy: 94 },
  { category: 'Risk Scoring', runs: 212, accuracy: 95 },
];

export const MOCK_ACTIVITY_FEED: ActivityItem[] = [
  {
    id: 'act-1',
    title: 'Generated ER Intake Automation Blueprint',
    pipeline: '/api/ai/generate',
    status: 'live',
    timeAgo: '2m ago',
    latency: '318 ms',
  },
  {
    id: 'act-2',
    title: 'Structured Pitch Deck Metrics Extraction',
    pipeline: '/api/ai/generate',
    status: 'demo-fallback',
    timeAgo: '9m ago',
    latency: '14 ms',
  },
  {
    id: 'act-3',
    title: 'FinOps Anomaly Threshold Calibration',
    pipeline: '/api/ai/generate',
    status: 'live',
    timeAgo: '18m ago',
    latency: '352 ms',
  },
  {
    id: 'act-4',
    title: 'Supabase Telemetry Seed Verification',
    pipeline: 'scripts/seed.ts',
    status: 'live',
    timeAgo: '42m ago',
    latency: '112 ms',
  },
];

export const PROMPT_PRESETS: { label: string; prompt: string }[] = [
  {
    label: 'AI Healthcare Triage',
    prompt: 'Design an AI patient triage copilot that cuts ER wait times by 40% with zero clinical blindspots.',
  },
  {
    label: 'FinOps Spend Guard',
    prompt: 'Create a real-time cloud GPU spend anomaly detector that auto-pauses runaway training jobs.',
  },
  {
    label: '2-Min Judge Pitch',
    prompt: 'Structure a winning 2-minute hackathon demo narrative highlighting reliability and measurable ROI.',
  },
  {
    label: 'Supply Chain Copilot',
    prompt: 'Outline a multimodal port disruption predictor that reroutes high-priority freight automatically.',
  },
];

export const MOCK_HEALTH: ServerHealth = {
  status: 'ok',
  timestamp: new Date().toISOString(),
  services: {
    geminiConfigured: false,
    supabaseConfigured: false,
  },
};

export function buildClientMockAiResponse(prompt: string, reason = 'Demo Mode active'): AiGenerateResponse {
  const topic = prompt.trim().slice(0, 68) || 'AI Product Launch';
  return {
    summary: `Built a hackathon-ready execution strategy for "${topic}" combining Gemini structured JSON outputs with sub-second optimistic UI states. Designed to stay 100% resilient during live judge walkthroughs.`,
    insights: [
      `Target high-leverage workflow inside "${topic}" to deliver visible value within the first 15 seconds of a judge demo.`,
      'Enforce strict JSON schema responses so charts, KPI cards, and action checklists render deterministically.',
      'Pair every external call with an 8-second timeout shield so Wi-Fi hiccups never break presentation flow.',
    ],
    actionItems: [
      {
        title: 'Wire interactive hero workflow with realistic seeded telemetry',
        priority: 'high',
        effort: '35 mins',
      },
      {
        title: 'Connect /api/ai/generate structured payload to dashboard cards',
        priority: 'high',
        effort: '25 mins',
      },
      {
        title: 'Verify live & fallback paths via Ctrl+Shift+D before pitch',
        priority: 'medium',
        effort: '10 mins',
      },
    ],
    confidenceScore: 95,
    estimatedImpact: '+3.8x faster prototype-to-pitch readiness',
    model: 'gemini-4-hydrogen',
    source: 'demo-fallback',
    fallbackReason: reason,
    latencyMs: 18,
  };
}
