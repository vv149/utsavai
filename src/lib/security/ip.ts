const TRUSTED_PROXY_HOPS = parseInt(process.env.TRUSTED_PROXY_HOPS ?? "1", 10);

/** Extracts client IP from X-Forwarded-For, keyed by /64 for IPv6. */
export function extractClientIp(headers: Headers): string {
  const xff = headers.get("x-forwarded-for");
  if (!xff) {
    return "127.0.0.1";
  }

  const parts = xff.split(",").map((s) => s.trim());
  const clientIp = parts[Math.max(0, parts.length - TRUSTED_PROXY_HOPS)] ?? "127.0.0.1";

  return normalizeIp(clientIp);
}

/** Normalizes IP: IPv4-mapped IPv6 → IPv4, IPv6 → /64 prefix. */
export function normalizeIp(ip: string): string {
  // IPv4-mapped IPv6 (::ffff:1.2.3.4)
  const v4Mapped = ip.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/i);
  if (v4Mapped) {
    return v4Mapped[1];
  }

  // Plain IPv4
  if (/^\d+\.\d+\.\d+\.\d+$/.test(ip)) {
    return ip;
  }

  // IPv6: key by /64 (first 4 groups)
  return ipv6ToSlash64(ip);
}

/** Extracts the /64 prefix from an IPv6 address. */
export function ipv6ToSlash64(ip: string): string {
  const expanded = expandIpv6(ip);
  const groups = expanded.split(":");
  return groups.slice(0, 4).join(":") + "::/64";
}

/** Expands a compressed IPv6 address to full 8-group form. */
export function expandIpv6(ip: string): string {
  let halves = ip.split("::");
  if (halves.length === 1) {
    return padGroups(halves[0]);
  }

  const left = halves[0] ? halves[0].split(":") : [];
  const right = halves[1] ? halves[1].split(":") : [];
  const missing = 8 - left.length - right.length;
  const middle = Array(missing).fill("0000");

  return [...left, ...middle, ...right]
    .map((g) => g.padStart(4, "0"))
    .join(":");
}

function padGroups(groups: string): string {
  return groups
    .split(":")
    .map((g) => g.padStart(4, "0"))
    .join(":");
}
