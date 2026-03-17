import { NextRequest, NextResponse } from "next/server";
import { generateWithAI } from "@/lib/ai";
import { DEFAULT_PROTOCOL_PROMPT } from "@/lib/prompts";
import { Section } from "@/lib/types";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { notes, customPrompt } = body as {
      notes: string;
      customPrompt?: string;
    };

    if (!notes?.trim()) {
      return NextResponse.json(
        { error: "Notes are required" },
        { status: 400 }
      );
    }

    const prompt = customPrompt || DEFAULT_PROTOCOL_PROMPT;
    const raw = await generateWithAI(prompt, notes);

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

    return NextResponse.json({ sections });
  } catch (error) {
    console.error("Protocol generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate protocol" },
      { status: 500 }
    );
  }
}
