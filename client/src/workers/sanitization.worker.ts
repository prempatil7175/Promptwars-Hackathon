import { runSanitizationPipeline } from '../engine/pipeline';
import type { DetectionConfig, SanitizationMode, SanitizationResult } from '../engine/types';

export interface WorkerSanitizeRequest {
  jobId: number;
  text: string;
  mode: SanitizationMode;
  config: DetectionConfig;
  isCsv: boolean;
}

export type WorkerSanitizeResponse =
  | {
      type: 'progress';
      jobId: number;
      percent: number;
      stage: string;
    }
  | {
      type: 'result';
      jobId: number;
      result: SanitizationResult;
    }
  | {
      type: 'error';
      jobId: number;
      message: string;
    };

self.onmessage = (event: MessageEvent<WorkerSanitizeRequest>) => {
  const { jobId, text, mode, config, isCsv } = event.data;

  try {
    const result = runSanitizationPipeline(text, {
      mode,
      config,
      isCsv,
      onProgress: (percent, stage) => {
        const msg: WorkerSanitizeResponse = {
          type: 'progress',
          jobId,
          percent,
          stage,
        };
        self.postMessage(msg);
      },
    });

    const doneMsg: WorkerSanitizeResponse = {
      type: 'result',
      jobId,
      result,
    };
    self.postMessage(doneMsg);
  } catch (err) {
    const errMsg: WorkerSanitizeResponse = {
      type: 'error',
      jobId,
      message: err instanceof Error ? err.message : 'Worker processing failed',
    };
    self.postMessage(errMsg);
  }
};
