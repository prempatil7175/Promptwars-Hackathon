import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ComparisonPanel } from '../components/sanitization/ComparisonPanel';
import { DetectionSettings } from '../components/sanitization/DetectionSettings';
import { DetectionSummary } from '../components/sanitization/DetectionSummary';
import { DocumentInput } from '../components/sanitization/DocumentInput';
import { ExportControls } from '../components/sanitization/ExportControls';
import { ProcessingStatus } from '../components/sanitization/ProcessingStatus';
import { SampleSelector } from '../components/sanitization/SampleSelector';
import { SanitizationModeSelector } from '../components/sanitization/SanitizationModeSelector';
import { usePrivacySession } from '../context/PrivacySessionContext';
import { useToast } from '../context/ToastContext';
import type { SampleDocument, SanitizationResult } from '../engine/types';
import { SanitizationCoordinator } from '../lib/sanitizationRunner';

export function AIPlaygroundPage() {
  const { addToast } = useToast();
  const {
    mode,
    setMode,
    config,
    setConfig,
    setActiveWorkspaceSnapshot,
    recordSessionRun,
    clearWorkspaceSnapshot,
  } = usePrivacySession();

  const [rawText, setRawText] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileSizeBytes, setFileSizeBytes] = useState<number | null>(null);
  const [fileType, setFileType] = useState<'text' | 'txt' | 'csv'>('text');
  const [activeSampleId, setActiveSampleId] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const [result, setResult] = useState<SanitizationResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [progressStage, setProgressStage] = useState('Idle');
  const [executionPath, setExecutionPath] = useState<
    'main-thread' | 'web-worker' | 'worker-fallback'
  >('main-thread');
  const [workerWarning, setWorkerWarning] = useState<string | null>(null);

  const coordinatorRef = useRef<SanitizationCoordinator | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const pendingRecordLabelRef = useRef<string | null>(null);

  if (!coordinatorRef.current) {
    coordinatorRef.current = new SanitizationCoordinator();
  }

  // Terminate Web Worker and abort stale jobs on unmount; clear transient sensitive input
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
      coordinatorRef.current?.terminate();
      clearWorkspaceSnapshot();
    };
  }, [clearWorkspaceSnapshot]);

  const inputMetrics = useMemo(() => {
    const byteCount = new TextEncoder().encode(rawText).length;
    const lineCount = rawText ? rawText.split(/\r\n|\r|\n/).length : 0;
    return {
      characterCount: rawText.length,
      lineCount,
      byteCount,
    };
  }, [rawText]);

  const executeSanitization = useCallback(
    async (
      textToProcess: string,
      docLabel: string,
      docFileType: 'text' | 'txt' | 'csv',
      shouldRecordSession: boolean
    ) => {
      abortControllerRef.current?.abort();

      if (!textToProcess) {
        setResult(null);
        setIsProcessing(false);
        setProgressPercent(0);
        setProgressStage('Idle');
        setWorkerWarning(null);
        clearWorkspaceSnapshot();
        return;
      }

      const controller = new AbortController();
      abortControllerRef.current = controller;

      setIsProcessing(true);
      setProgressPercent(10);
      setProgressStage('Initializing local scan');
      setWorkerWarning(null);

      try {
        const outcome = await coordinatorRef.current!.run(textToProcess, {
          mode,
          config,
          isCsv: docFileType === 'csv',
          signal: controller.signal,
          onProgress: (pct, stage) => {
            if (!controller.signal.aborted) {
              setProgressPercent(pct);
              setProgressStage(stage);
            }
          },
        });

        if (controller.signal.aborted) return;

        setResult(outcome.result);
        setExecutionPath(outcome.executionPath);
        setWorkerWarning(outcome.workerWarning ?? null);
        setIsProcessing(false);
        setProgressPercent(100);
        setProgressStage('Complete');

        setActiveWorkspaceSnapshot({
          label: docLabel,
          fileType: docFileType,
          result: outcome.result,
        });

        if (shouldRecordSession) {
          recordSessionRun({
            documentLabel: docLabel,
            fileType: docFileType,
            result: outcome.result,
            dedupeKey: `${docLabel}:${docFileType}:${textToProcess.length}:${outcome.result.mode}:${outcome.result.stats.totalDetected}`,
          });
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') {
          return;
        }
        setIsProcessing(false);
        addToast({
          title: 'Local processing error',
          description: 'Unable to process document safely.',
          variant: 'warning',
        });
      }
    },
    [
      mode,
      config,
      setActiveWorkspaceSnapshot,
      recordSessionRun,
      clearWorkspaceSnapshot,
      addToast,
    ]
  );

  // Debounced (150ms) live local detection & sanitization
  useEffect(() => {
    const label = fileName || 'Pasted Text';
    const shouldRecord = Boolean(pendingRecordLabelRef.current);
    const timerId = window.setTimeout(() => {
      pendingRecordLabelRef.current = null;
      void executeSanitization(rawText, label, fileType, shouldRecord);
    }, 150);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [rawText, fileName, fileType, executeSanitization]);

  const handleTextChange = (nextValue: string) => {
    setActiveSampleId(null);
    setFileError(null);
    if (!rawText && nextValue.trim()) {
      pendingRecordLabelRef.current = fileName || 'Pasted Text';
    }
    setRawText(nextValue);
  };

  const handleFileLoaded = (payload: {
    fileName: string;
    fileSizeBytes: number;
    fileType: 'txt' | 'csv';
    content: string;
    warnings: string[];
  }) => {
    setActiveSampleId(null);
    setFileName(payload.fileName);
    setFileSizeBytes(payload.fileSizeBytes);
    setFileType(payload.fileType);
    setFileError(null);
    pendingRecordLabelRef.current = payload.fileName;
    setRawText(payload.content);

    addToast({
      title: `Loaded ${payload.fileName} locally`,
      description:
        payload.warnings[0] ||
        `Validated UTF-8 ${payload.fileType.toUpperCase()} — zero bytes uploaded.`,
      variant: payload.warnings.length > 0 ? 'warning' : 'success',
    });
  };

  const handleSelectSample = (sample: SampleDocument) => {
    setActiveSampleId(sample.id);
    setFileName(sample.fileName);
    setFileSizeBytes(new TextEncoder().encode(sample.content).length);
    setFileType(sample.fileType);
    setFileError(null);
    pendingRecordLabelRef.current = sample.fileName;
    setRawText(sample.content);
  };

  const handleLoadAiSynthetic = (payload: {
    title: string;
    fileType: 'txt' | 'csv';
    content: string;
  }) => {
    setActiveSampleId(null);
    setFileName(`${payload.title}.${payload.fileType}`);
    setFileSizeBytes(new TextEncoder().encode(payload.content).length);
    setFileType(payload.fileType);
    setFileError(null);
    pendingRecordLabelRef.current = payload.title;
    setRawText(payload.content);
  };

  const handleClear = () => {
    abortControllerRef.current?.abort();
    pendingRecordLabelRef.current = null;
    setRawText('');
    setFileName(null);
    setFileSizeBytes(null);
    setFileType('text');
    setActiveSampleId(null);
    setFileError(null);
    setResult(null);
    setIsProcessing(false);
    setWorkerWarning(null);
    clearWorkspaceSnapshot();
    addToast({
      title: 'Workspace memory cleared',
      description: 'Transient document text and pseudonym mappings wiped from memory.',
      variant: 'info',
    });
  };

  return (
    <div className="space-y-5">
      <SampleSelector
        activeSampleId={activeSampleId}
        onSelectSample={handleSelectSample}
        onLoadAiSynthetic={handleLoadAiSynthetic}
      />

      <div className="grid gap-5 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          <DocumentInput
            value={rawText}
            onChange={handleTextChange}
            onFileLoaded={handleFileLoaded}
            onClear={handleClear}
            fileName={fileName}
            fileSizeBytes={fileSizeBytes}
            fileType={fileType}
            characterCount={inputMetrics.characterCount}
            lineCount={inputMetrics.lineCount}
            byteCount={inputMetrics.byteCount}
            fileError={fileError}
            onFileError={setFileError}
          />

          <ProcessingStatus
            isProcessing={isProcessing}
            progressPercent={progressPercent}
            progressStage={progressStage}
            executionPath={executionPath}
            workerWarning={workerWarning}
            characterCount={inputMetrics.characterCount}
          />
        </div>

        <div className="space-y-4">
          <SanitizationModeSelector
            mode={mode}
            onChange={(nextMode) => {
              if (rawText) pendingRecordLabelRef.current = fileName || 'Pasted Text';
              setMode(nextMode);
            }}
          />
          <DetectionSettings
            config={config}
            onChange={(nextConfig) => {
              setConfig(nextConfig);
            }}
          />
        </div>
      </div>

      <ComparisonPanel
        originalText={rawText}
        result={result}
        isProcessing={isProcessing}
      />

      <DetectionSummary result={result} />

      <ExportControls
        result={result}
        fileType={fileType}
        fileName={fileName}
        config={config}
      />
    </div>
  );
}
