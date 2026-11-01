import { GoogleGenAI } from "@google/genai";

let instance: GoogleGenAI | null = null;

/** Returns the singleton Gemini client. GOOGLE_GENAI_USE_VERTEXAI=true uses ADC; otherwise GEMINI_API_KEY. */
export function getGenAI(): GoogleGenAI {
  if (instance) return instance;

  const useVertex = process.env.GOOGLE_GENAI_USE_VERTEXAI === "true";
  const apiKey = process.env.GEMINI_API_KEY;

  if (useVertex) {
    instance = new GoogleGenAI({
      vertexai: true,
      project: process.env.GOOGLE_CLOUD_PROJECT ?? process.env.GCP_PROJECT,
      location: process.env.GOOGLE_CLOUD_LOCATION ?? "us-central1",
    });
  } else if (apiKey) {
    instance = new GoogleGenAI({ apiKey });
  } else {
    instance = new GoogleGenAI({
      vertexai: true,
      project: process.env.GOOGLE_CLOUD_PROJECT ?? process.env.GCP_PROJECT,
      location: process.env.GOOGLE_CLOUD_LOCATION ?? "us-central1",
    });
  }

  return instance;
}

/** Default model for plan generation. */
export const PLAN_MODEL = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";

/** Default timeout for AI calls (ms). */
export const AI_TIMEOUT_MS = 30_000;

/** Max output tokens for English plans. */
export const MAX_TOKENS_EN = 8192;

/** Max output tokens for non-English plans. */
export const MAX_TOKENS_OTHER = 16_384;

/** Resets the client singleton (for testing). */
export function resetGenAI(): void {
  instance = null;
}
