import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import PizZip from "pizzip";

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEMPLATES_DIR = join(__dirname, "..", "public", "templates");

function addPlaceholders(templatePath) {
  const buf = readFileSync(templatePath);
  const zip = new PizZip(buf);
  let xml = zip.file("word/document.xml").asText();

  // Check if placeholders already exist
  if (xml.includes("{{CONTENT}}")) {
    console.log("Already has placeholders:", templatePath);
    return;
  }

  const contentParagraph = '<w:p><w:r><w:t>{{CONTENT}}</w:t></w:r></w:p>';
  const tablesParagraph = '<w:p><w:r><w:t>{{TABLES}}</w:t></w:r></w:p>';

  // Find last <w:sectPr and insert before it
  const sectPrIdx = xml.lastIndexOf("<w:sectPr");
  if (sectPrIdx === -1) {
    console.error("No <w:sectPr> found in", templatePath);
    return;
  }

  xml = xml.slice(0, sectPrIdx) + contentParagraph + tablesParagraph + xml.slice(sectPrIdx);

  zip.file("word/document.xml", xml);
  const out = zip.generate({ type: "nodebuffer" });
  writeFileSync(templatePath, out);
  console.log("Updated:", templatePath);
}

addPlaceholders(
  join(TEMPLATES_DIR, "Protocol template 2024 (use this template).dotx")
);

addPlaceholders(
  join(TEMPLATES_DIR, "Report template 2022 (Use this template).dotx")
);
