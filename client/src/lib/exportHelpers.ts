import { buildAuditReportMetadata } from '../engine/pipeline';
import type { DetectionConfig, SanitizationResult } from '../engine/types';

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10 MB

export interface LoadedFileResult {
  fileName: string;
  fileSizeBytes: number;
  fileType: 'txt' | 'csv';
  content: string;
  warnings: string[];
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function hasBinarySignature(bytes: Uint8Array): boolean {
  // Check common binary magic headers (PNG, JPEG, PDF, ZIP/Office, ELF, MZ) or NUL bytes
  if (bytes.length >= 4) {
    // PDF %PDF
    if (bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46) return true;
    // ZIP/DOCX/XLSX PK..
    if (bytes[0] === 0x50 && bytes[1] === 0x4b && bytes[2] === 0x03 && bytes[3] === 0x04) return true;
    // PNG
    if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return true;
  }
  const sampleLen = Math.min(bytes.length, 4096);
  let controlCount = 0;
  for (let i = 0; i < sampleLen; i += 1) {
    const b = bytes[i];
    if (b === 0) return true; // NUL byte indicates binary file
    if (b < 0x09 || (b > 0x0d && b < 0x20)) {
      controlCount += 1;
    }
  }
  return sampleLen > 0 && controlCount / sampleLen > 0.05;
}

/**
 * Validates and reads a .txt or .csv file strictly in browser memory.
 * Rejects unsupported extensions, oversized files (>10 MB), binary payloads, and invalid UTF-8.
 */
export async function readValidatedTextFile(file: File): Promise<LoadedFileResult> {
  const warnings: string[] = [];
  const lowerName = file.name.toLowerCase();

  let fileType: 'txt' | 'csv';
  if (lowerName.endsWith('.csv')) {
    fileType = 'csv';
  } else if (lowerName.endsWith('.txt')) {
    fileType = 'txt';
  } else {
    throw new Error('Unsupported file type. Only .txt and .csv files are accepted.');
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error(
      `File exceeds the 10 MB limit (${formatBytes(file.size)} provided).`
    );
  }

  if (file.size === 0) {
    return {
      fileName: file.name,
      fileSizeBytes: 0,
      fileType,
      content: '',
      warnings: ['Uploaded file is empty (0 bytes).'],
    };
  }

  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);

  if (hasBinarySignature(bytes)) {
    throw new Error(
      'File content appears to be binary or encoded rather than plain UTF-8 text.'
    );
  }

  let content = '';
  try {
    const decoder = new TextDecoder('utf-8', { fatal: true });
    content = decoder.decode(bytes);
  } catch {
    throw new Error(
      'Invalid UTF-8 byte sequence detected. Please save the document as UTF-8 and retry.'
    );
  }

  if (fileType === 'csv') {
    const nonEmptyLines = content.split(/\r\n|\r|\n/).filter((l) => l.trim().length > 0);
    if (nonEmptyLines.length > 0 && !nonEmptyLines[0].includes(',')) {
      warnings.push('CSV header has a single column (no comma delimiters detected).');
    }
  }

  return {
    fileName: file.name,
    fileSizeBytes: file.size,
    fileType,
    content,
    warnings,
  };
}

export async function copyToClipboardSafely(text: string): Promise<void> {
  if (!text) {
    throw new Error('No sanitized output available to copy.');
  }
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  throw new Error('Clipboard API is unavailable in this browser context.');
}

export function triggerTextDownload(
  content: string,
  filename: string,
  mimeType: string
): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  try {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.rel = 'noopener';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } finally {
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}

export function downloadSanitizedText(
  result: SanitizationResult,
  baseName = 'sanitized-document'
): string {
  const safeBase = baseName.replace(/\.(txt|csv)$/i, '').replace(/[^a-zA-Z0-9._-]/g, '_') || 'sanitized-document';
  const ext = result.isCsv ? 'csv' : 'txt';
  const filename = `${safeBase}.sanitized.${ext}`;
  const mime = result.isCsv ? 'text/csv;charset=utf-8' : 'text/plain;charset=utf-8';
  triggerTextDownload(result.sanitizedText, filename, mime);
  return filename;
}

export function downloadAuditReportJson(
  result: SanitizationResult,
  fileType: 'text' | 'txt' | 'csv',
  config: DetectionConfig,
  baseName = 'pii-guard-audit'
): string {
  const safeBase = baseName.replace(/\.(txt|csv|json)$/i, '').replace(/[^a-zA-Z0-9._-]/g, '_') || 'pii-guard-audit';
  const filename = `${safeBase}.audit.json`;
  const metadata = buildAuditReportMetadata(result, fileType, config);
  triggerTextDownload(JSON.stringify(metadata, null, 2), filename, 'application/json;charset=utf-8');
  return filename;
}
