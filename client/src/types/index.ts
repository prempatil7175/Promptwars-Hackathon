import type { PiiCategory, SanitizationMode } from '../engine/types';

export type NavTab =
  | 'dashboard'
  | 'workspace'
  | 'analytics'
  | 'verification'
  | 'settings';

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

export interface ComplianceAuditResponse {
  advisorySummary: string;
  residualRiskLevel: 'low' | 'moderate' | 'review-recommended';
  observations: string[];
  recommendedControls: string[];
  disclaimer: string;
  model: string;
  source: 'live' | 'demo-fallback';
  fallbackReason?: string;
  latencyMs: number;
}

export interface SessionActivityItem {
  id: string;
  documentLabel: string;
  fileType: 'text' | 'txt' | 'csv';
  mode: SanitizationMode;
  detectedCount: number;
  sanitizedCount: number;
  rejectedCount: number;
  durationMs: number;
  timestamp: string;
  isDemoFixture?: boolean;
}

export interface LatencySeriesPoint {
  label: string;
  detected: number;
  rejected: number;
  durationMs: number;
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

export type CategoryTotals = Record<PiiCategory, number>;
