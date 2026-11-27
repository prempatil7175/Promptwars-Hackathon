export type NavTab = 'dashboard' | 'playground' | 'analytics' | 'settings';

export interface DemoUser {
  id: string;
  name: string;
  email: string;
  role: string;
  organization: string;
  avatarInitials: string;
  isDemoUser: boolean;
}

export interface ActionItem {
  title: string;
  priority: 'high' | 'medium' | 'low';
  effort: string;
}

export interface AiGenerateResponse {
  summary: string;
  insights: string[];
  actionItems: ActionItem[];
  confidenceScore: number;
  estimatedImpact: string;
  model: string;
  source: 'live' | 'demo-fallback';
  fallbackReason?: string;
  latencyMs: number;
}

export interface AiRunHistoryItem {
  id: string;
  prompt: string;
  timestamp: string;
  result: AiGenerateResponse;
}

export interface KpiMetric {
  id: string;
  label: string;
  value: string;
  delta: string;
  trend: 'up' | 'down';
  detail: string;
}

export interface ThroughputPoint {
  label: string;
  liveRequests: number;
  cachedFallbacks: number;
  latencyMs: number;
}

export interface CategoryMetric {
  category: string;
  runs: number;
  accuracy: number;
}

export interface ActivityItem {
  id: string;
  title: string;
  pipeline: string;
  status: 'live' | 'demo-fallback';
  timeAgo: string;
  latency: string;
}

export interface ServerHealth {
  status: 'ok' | 'offline';
  timestamp: string;
  services: {
    geminiConfigured: boolean;
    supabaseConfigured: boolean;
  };
}

export type ToastVariant = 'info' | 'success' | 'warning';

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
}
