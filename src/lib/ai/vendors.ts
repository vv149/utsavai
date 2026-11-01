import { getGenAI, PLAN_MODEL, AI_TIMEOUT_MS } from "./client";
import { VENDOR_SYSTEM_INSTRUCTION, buildVendorPrompt } from "./prompts";
import type { VendorPlace } from "@/lib/contracts/plan";

/** Fetches vendor places using Google Maps grounding. */
export async function fetchVendorPlaces(
  city: string,
  category: string,
  eventType: string
): Promise<VendorPlace[]> {
  const ai = getGenAI();
  const prompt = buildVendorPrompt(city, category, eventType);

  try {
    const response = await ai.models.generateContent({
      model: PLAN_MODEL,
      contents: prompt,
      config: {
        systemInstruction: VENDOR_SYSTEM_INSTRUCTION,
        tools: [{ googleSearch: {} }],
        maxOutputTokens: 4096,
        temperature: 0.3,
      },
    });

    return extractGroundedPlaces(response);
  } catch {
    return [];
  }
}

/** Extracts places from grounding metadata, filtering to https Maps URIs only. */
function extractGroundedPlaces(response: {
  candidates?: Array<{
    groundingMetadata?: {
      groundingChunks?: Array<{
        web?: { uri?: string; title?: string };
      }>;
    };
  }>;
}): VendorPlace[] {
  const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];
  const seen = new Set<string>();
  const places: VendorPlace[] = [];

  for (const chunk of chunks) {
    const uri = chunk.web?.uri;
    const title = chunk.web?.title;

    if (!uri || !title) continue;
    if (!uri.startsWith("https://")) continue;
    if (seen.has(uri)) continue;
    seen.add(uri);

    places.push({
      name: title,
      address: "",
      mapsUri: uri,
    });
  }

  return places;
}
