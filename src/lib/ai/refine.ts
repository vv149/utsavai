import { getGenAI, PLAN_MODEL } from "./client";
import { REFINE_SYSTEM_INSTRUCTION, buildRefinePrompt } from "./prompts";

/** Streams a refine/ask response. Returns an async iterable of text chunks. */
export async function* streamRefineResponse(
  planSummary: string,
  question: string
): AsyncGenerator<string> {
  const ai = getGenAI();
  const prompt = buildRefinePrompt(planSummary, question);

  try {
    const response = await ai.models.generateContentStream({
      model: PLAN_MODEL,
      contents: prompt,
      config: {
        systemInstruction: REFINE_SYSTEM_INSTRUCTION,
        maxOutputTokens: 2048,
        temperature: 0.7,
      },
    });

    for await (const chunk of response) {
      const text = chunk.text;
      if (text) {
        yield text;
      }
    }
  } catch {
    yield TEMPLATE_FALLBACK_ANSWER;
  }
}

/** Template fallback answer when streaming fails. */
const TEMPLATE_FALLBACK_ANSWER =
  "I'm sorry, I couldn't process your question right now. Please try rephrasing or check back in a moment. In the meantime, review your plan tabs for detailed information about budget, timeline, and vendors.";
