import React, { createContext, useCallback, useContext, useState } from 'react';
import {
  ALL_PII_CATEGORIES,
  DEFAULT_DETECTION_CONFIG,
  type DetectionConfig,
  type PiiCategory,
  type SanitizationMode,
  type SanitizationResult,
} from '../engine/types';
import type { CategoryTotals, LatencySeriesPoint, SessionActivityItem } from '../types';

function createEmptyTotals(): CategoryTotals {
  return {
    EMAIL: 0,
    INDIAN_PHONE: 0,
    INTL_PHONE: 0,
    IPV4: 0,
    IPV6: 0,
    PAN: 0,
    AADHAAR: 0,
    CREDIT_CARD: 0,
  };
}

interface PrivacySessionContextValue {
  mode: SanitizationMode;
  setMode: (mode: SanitizationMode) => void;
  config: DetectionConfig;
  setConfig: React.Dispatch<React.SetStateAction<DetectionConfig>>;
  /** Metadata-only session counters (zero raw documents or PII values stored). */
  documentsProcessed: number;
  totalDetected: number;
  totalSanitized: number;
  totalRejected: number;
  categoryTotals: CategoryTotals;
  recentActivity: SessionActivityItem[];
  latencySeries: LatencySeriesPoint[];
  /** Active workspace metadata snapshot (transient memory only). */
  activeDocumentLabel: string;
  activeFileType: 'text' | 'txt' | 'csv';
  activeResult: SanitizationResult | null;
  setActiveWorkspaceSnapshot: (snapshot: {
    label: string;
    fileType: 'text' | 'txt' | 'csv';
    result: SanitizationResult | null;
  }) => void;
  recordSessionRun: (entry: {
    documentLabel: string;
    fileType: 'text' | 'txt' | 'csv';
    result: SanitizationResult;
    dedupeKey?: string;
  }) => void;
  clearWorkspaceSnapshot: () => void;
}

const PrivacySessionContext = createContext<PrivacySessionContextValue | undefined>(undefined);

export function PrivacySessionProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<SanitizationMode>('full');
  const [config, setConfig] = useState<DetectionConfig>(DEFAULT_DETECTION_CONFIG);

  const [documentsProcessed, setDocumentsProcessed] = useState(0);
  const [totalDetected, setTotalDetected] = useState(0);
  const [totalSanitized, setTotalSanitized] = useState(0);
  const [totalRejected, setTotalRejected] = useState(0);
  const [categoryTotals, setCategoryTotals] = useState<CategoryTotals>(createEmptyTotals);
  const [recentActivity, setRecentActivity] = useState<SessionActivityItem[]>([]);
  const [latencySeries, setLatencySeries] = useState<LatencySeriesPoint[]>([]);
  const [lastDedupeKey, setLastDedupeKey] = useState<string>('');

  const [activeDocumentLabel, setActiveDocumentLabel] = useState('Untitled Paste');
  const [activeFileType, setActiveFileType] = useState<'text' | 'txt' | 'csv'>('text');
  const [activeResult, setActiveResult] = useState<SanitizationResult | null>(null);

  const setActiveWorkspaceSnapshot = useCallback(
    (snapshot: {
      label: string;
      fileType: 'text' | 'txt' | 'csv';
      result: SanitizationResult | null;
    }) => {
      setActiveDocumentLabel(snapshot.label);
      setActiveFileType(snapshot.fileType);
      setActiveResult(snapshot.result);
    },
    []
  );

  const clearWorkspaceSnapshot = useCallback(() => {
    setActiveDocumentLabel('Untitled Paste');
    setActiveFileType('text');
    setActiveResult(null);
  }, []);

  const recordSessionRun = useCallback(
    ({
      documentLabel,
      fileType,
      result,
      dedupeKey,
    }: {
      documentLabel: string;
      fileType: 'text' | 'txt' | 'csv';
      result: SanitizationResult;
      dedupeKey?: string;
    }) => {
      if (result.stats.characterCount === 0) return;
      if (dedupeKey && dedupeKey === lastDedupeKey) return;
      if (dedupeKey) setLastDedupeKey(dedupeKey);

      setDocumentsProcessed((n) => n + 1);
      setTotalDetected((n) => n + result.stats.totalDetected);
      setTotalSanitized((n) => n + result.stats.totalSanitized);
      setTotalRejected((n) => n + result.stats.rejectedFalsePositives);

      setCategoryTotals((prev) => {
        const next = { ...prev };
        for (const cat of ALL_PII_CATEGORIES) {
          next[cat as PiiCategory] = (next[cat] ?? 0) + (result.stats.categoryCounts[cat] ?? 0);
        }
        return next;
      });

      const timeLabel = new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });

      setRecentActivity((prev) => [
        {
          id: `run-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          documentLabel,
          fileType,
          mode: result.mode,
          detectedCount: result.stats.totalDetected,
          sanitizedCount: result.stats.totalSanitized,
          rejectedCount: result.stats.rejectedFalsePositives,
          durationMs: result.stats.processingDurationMs,
          timestamp: timeLabel,
        },
        ...prev.slice(0, 14),
      ]);

      setLatencySeries((prev) => [
        ...prev.slice(-11),
        {
          label: timeLabel,
          detected: result.stats.totalDetected,
          rejected: result.stats.rejectedFalsePositives,
          durationMs: result.stats.processingDurationMs,
        },
      ]);
    },
    [lastDedupeKey]
  );

  return (
    <PrivacySessionContext.Provider
      value={{
        mode,
        setMode,
        config,
        setConfig,
        documentsProcessed,
        totalDetected,
        totalSanitized,
        totalRejected,
        categoryTotals,
        recentActivity,
        latencySeries,
        activeDocumentLabel,
        activeFileType,
        activeResult,
        setActiveWorkspaceSnapshot,
        recordSessionRun,
        clearWorkspaceSnapshot,
      }}
    >
      {children}
    </PrivacySessionContext.Provider>
  );
}

export function usePrivacySession() {
  const ctx = useContext(PrivacySessionContext);
  if (!ctx) {
    throw new Error('usePrivacySession must be used within PrivacySessionProvider');
  }
  return ctx;
}
