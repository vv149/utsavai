import { getGenAI, PLAN_MODEL, MAX_TOKENS_EN, MAX_TOKENS_OTHER } from "./client";
import { PLAN_SYSTEM_INSTRUCTION, buildPlanPrompt } from "./prompts";
import { AiPlanSchema } from "@/lib/contracts/plan";
import type { AiPlan, Brief } from "@/lib/contracts/plan";
import { templateFallbackPlan } from "./template";

/** Generates an AI plan with one self-correcting retry, then template fallback. */
export async function generatePlan(brief: Brief): Promise<{ plan: AiPlan; templateFallback: boolean }> {
  try {
    const maxTokens = brief.language === "en" ? MAX_TOKENS_EN : MAX_TOKENS_OTHER;
    const prompt = buildPlanPrompt(brief);

    const firstAttempt = await callGemini(prompt, maxTokens);
    const firstParse = AiPlanSchema.safeParse(firstAttempt);

    if (firstParse.success) {
      return { plan: firstParse.data, templateFallback: false };
    }

    const errorMsg = JSON.stringify(firstParse.error.issues.slice(0, 5));
    const retryPrompt = `${prompt}\n\nYour previous response had validation errors: ${errorMsg}\nPlease fix and respond with valid JSON only.`;
    const retryAttempt = await callGemini(retryPrompt, Math.round(maxTokens * 1.5));
    const retryParse = AiPlanSchema.safeParse(retryAttempt);

    if (retryParse.success) {
      return { plan: retryParse.data, templateFallback: false };
    }
  } catch {
    // AI call failed — fall through to template
  }

  return { plan: templateFallbackPlan(brief), templateFallback: true };
}

async function callGemini(
  prompt: string,
  maxOutputTokens: number
): Promise<unknown> {
  const ai = getGenAI();
  const response = await ai.models.generateContent({
    model: PLAN_MODEL,
    contents: prompt,
    config: {
      systemInstruction: PLAN_SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      maxOutputTokens,
      temperature: 0.8,
    },
  });

  const text = response.text ?? "";

  try {
    return JSON.parse(text);
  } catch {
    // ponytail: truncation recovery — if JSON parse fails, might be truncated
    throw new Error("AI response was not valid JSON");
  }
}
