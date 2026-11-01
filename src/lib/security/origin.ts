/** Validates same-origin for state-changing requests. Returns true if valid. */
export function validateOrigin(
  headers: Headers,
  expectedHost: string
): boolean {
  const origin = headers.get("origin");
  if (origin) {
    try {
      const url = new URL(origin);
      return url.host === expectedHost;
    } catch {
      return false;
    }
  }

  const secFetchSite = headers.get("sec-fetch-site");
  return secFetchSite === "same-origin";
}

/** Extracts the host for origin checking. */
export function getExpectedHost(headers: Headers): string {
  return headers.get("host") ?? "localhost:3000";
}
