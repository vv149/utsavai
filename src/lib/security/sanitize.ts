/** Delimiter used to wrap user text in AI prompts. */
export const USER_DATA_OPEN = "<<<USER_DATA>>>";

/** Closing delimiter for user text in AI prompts. */
export const USER_DATA_CLOSE = "<<<END_USER_DATA>>>";

/** Strips delimiter sequences from user input to prevent prompt injection. */
export function sanitizeUserInput(input: string): string {
  return input
    .replace(/<<<USER_DATA>>>/g, "")
    .replace(/<<<END_USER_DATA>>>/g, "")
    .replace(/<<<[A-Z_]+>>>/g, "");
}

/** Wraps sanitized user text in delimiters for AI prompts. */
export function wrapUserData(input: string): string {
  const clean = sanitizeUserInput(input);
  return `${USER_DATA_OPEN}\n${clean}\n${USER_DATA_CLOSE}`;
}

/** Escapes `<` in text for safe JSON-LD serialization. */
export function escapeJsonLd(text: string): string {
  return text.replace(/</g, "\\u003c");
}
