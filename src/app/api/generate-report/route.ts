import { NextRequest, NextResponse } from "next/server";
import { generateWithAI } from "@/lib/ai";
import { DEFAULT_REPORT_PROMPT } from "@/lib/prompts";
import { Section, TableData } from "@/lib/types";
import { parseExcelBuffer } from "@/lib/excel-parser";
import { v4 as uuidv4 } from "uuid";
import mammoth from "mammoth";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const protocolFile = formData.get("protocol") as File | null;
    const excelFile = formData.get("excel") as File | null;
    const notes = formData.get("notes") as string;
    const customPrompt = formData.get("customPrompt") as string | null;
    const imageCount = parseInt(formData.get("imageCount") as string) || 0;

    let protocolText = "";
    if (protocolFile) {
      const buffer = await protocolFile.arrayBuffer();
      const result = await mammoth.extractRawText({
        buffer: Buffer.from(buffer),
      });
      protocolText = result.value;
    }

    let tables: TableData[] = [];
    if (excelFile) {
      const buffer = await excelFile.arrayBuffer();
      tables = parseExcelBuffer(buffer);
    }

    const tablesText = tables
      .map(
        (t, i) =>
          `Table ${i + 1} (${t.name}):\n${t.headers.join(" | ")}\n${t.rows
            .map((r) => r.join(" | "))
            .join("\n")}`
      )
      .join("\n\n");

    const userContent = `Protocol:
${protocolText || "No protocol document provided."}

Data Tables:
${tablesText || "No data tables provided."}

Notes:
${notes || "No additional notes."}

Number of photographs: ${imageCount}

Based on the above protocol, data, and notes, generate a complete scientific report.`;

    const prompt = customPrompt || DEFAULT_REPORT_PROMPT;
    const raw = await generateWithAI(prompt, userContent);

    const jsonMatch = raw.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      return NextResponse.json(
        { error: "Failed to parse AI response" },
        { status: 500 }
      );
    }

    const parsed = JSON.parse(jsonMatch[0]) as {
      title: string;
      content: string;
    }[];
    const sections: Section[] = parsed.map((s) => ({
      id: uuidv4(),
      title: s.title,
      content: s.content,
    }));

    return NextResponse.json({ sections, tables });
  } catch (error) {
    console.error("Report generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 }
    );
  }
}
