import mammoth from "mammoth";
import * as XLSX from "xlsx";

/**
 * Extract readable text from an uploaded file.
 * Supports .txt, .doc, .docx, .pdf (text-only), .xlsx, .xls, .csv
 */
export async function extractTextFromFile(file: File): Promise<string> {
  const name = file.name.toLowerCase();
  const buffer = await file.arrayBuffer();

  if (name.endsWith(".txt")) {
    return new TextDecoder().decode(buffer);
  }

  if (name.endsWith(".doc") || name.endsWith(".docx")) {
    const result = await mammoth.extractRawText({
      buffer: Buffer.from(buffer),
    });
    return result.value;
  }

  if (name.endsWith(".xlsx") || name.endsWith(".xls") || name.endsWith(".csv")) {
    const workbook = XLSX.read(buffer, { type: "array" });
    const parts: string[] = [];
    for (const sheetName of workbook.SheetNames) {
      const sheet = workbook.Sheets[sheetName];
      const csv = XLSX.utils.sheet_to_csv(sheet);
      parts.push(`--- ${sheetName} ---\n${csv}`);
    }
    return parts.join("\n\n");
  }

  if (name.endsWith(".pdf")) {
    // Basic fallback - PDFs need a dedicated parser.
    // Return a note that PDF was provided but couldn't be fully parsed.
    return `[Attached file: ${file.name} — PDF text extraction not available server-side]`;
  }

  return `[Attached file: ${file.name} — unsupported format]`;
}

/**
 * Extract text from multiple files and combine into a single context string.
 */
export async function extractTextFromFiles(files: File[]): Promise<string> {
  if (files.length === 0) return "";

  const results = await Promise.all(
    files.map(async (f) => {
      const text = await extractTextFromFile(f);
      return `=== ${f.name} ===\n${text}`;
    })
  );

  return results.join("\n\n");
}
