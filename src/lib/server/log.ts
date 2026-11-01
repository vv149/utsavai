/** Structured JSON log entry. Never includes user text. */
export function log(
  level: "info" | "warn" | "error",
  event: string,
  fields?: Record<string, unknown>
): void {
  const entry = {
    severity: level.toUpperCase(),
    event,
    timestamp: new Date().toISOString(),
    ...fields,
  };
  // ponytail: structured logs to stdout for Cloud Run
  if (level === "error") {
    console.error(JSON.stringify(entry));
  } else {
    // eslint-disable-next-line no-console -- structured log to stdout for Cloud Run
    console.log(JSON.stringify(entry));
  }
}
