import { runSanitizationPipeline } from '../engine/pipeline';
import type { DetectionConfig, SanitizationMode, SanitizationResult } from '../engine/types';
import type { WorkerSanitizeRequest, WorkerSanitizeResponse } from '../workers/sanitization.worker';

export const WORKER_CHAR_THRESHOLD = 50_000;

export interface AsyncSanitizeOptions {
  mode: SanitizationMode;
  config: DetectionConfig;
  isCsv: boolean;
  onProgress?: (percent: number, stage: string) => void;
  signal?: AbortSignal;
}

export interface AsyncSanitizeOutcome {
  result: SanitizationResult;
  executionPath: 'main-thread' | 'web-worker' | 'worker-fallback';
  workerWarning?: string;
}

/**
 * Coordinates local-only document sanitization.
 * Uses synchronous main-thread execution for <= 50,000 characters,
 * and offloads > 50,000 characters to a dedicated Web Worker with cancellation and safe fallback.
 */
export class SanitizationCoordinator {
  private worker: Worker | null = null;
  private activeJobId = 0;

  private ensureWorker(): Worker {
    if (!this.worker) {
      this.worker = new Worker(new URL('../workers/sanitization.worker.ts', import.meta.url), {
        type: 'module',
      });
    }
    return this.worker;
  }

  terminate(): void {
    this.activeJobId += 1;
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
  }

  async run(text: string, options: AsyncSanitizeOptions): Promise<AsyncSanitizeOutcome> {
    const jobId = ++this.activeJobId;

    if (options.signal?.aborted) {
      throw new DOMException('Sanitization cancelled', 'AbortError');
    }

    if (text.length <= WORKER_CHAR_THRESHOLD || typeof Worker === 'undefined') {
      const result = runSanitizationPipeline(text, {
        mode: options.mode,
        config: options.config,
        isCsv: options.isCsv,
        onProgress: options.onProgress,
      });
      return { result, executionPath: 'main-thread' };
    }

    try {
      const result = await new Promise<SanitizationResult>((resolve, reject) => {
        const worker = this.ensureWorker();

        const cleanup = () => {
          worker.removeEventListener('message', handleMessage);
          worker.removeEventListener('error', handleError);
          options.signal?.removeEventListener('abort', handleAbort);
        };

        const handleAbort = () => {
          cleanup();
          // Terminate active worker to halt large CPU work immediately on cancel/supersede
          if (this.worker) {
            this.worker.terminate();
            this.worker = null;
          }
          reject(new DOMException('Sanitization superseded or cancelled', 'AbortError'));
        };

        const handleMessage = (event: MessageEvent<WorkerSanitizeResponse>) => {
          const msg = event.data;
          if (msg.jobId !== jobId) return;

          if (msg.type === 'progress') {
            options.onProgress?.(msg.percent, msg.stage);
          } else if (msg.type === 'result') {
            cleanup();
            resolve(msg.result);
          } else if (msg.type === 'error') {
            cleanup();
            reject(new Error(msg.message));
          }
        };

        const handleError = (event: ErrorEvent) => {
          cleanup();
          if (this.worker) {
            this.worker.terminate();
            this.worker = null;
          }
          reject(new Error(event.message || 'Web Worker execution error'));
        };

        options.signal?.addEventListener('abort', handleAbort, { once: true });
        worker.addEventListener('message', handleMessage);
        worker.addEventListener('error', handleError);

        const req: WorkerSanitizeRequest = {
          jobId,
          text,
          mode: options.mode,
          config: options.config,
          isCsv: options.isCsv,
        };
        worker.postMessage(req);
      });

      return { result, executionPath: 'web-worker' };
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        throw err;
      }

      // Safe local fallback if worker fails in restricted browser contexts
      const fallbackResult = runSanitizationPipeline(text, {
        mode: options.mode,
        config: options.config,
        isCsv: options.isCsv,
        onProgress: options.onProgress,
      });
      return {
        result: fallbackResult,
        executionPath: 'worker-fallback',
        workerWarning:
          err instanceof Error
            ? `Worker fallback activated: ${err.message}`
            : 'Worker unavailable; completed on main thread',
      };
    }
  }
}
