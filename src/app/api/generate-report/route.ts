import { NextRequest, NextResponse } from "next/server";
import { generateWithAI } from "@/lib/ai";
import { DEFAULT_REPORT_PROMPT } from "@/lib/prompts";
import { Section, TableData } from "@/lib/types";
import { parseExcelBuffer } from "@/lib/excel-parser";
import { v4 as uuidv4 } from "uuid";
import mammoth from "mammoth";
import { extractTextFromFiles } from "@/lib/file-extractor";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const protocolFile = formData.get("protocol") as File | null;
    const excelFile = formData.get("excel") as File | null;
    const notes = formData.get("notes") as string;
    const customPrompt = formData.get("customPrompt") as string | null;
    const imageCount = parseInt(formData.get("imageCount") as string) || 0;
    const additionalText = (formData.get("additionalText") as string) || "";

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

    // Only .doc/.docx/.pdf files that need server-side parsing come through here
    const additionalFiles = formData.getAll("additionalFiles") as File[];
    const serverParsedText = await extractTextFromFiles(additionalFiles);
    const filesText = [additionalText, serverParsedText].filter(Boolean).join("\n\n");

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

Additional reference documents:
${filesText || "No additional documents provided."}

Based on the above protocol, data, notes, and reference documents, generate a complete scientific report.`;

    const prompt = customPrompt || DEFAULT_REPORT_PROMPT;
    const raw = await generateWithAI(prompt, userContent);

    const jsonMatch = raw.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.error("AI response did not contain JSON array:", raw.slice(0, 500));
      return NextResponse.json(
        { error: "Failed to parse AI response. The AI did not return valid JSON." },
        { status: 500 }
      );
    }

    let parsed: { title: string; content: string }[];
    try {
      parsed = JSON.parse(jsonMatch[0]);
    } catch (parseErr) {
      console.error("JSON parse error:", parseErr, "\nRaw excerpt:", jsonMatch[0].slice(0, 500));
      return NextResponse.json(
        { error: "AI response contained malformed JSON. Please try again." },
        { status: 500 }
      );
    }
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
