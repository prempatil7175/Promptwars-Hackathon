import type { CsvParseResult } from './types';

/**
 * RFC4180-compatible CSV parser supporting quoted fields, embedded commas,
 * embedded CRLF/LF newlines, escaped double quotes (""), and malformed CSV recovery.
 */
export function parseCsv(input: string): CsvParseResult {
  const warnings: string[] = [];
  if (!input.length) {
    return { headers: [], rows: [], warnings, hasHeader: false };
  }

  // Strip UTF-8 BOM if present
  const text = input.charCodeAt(0) === 0xfeff ? input.slice(1) : input;

  const records: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let inQuotes = false;
  let fieldStartedWithQuote = false;

  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];

    if (inQuotes) {
      if (ch === '"') {
        const next = text[i + 1];
        if (next === '"') {
          currentField += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        currentField += ch;
      }
      continue;
    }

    if (ch === '"' && currentField.length === 0 && !fieldStartedWithQuote) {
      inQuotes = true;
      fieldStartedWithQuote = true;
      continue;
    }

    if (ch === '"') {
      warnings.push(`Row ${records.length + 1}: unexpected quote inside unquoted field`);
      currentField += ch;
      continue;
    }

    if (ch === ',') {
      currentRow.push(currentField);
      currentField = '';
      fieldStartedWithQuote = false;
      continue;
    }

    if (ch === '\r' || ch === '\n') {
      if (ch === '\r' && text[i + 1] === '\n') {
        i += 1;
      }
      currentRow.push(currentField);
      records.push(currentRow);
      currentRow = [];
      currentField = '';
      fieldStartedWithQuote = false;
      continue;
    }

    currentField += ch;
  }

  if (inQuotes) {
    warnings.push(`Row ${records.length + 1}: unclosed quoted field auto-closed at EOF`);
  }

  if (currentField.length > 0 || currentRow.length > 0 || fieldStartedWithQuote) {
    currentRow.push(currentField);
    records.push(currentRow);
  }

  // Remove single trailing completely empty row caused by final newline
  if (
    records.length > 1 &&
    records[records.length - 1].length === 1 &&
    records[records.length - 1][0] === ''
  ) {
    records.pop();
  }

  if (records.length === 0) {
    return { headers: [], rows: [], warnings, hasHeader: false };
  }

  const headers = records[0];
  const rows = records.slice(1);
  const expectedCols = headers.length;
  rows.forEach((row, idx) => {
    if (row.length !== expectedCols) {
      warnings.push(
        `Row ${idx + 2}: expected ${expectedCols} columns, found ${row.length}`
      );
    }
  });

  return {
    headers,
    rows,
    warnings,
    hasHeader: true,
  };
}

/** Escapes and quotes a single CSV cell according to RFC4180. */
export function serializeCsvCell(value: string): string {
  const needsQuotes =
    value.includes(',') ||
    value.includes('"') ||
    value.includes('\n') ||
    value.includes('\r');

  if (!needsQuotes) {
    return value;
  }
  return `"${value.replace(/"/g, '""')}"`;
}

/** Serializes headers + rows back into an RFC4180 CSV string. */
export function serializeCsv(headers: string[], rows: string[][]): string {
  if (headers.length === 0 && rows.length === 0) return '';
  const allRows = headers.length > 0 ? [headers, ...rows] : rows;
  return allRows
    .map((row) => row.map((cell) => serializeCsvCell(cell)).join(','))
    .join('\n');
}
