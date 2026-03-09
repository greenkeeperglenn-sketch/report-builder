import { generateText } from "ai";
import { gateway } from "@ai-sdk/gateway";

export async function generateWithAI(
  systemPrompt: string,
  userContent: string
): Promise<string> {
  const { text } = await generateText({
    model: gateway("openai/gpt-4o"),
    system: systemPrompt,
    prompt: userContent,
    temperature: 0.7,
    maxOutputTokens: 8000,
  });

  return text;
}
