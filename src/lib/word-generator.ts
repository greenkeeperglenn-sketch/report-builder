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

function buildSectionXml(sections: Section[]): string {
  const parts: string[] = [];
  for (const section of sections) {
    parts.push(makeParagraph(section.title, true));
    parts.push(emptyParagraph());
    const lines = section.content.split("\n");
    for (const line of lines) {
      parts.push(makeParagraph(line));
    }
    parts.push(emptyParagraph());
  }
  return parts.join("");
}

function buildTablesXml(tables: TableData[]): string {
  const parts: string[] = [];
  for (let i = 0; i < tables.length; i++) {
    const t = tables[i];
    parts.push(makeParagraph(`Table ${i + 1}: ${t.name}`, true));
    parts.push(makeParagraph(t.headers.join("\t")));
    for (const row of t.rows) {
      parts.push(makeParagraph(row.join("\t")));
    }
    parts.push(emptyParagraph());
  }
  return parts.join("");
}

function buildCaptionsXml(
  images: ImageUpload[],
  charts: ChartExport[]
): string {
  const parts: string[] = [];
  for (const img of images) {
    if (img.caption) parts.push(makeParagraph(img.caption));
  }
  for (const chart of charts) {
    if (chart.title) parts.push(makeParagraph(chart.title));
  }
  return parts.join("");
}

export function generateDocument(
  templateBuffer: ArrayBuffer,
  sections: Section[],
  tables: TableData[] = [],
  images: ImageUpload[] = [],
  charts: ChartExport[] = [],
  documentType: "protocol" | "report" = "protocol"
): Buffer {
  const zip = new PizZip(templateBuffer);

  // Fix .dotx → .docx content type so the output opens as a document
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

  // Build content XML to inject
  const title =
    documentType === "protocol" ? "Trial Protocol" : "Trial Report";

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

  if (tables.length > 0) {
    contentXml += buildTablesXml(tables);
  }

  const captionsXml = buildCaptionsXml(images, charts);
  if (captionsXml) {
    contentXml += captionsXml;
  }

  // Inject content before the final <w:sectPr> in the document body
  const docXml = zip.file("word/document.xml")?.asText();
  if (docXml) {
    const sectPrMatch = docXml.lastIndexOf("<w:sectPr");
    if (sectPrMatch !== -1) {
      const updatedXml =
        docXml.slice(0, sectPrMatch) + contentXml + docXml.slice(sectPrMatch);
      zip.file("word/document.xml", updatedXml);
    }
  }

  const buf = zip.generate({
    type: "nodebuffer",
    mimeType:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  });

  return buf;
}
