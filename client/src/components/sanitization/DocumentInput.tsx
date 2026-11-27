import { useRef, useState } from 'react';
import {
  AlertCircle,
  FileSpreadsheet,
  FileText,
  Trash2,
  Upload,
} from 'lucide-react';
import { formatBytes, MAX_UPLOAD_BYTES, readValidatedTextFile } from '../../lib/exportHelpers';

interface DocumentInputProps {
  value: string;
  onChange: (nextValue: string) => void;
  onFileLoaded: (payload: {
    fileName: string;
    fileSizeBytes: number;
    fileType: 'txt' | 'csv';
    content: string;
    warnings: string[];
  }) => void;
  onClear: () => void;
  fileName: string | null;
  fileSizeBytes: number | null;
  fileType: 'text' | 'txt' | 'csv';
  characterCount: number;
  lineCount: number;
  byteCount: number;
  fileError: string | null;
  onFileError: (msg: string | null) => void;
}

export function DocumentInput({
  value,
  onChange,
  onFileLoaded,
  onClear,
  fileName,
  fileSizeBytes,
  fileType,
  characterCount,
  lineCount,
  byteCount,
  fileError,
  onFileError,
}: DocumentInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [readingFile, setReadingFile] = useState(false);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    setReadingFile(true);
    onFileError(null);

    try {
      const loaded = await readValidatedTextFile(file);
      onFileLoaded(loaded);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Unable to read file locally.';
      onFileError(message);
    } finally {
      setReadingFile(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <section
      aria-labelledby="doc-input-heading"
      className="rounded-2xl border border-[#AFB4CE] bg-white p-5 shadow-[0_8px_24px_-10px_rgba(18,20,31,0.10)] dark:border-[#383E5C] dark:bg-[#1B1F30] dark:shadow-[0_12px_32px_-12px_rgba(0,0,0,0.55)]"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 id="doc-input-heading" className="text-sm font-bold tracking-[-0.01em] text-[#12141F] dark:text-white">
            Source Document Input
          </h2>
          <p className="text-xs text-[#4F5580] dark:text-[#AFB4CE]">
            Processed 100% locally in browser memory — never transmitted to any server.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {fileName && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#AFB4CE] bg-[#E4E6F0] px-3 py-1 text-[11px] font-medium text-[#12141F] dark:border-[#383E5C] dark:bg-[#232739] dark:text-[#E4E6F0]">
              {fileType === 'csv' ? (
                <FileSpreadsheet className="h-3.5 w-3.5 text-[#4F5580] dark:text-[#AFB4CE]" />
              ) : (
                <FileText className="h-3.5 w-3.5 text-[#4F5580] dark:text-[#AFB4CE]" />
              )}
              <span className="max-w-[160px] truncate">{fileName}</span>
              {fileSizeBytes !== null && (
                <span className="font-mono text-[10px] text-[#4F5580] dark:text-[#AFB4CE]">
                  ({formatBytes(fileSizeBytes)})
                </span>
              )}
            </span>
          )}

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={readingFile}
            className="inline-flex items-center gap-1.5 rounded-full border border-[#AFB4CE] bg-white px-3.5 py-1.5 text-xs font-medium text-[#12141F] transition hover:border-[#4F5580] hover:bg-[#E4E6F0]/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4F5580] disabled:opacity-50 dark:border-[#383E5C] dark:bg-[#232739] dark:text-[#E4E6F0] dark:hover:border-[#5B6396] dark:hover:bg-[#383E5C]"
          >
            <Upload className="h-3.5 w-3.5 text-[#4F5580] dark:text-[#AFB4CE]" />
            {readingFile ? 'Reading...' : 'Browse .txt / .csv'}
          </button>

          <button
            type="button"
            onClick={onClear}
            disabled={!value && !fileName}
            className="inline-flex items-center gap-1.5 rounded-full border border-[#AFB4CE] bg-[#E4E6F0]/60 px-3.5 py-1.5 text-xs font-medium text-[#12141F] transition hover:border-rose-400 hover:bg-rose-100 hover:text-rose-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-700 disabled:cursor-not-allowed disabled:opacity-40 dark:border-[#383E5C] dark:bg-[#12141F] dark:text-[#E4E6F0] dark:hover:border-rose-500/60 dark:hover:bg-rose-950/60 dark:hover:text-rose-200"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Clear &amp; Reset Memory
          </button>
        </div>
      </div>

      {/* Drag & drop zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          void handleFiles(e.dataTransfer.files);
        }}
        className={`mt-4 rounded-xl border transition ${
          isDragging
            ? 'border-[#4F5580] bg-[#E4E6F0]/70 ring-2 ring-[#4F5580]/20 dark:border-[#5B6396] dark:bg-[#232739] dark:ring-[#5B6396]/30'
            : 'border-[#AFB4CE] bg-[#E4E6F0]/35 dark:border-[#383E5C] dark:bg-[#12141F]/80'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,.csv,text/plain,text/csv"
          aria-label="Upload .txt or .csv file up to 10 MB"
          onChange={(e) => void handleFiles(e.target.files)}
          className="sr-only"
        />

        <label htmlFor="pii-document-editor" className="sr-only">
          Sensitive text or CSV input for local PII sanitization
        </label>
        <textarea
          id="pii-document-editor"
          rows={7}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Paste sensitive text, logs, support tickets, or drag-and-drop a .txt / .csv file (max 10 MB)..."
          spellCheck={false}
          className="w-full resize-y rounded-t-xl bg-transparent px-4 py-3 font-mono text-xs leading-relaxed text-[#12141F] placeholder:font-sans placeholder:text-[#575D8A] focus:outline-none dark:text-[#E4E6F0] dark:placeholder:text-[#9CA3C7]"
        />

        <div className="flex flex-wrap items-center justify-between gap-2 rounded-b-xl border-t border-[#AFB4CE] bg-white px-4 py-2 text-[11px] text-[#4F5580] dark:border-[#383E5C] dark:bg-[#12141F] dark:text-[#AFB4CE]">
          <div className="flex flex-wrap items-center gap-4 font-mono">
            <span>{characterCount.toLocaleString()} chars</span>
            <span>{lineCount.toLocaleString()} lines</span>
            <span>{formatBytes(byteCount)} UTF-8</span>
          </div>
          <span className="text-[#4F5580] dark:text-[#AFB4CE]">
            Drop .txt or .csv • Max {formatBytes(MAX_UPLOAD_BYTES)}
          </span>
        </div>
      </div>

      {fileError && (
        <div
          role="alert"
          className="mt-3 flex items-start gap-2 rounded-xl border border-rose-300 bg-rose-50 px-3.5 py-2.5 text-xs text-rose-900 dark:border-rose-500/40 dark:bg-rose-950/50 dark:text-rose-200"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-700 dark:text-rose-400" />
          <span>{fileError}</span>
        </div>
      )}
    </section>
  );
}
