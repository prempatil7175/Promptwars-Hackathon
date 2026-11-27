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
      className="rounded-2xl border border-white/10 bg-[#111116] p-5 shadow-xl"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 id="doc-input-heading" className="text-sm font-semibold text-zinc-100">
            Source Document Input
          </h2>
          <p className="text-xs text-zinc-400">
            Processed 100% locally in browser memory — never transmitted to any server.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {fileName && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-1 text-[11px] font-medium text-indigo-200">
              {fileType === 'csv' ? (
                <FileSpreadsheet className="h-3.5 w-3.5 text-indigo-400" />
              ) : (
                <FileText className="h-3.5 w-3.5 text-indigo-400" />
              )}
              <span className="max-w-[160px] truncate">{fileName}</span>
              {fileSizeBytes !== null && (
                <span className="font-mono text-[10px] text-indigo-300/80">
                  ({formatBytes(fileSizeBytes)})
                </span>
              )}
            </span>
          )}

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={readingFile}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-zinc-200 transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400 disabled:opacity-50"
          >
            <Upload className="h-3.5 w-3.5 text-indigo-400" />
            {readingFile ? 'Reading...' : 'Browse .txt / .csv'}
          </button>

          <button
            type="button"
            onClick={onClear}
            disabled={!value && !fileName}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-zinc-300 transition hover:border-rose-500/30 hover:bg-rose-500/10 hover:text-rose-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-400 disabled:cursor-not-allowed disabled:opacity-40"
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
            ? 'border-indigo-400 bg-indigo-500/10'
            : 'border-white/10 bg-[#09090b]'
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
          className="w-full resize-y rounded-t-xl bg-transparent px-4 py-3 font-mono text-xs leading-relaxed text-zinc-100 placeholder:font-sans placeholder:text-zinc-500 focus:outline-none"
        />

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/10 px-4 py-2 text-[11px] text-zinc-400">
          <div className="flex flex-wrap items-center gap-4 font-mono">
            <span>{characterCount.toLocaleString()} chars</span>
            <span>{lineCount.toLocaleString()} lines</span>
            <span>{formatBytes(byteCount)} UTF-8</span>
          </div>
          <span className="text-zinc-500">
            Drop .txt or .csv • Max {formatBytes(MAX_UPLOAD_BYTES)}
          </span>
        </div>
      </div>

      {fileError && (
        <div
          role="alert"
          className="mt-3 flex items-start gap-2 rounded-xl border border-rose-500/35 bg-rose-500/10 px-3.5 py-2.5 text-xs text-rose-200"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />
          <span>{fileError}</span>
        </div>
      )}
    </section>
  );
}
