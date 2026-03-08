import Docxtemplater from "docxtemplater";
import PizZip from "pizzip";
import { Section, TableData, ImageUpload, ChartExport } from "./types";

function buildSectionsContent(sections: Section[]): string {
  return sections
    .map((s) => `${s.title}\n\n${s.content}`)
    .join("\n\n---\n\n");
}

function buildTablesContent(tables: TableData[]): string {
  return tables
    .map(
      (t, i) =>
        `Table ${i + 1}: ${t.name}\n${t.headers.join("\t")}\n${t.rows
          .map((r) => r.join("\t"))
          .join("\n")}`
    )
    .join("\n\n");
}

function buildImageCaptions(
  images: ImageUpload[],
  charts: ChartExport[]
): string {
  const imageCaptions = images.map((img) => img.caption).join("\n");
  const chartCaptions = charts.map((c) => c.title).join("\n");
  return [imageCaptions, chartCaptions].filter(Boolean).join("\n");
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
  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
    delimiters: { start: "{{", end: "}}" },
  });

  const title =
    documentType === "protocol" ? "Trial Protocol" : "Trial Report";

  doc.render({
    title,
    draft_version: "AI Draft Version 1",
    sections_content: buildSectionsContent(sections),
    tables_content: buildTablesContent(tables),
    image_captions: buildImageCaptions(images, charts),
    date: new Date().toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
  });

  const buf = doc.getZip().generate({
    type: "nodebuffer",
    mimeType:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  });

  return buf;
}
