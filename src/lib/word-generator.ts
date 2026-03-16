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

function buildTableCell(text: string, bold = false, shading?: string): string {
  const tcPr = shading
    ? `<w:tcPr><w:shd w:val="clear" w:color="auto" w:fill="${shading}"/></w:tcPr>`
    : "";
  const rPr = bold ? "<w:rPr><w:b/><w:sz w:val=\"20\"/></w:rPr>" : "<w:rPr><w:sz w:val=\"20\"/></w:rPr>";
  return `<w:tc>${tcPr}<w:p><w:r>${rPr}<w:t xml:space="preserve">${escapeXml(String(text))}</w:t></w:r></w:p></w:tc>`;
}

function buildTableRow(cells: string[], bold = false, shading?: string): string {
  return `<w:tr>${cells.map((c) => buildTableCell(c, bold, shading)).join("")}</w:tr>`;
}

function buildWordTable(table: TableData, index: number): string {
  const parts: string[] = [];

  // Table title
  parts.push(makeParagraph(`Table ${index + 1}: ${table.name}`, true));

  // Table XML with borders and auto-fit layout
  const tblPr = `<w:tblPr>
    <w:tblStyle w:val="TableGrid"/>
    <w:tblW w:w="0" w:type="auto"/>
    <w:tblBorders>
      <w:top w:val="single" w:sz="4" w:space="0" w:color="999999"/>
      <w:left w:val="single" w:sz="4" w:space="0" w:color="999999"/>
      <w:bottom w:val="single" w:sz="4" w:space="0" w:color="999999"/>
      <w:right w:val="single" w:sz="4" w:space="0" w:color="999999"/>
      <w:insideH w:val="single" w:sz="4" w:space="0" w:color="999999"/>
      <w:insideV w:val="single" w:sz="4" w:space="0" w:color="999999"/>
    </w:tblBorders>
    <w:tblLook w:val="04A0" w:firstRow="1" w:lastRow="0" w:firstColumn="1" w:lastColumn="0" w:noHBand="0" w:noVBand="1"/>
  </w:tblPr>`;

  // Header row with shading
  const headerRow = buildTableRow(table.headers, true, "D9E2F3");

  // Data rows with alternating shading
  const dataRows = table.rows
    .map((row, i) => {
      const cells = row.map((cell) => String(cell));
      const shade = i % 2 === 1 ? "F2F2F2" : undefined;
      return buildTableRow(cells, false, shade);
    })
    .join("");

  parts.push(`<w:tbl>${tblPr}${headerRow}${dataRows}</w:tbl>`);
  parts.push(emptyParagraph());

  return parts.join("");
}

function buildTablesXml(tables: TableData[]): string {
  return tables.map((t, i) => buildWordTable(t, i)).join("");
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
