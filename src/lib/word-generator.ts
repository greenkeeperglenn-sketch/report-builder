import PizZip from "pizzip";
import { Section, TableData, ImageUpload, ChartExport } from "./types";

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function makeParagraph(text: string, bold = false): string {
  const rPr = bold ? "<w:rPr><w:b/></w:rPr>" : "";
  return `<w:p><w:r>${rPr}<w:t xml:space="preserve">${escapeXml(text)}</w:t></w:r></w:p>`;
}

function emptyParagraph(): string {
  return "<w:p/>";
}

// ---------------------------------------------------------------------------
// Markdown table parsing
// ---------------------------------------------------------------------------

function parseMarkdownTable(lines: string[]): { headers: string[]; rows: string[][] } | null {
  if (lines.length < 2) return null;
  const parseLine = (l: string) =>
    l.replace(/^\|/, "").replace(/\|$/, "").split("|").map((c) => c.trim());

  const headers = parseLine(lines[0]);
  if (!/^[\s|:-]+$/.test(lines[1])) return null;

  const rows: string[][] = [];
  for (let i = 2; i < lines.length; i++) {
    const cells = parseLine(lines[i]);
    if (cells.length > 0) rows.push(cells);
  }
  return headers.length > 0 ? { headers, rows } : null;
}

// ---------------------------------------------------------------------------
// Word XML builders
// ---------------------------------------------------------------------------

function buildTableCell(text: string, bold = false, shading?: string): string {
  const tcPr = shading
    ? `<w:tcPr><w:shd w:val="clear" w:color="auto" w:fill="${shading}"/></w:tcPr>`
    : "";
  const rPr = bold
    ? '<w:rPr><w:b/><w:sz w:val="20"/></w:rPr>'
    : '<w:rPr><w:sz w:val="20"/></w:rPr>';
  return `<w:tc>${tcPr}<w:p><w:r>${rPr}<w:t xml:space="preserve">${escapeXml(String(text))}</w:t></w:r></w:p></w:tc>`;
}

function buildTableRow(cells: string[], bold = false, shading?: string): string {
  return `<w:tr>${cells.map((c) => buildTableCell(c, bold, shading)).join("")}</w:tr>`;
}

const TABLE_BORDERS = `<w:tblBorders>
  <w:top w:val="single" w:sz="4" w:space="0" w:color="999999"/>
  <w:left w:val="single" w:sz="4" w:space="0" w:color="999999"/>
  <w:bottom w:val="single" w:sz="4" w:space="0" w:color="999999"/>
  <w:right w:val="single" w:sz="4" w:space="0" w:color="999999"/>
  <w:insideH w:val="single" w:sz="4" w:space="0" w:color="999999"/>
  <w:insideV w:val="single" w:sz="4" w:space="0" w:color="999999"/>
</w:tblBorders>`;

const TABLE_PR = `<w:tblPr>
  <w:tblStyle w:val="TableGrid"/>
  <w:tblW w:w="0" w:type="auto"/>
  ${TABLE_BORDERS}
  <w:tblLook w:val="04A0" w:firstRow="1" w:lastRow="0" w:firstColumn="1" w:lastColumn="0" w:noHBand="0" w:noVBand="1"/>
</w:tblPr>`;

function buildWordTable(headers: string[], rows: string[][]): string {
  const headerRow = buildTableRow(headers, true, "D9E2F3");
  const dataRows = rows
    .map((row, i) => buildTableRow(row, false, i % 2 === 1 ? "F2F2F2" : undefined))
    .join("");
  return `<w:tbl>${TABLE_PR}${headerRow}${dataRows}</w:tbl>`;
}

// ---------------------------------------------------------------------------
// Section content builder (handles inline markdown tables)
// ---------------------------------------------------------------------------

function buildSectionXml(sections: Section[]): string {
  const parts: string[] = [];
  for (const section of sections) {
    parts.push(makeParagraph(section.title, true));
    parts.push(emptyParagraph());

    const lines = section.content.split("\n");
    let i = 0;
    while (i < lines.length) {
      if (
        lines[i].includes("|") &&
        i + 1 < lines.length &&
        /^[\s|:-]+$/.test(lines[i + 1])
      ) {
        const tableLines: string[] = [lines[i], lines[i + 1]];
        let j = i + 2;
        while (j < lines.length && lines[j].includes("|") && lines[j].trim() !== "") {
          tableLines.push(lines[j]);
          j++;
        }
        const parsed = parseMarkdownTable(tableLines);
        if (parsed) {
          parts.push(buildWordTable(parsed.headers, parsed.rows));
          parts.push(emptyParagraph());
          i = j;
          continue;
        }
      }
      parts.push(makeParagraph(lines[i]));
      i++;
    }
    parts.push(emptyParagraph());
  }
  return parts.join("");
}

// ---------------------------------------------------------------------------
// Data tables builder (excel tables)
// ---------------------------------------------------------------------------

function buildTablesXml(tables: TableData[]): string {
  const parts: string[] = [];
  for (let i = 0; i < tables.length; i++) {
    const t = tables[i];
    parts.push(makeParagraph(`Table ${i + 1}: ${t.name}`, true));
    parts.push(buildWordTable(t.headers, t.rows.map((r) => r.map(String))));
    parts.push(emptyParagraph());
  }
  return parts.join("");
}

function buildCaptionsXml(images: ImageUpload[], charts: ChartExport[]): string {
  const parts: string[] = [];
  for (const img of images) {
    if (img.caption) parts.push(makeParagraph(img.caption));
  }
  for (const chart of charts) {
    if (chart.title) parts.push(makeParagraph(chart.title));
  }
  return parts.join("");
}

// ---------------------------------------------------------------------------
// Placeholder replacement helper
// ---------------------------------------------------------------------------

/**
 * Find the <w:p> element that contains {{TAG}} and replace the entire
 * paragraph with the provided XML string.
 */
function replacePlaceholder(xml: string, tag: string, replacement: string): string {
  // The placeholder is stored as a single <w:t>{{TAG}}</w:t> inside a <w:p>.
  // We need to find the full <w:p>...</w:p> that wraps it and replace.
  const needle = `{{${tag}}}`;

  // Find the position of the needle in the XML
  const needleIdx = xml.indexOf(needle);
  if (needleIdx === -1) return xml;

  // Walk backwards to find the opening <w:p> or <w:p ...>
  let pStart = needleIdx;
  while (pStart > 0) {
    if (xml.startsWith("<w:p>", pStart) || xml.startsWith("<w:p ", pStart)) break;
    pStart--;
  }

  // Walk forwards to find the closing </w:p>
  let pEnd = xml.indexOf("</w:p>", needleIdx);
  if (pEnd === -1) return xml;
  pEnd += "</w:p>".length;

  return xml.slice(0, pStart) + replacement + xml.slice(pEnd);
}

// ---------------------------------------------------------------------------
// Main document generator
// ---------------------------------------------------------------------------

export function generateDocument(
  templateBuffer: ArrayBuffer,
  sections: Section[],
  tables: TableData[] = [],
  images: ImageUpload[] = [],
  charts: ChartExport[] = [],
  documentType: "protocol" | "report" = "protocol"
): Buffer {
  const zip = new PizZip(templateBuffer);

  // Fix .dotx → .docx content type
  const contentTypesXml = zip.file("[Content_Types].xml")?.asText();
  if (contentTypesXml) {
    zip.file(
      "[Content_Types].xml",
      contentTypesXml.replace(
        "application/vnd.openxmlformats-officedocument.wordprocessingml.template.main+xml",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"
      )
    );
  }

  // Build the replacement XML for each placeholder
  const title = documentType === "protocol" ? "Trial Protocol" : "Trial Report";

  let contentXml = "";
  contentXml += makeParagraph(title, true);
  contentXml += makeParagraph("AI Draft Version 1");
  contentXml += makeParagraph(
    new Date().toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  );
  contentXml += emptyParagraph();
  contentXml += buildSectionXml(sections);

  const captionsXml = buildCaptionsXml(images, charts);
  if (captionsXml) {
    contentXml += captionsXml;
  }

  let tablesXml = "";
  if (tables.length > 0) {
    tablesXml = buildTablesXml(tables);
  }

  // Replace {{CONTENT}} and {{TABLES}} placeholders
  let docXml = zip.file("word/document.xml")?.asText();
  if (docXml) {
    docXml = replacePlaceholder(docXml, "CONTENT", contentXml);
    docXml = replacePlaceholder(docXml, "TABLES", tablesXml);
    zip.file("word/document.xml", docXml);
  }

  const buf = zip.generate({
    type: "nodebuffer",
    mimeType:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  });

  return buf;
}
