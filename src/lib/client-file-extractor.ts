/**
 * Client-side text extraction from files.
 * Reads files in the browser and returns plain text so we avoid sending
 * large binary payloads to the API.
 */

const MAX_TEXT_PER_FILE = 50_000; // ~50k chars per file
const MAX_TOTAL_TEXT = 150_000; // ~150k chars total

async function readAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}

async function readAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(file);
  });
}

async function extractSingleFile(file: File): Promise<string> {
  const name = file.name.toLowerCase();

  // Plain text
  if (name.endsWith(".txt") || name.endsWith(".csv")) {
    const text = await readAsText(file);
    return text.slice(0, MAX_TEXT_PER_FILE);
  }

  // Excel — parse with xlsx in browser
  if (name.endsWith(".xlsx") || name.endsWith(".xls")) {
    try {
      const XLSX = await import("xlsx");
      const buffer = await readAsArrayBuffer(file);
      const workbook = XLSX.read(buffer, { type: "array" });
      const parts: string[] = [];
      for (const sheetName of workbook.SheetNames) {
        const sheet = workbook.Sheets[sheetName];
        const csv = XLSX.utils.sheet_to_csv(sheet);
        parts.push(`--- ${sheetName} ---\n${csv}`);
      }
      return parts.join("\n\n").slice(0, MAX_TEXT_PER_FILE);
    } catch {
      return `[Could not parse ${file.name}]`;
    }
  }

  // For .doc/.docx/.pdf — we can't easily parse these client-side.
  // Read as text (works for some simple cases) or return a note.
  if (name.endsWith(".doc") || name.endsWith(".docx") || name.endsWith(".pdf")) {
    // These need server-side parsing — send them via FormData but individually
    return `__NEEDS_SERVER_PARSE__`;
  }

  // Fallback: try reading as text
  try {
    const text = await readAsText(file);
    return text.slice(0, MAX_TEXT_PER_FILE);
  } catch {
    return `[Could not read ${file.name}]`;
  }
}

export interface ExtractedFiles {
  /** Combined text from all files that were parsed client-side */
  text: string;
  /** Files that need server-side parsing (.doc, .docx, .pdf) */
  serverFiles: File[];
}

export async function extractFilesClientSide(files: File[]): Promise<ExtractedFiles> {
  const textParts: string[] = [];
  const serverFiles: File[] = [];
  let totalLength = 0;

  for (const file of files) {
    const result = await extractSingleFile(file);

    if (result === "__NEEDS_SERVER_PARSE__") {
      serverFiles.push(file);
      continue;
    }

    const entry = `=== ${file.name} ===\n${result}`;
    if (totalLength + entry.length > MAX_TOTAL_TEXT) {
      textParts.push(`=== ${file.name} ===\n[Truncated — file text limit reached]`);
      break;
    }
    textParts.push(entry);
    totalLength += entry.length;
  }

  return {
    text: textParts.join("\n\n"),
    serverFiles,
  };
}
