import { NextRequest, NextResponse } from "next/server";
import { generateWithAI } from "@/lib/ai";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sectionTitle, currentContent, context, customPrompt, refinePrompt } = body as {
      sectionTitle: string;
      currentContent: string;
      context: string;
      customPrompt?: string;
      refinePrompt?: string;
    };

    const systemPrompt =
      customPrompt ||
      `You are an expert scientific writer specialising in agronomy and turfgrass research.
Rewrite the following section to improve its quality, clarity, and scientific accuracy.
Return ONLY the rewritten content text, no JSON wrapping or section title.`;

    let userContent = `Section: ${sectionTitle}

Current content:
${currentContent}

Context from other sections:
${context}`;

    if (refinePrompt) {
      userContent += `

Additional instructions from the user:
${refinePrompt}

Rewrite this section following the user's instructions above. Return only the improved content.`;
    } else {
      userContent += `

Rewrite this section to be more professional, clear, and scientifically accurate. Return only the improved content.`;
    }

    const result = await generateWithAI(systemPrompt, userContent);

    return NextResponse.json({ content: result.trim() });
  } catch (error) {
    console.error("Section regeneration error:", error);
    return NextResponse.json(
      { error: "Failed to regenerate section" },
      { status: 500 }
    );
  }
}
