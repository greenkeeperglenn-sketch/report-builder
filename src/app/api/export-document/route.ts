import { NextRequest, NextResponse } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";
import { generateDocument } from "@/lib/word-generator";
import { Section, TableData, ImageUpload, ChartExport } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      type,
      sections,
      tables = [],
      images = [],
      charts = [],
    } = body as {
      type: "protocol" | "report";
      sections: Section[];
      tables?: TableData[];
      images?: ImageUpload[];
      charts?: ChartExport[];
    };

    const templateName =
      type === "protocol"
        ? "Protocol template 2024 (use this template).dotx"
        : "Report template 2022 (Use this template).dotx";

    const templatePath = join(process.cwd(), "public", "templates", templateName);

    let templateBuffer: ArrayBuffer;
    try {
      const buf = readFileSync(templatePath);
      templateBuffer = buf.buffer.slice(
        buf.byteOffset,
        buf.byteOffset + buf.byteLength
      );
    } catch {
      // If template not found, create a minimal docx
      return NextResponse.json(
        { error: `Template not found: ${templateName}` },
        { status: 404 }
      );
    }

    const docBuffer = generateDocument(
      templateBuffer,
      sections,
      tables,
      images,
      charts,
      type
    );

    const filename =
      type === "protocol"
        ? "Protocol - AI Draft Version 1.docx"
        : "Report - AI Draft Version 1.docx";

    return new NextResponse(new Uint8Array(docBuffer), {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Document export error:", error);
    return NextResponse.json(
      { error: "Failed to generate document" },
      { status: 500 }
    );
  }
}
