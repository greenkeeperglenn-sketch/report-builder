import OpenAI from "openai";

let _client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!_client) {
    _client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return _client;
}

export async function generateWithAI(
  systemPrompt: string,
  userContent: string
): Promise<string> {
  const response = await getClient().chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userContent },
    ],
    temperature: 0.7,
    max_tokens: 8000,
  });

  return response.choices[0]?.message?.content ?? "";
}
