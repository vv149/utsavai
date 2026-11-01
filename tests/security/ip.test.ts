import { describe, it, expect } from "vitest";
import { extractClientIp, normalizeIp, expandIpv6, ipv6ToSlash64 } from "@/lib/security/ip";

describe("extractClientIp", () => {
  it("returns 127.0.0.1 when no xff", () => {
    const headers = new Headers();
    expect(extractClientIp(headers)).toBe("127.0.0.1");
  });

  it("extracts client IP with 1 trusted proxy hop", () => {
    const headers = new Headers({ "x-forwarded-for": "1.2.3.4, 10.0.0.1" });
    // With 1 hop, index = max(0, 2-1) = 1 → 10.0.0.1 (the proxy-added one)
    expect(extractClientIp(headers)).toBe("10.0.0.1");
  });

  it("extracts single IP", () => {
    const headers = new Headers({ "x-forwarded-for": "1.2.3.4" });
    expect(extractClientIp(headers)).toBe("1.2.3.4");
  });

  it("normalizes IPv4-mapped IPv6", () => {
    const headers = new Headers({ "x-forwarded-for": "::ffff:192.168.1.1" });
    expect(extractClientIp(headers)).toBe("192.168.1.1");
  });

  it("normalizes IPv6 to /64", () => {
    const headers = new Headers({
      "x-forwarded-for": "2001:db8:85a3::8a2e:370:7334",
    });
    const result = extractClientIp(headers);
    expect(result).toContain("/64");
  });
});

describe("normalizeIp", () => {
  it("returns IPv4 as-is", () => {
    expect(normalizeIp("1.2.3.4")).toBe("1.2.3.4");
  });

  it("strips IPv4-mapped prefix", () => {
    expect(normalizeIp("::ffff:10.0.0.1")).toBe("10.0.0.1");
  });

  it("converts IPv6 to /64", () => {
    const result = normalizeIp("2001:db8::1");
    expect(result).toContain("/64");
  });

  it("handles uppercase ffff", () => {
    expect(normalizeIp("::FFFF:10.0.0.1")).toBe("10.0.0.1");
  });
});

describe("expandIpv6", () => {
  it("expands :: to full form", () => {
    const result = expandIpv6("2001:db8::1");
    const groups = result.split(":");
    expect(groups).toHaveLength(8);
    expect(groups[0]).toBe("2001");
    expect(groups[7]).toBe("0001");
  });

  it("handles already expanded", () => {
    const input = "2001:0db8:0000:0000:0000:0000:0000:0001";
    expect(expandIpv6(input)).toBe(input);
  });

  it("handles :: at start", () => {
    const result = expandIpv6("::1");
    const groups = result.split(":");
    expect(groups).toHaveLength(8);
    expect(groups[7]).toBe("0001");
  });

  it("handles :: at end", () => {
    const result = expandIpv6("2001:db8::");
    const groups = result.split(":");
    expect(groups).toHaveLength(8);
    expect(groups[0]).toBe("2001");
  });

  it("pads short groups", () => {
    const result = expandIpv6("1:2:3:4:5:6:7:8");
    expect(result).toBe("0001:0002:0003:0004:0005:0006:0007:0008");
  });
});

describe("ipv6ToSlash64", () => {
  it("returns first 4 groups", () => {
    const result = ipv6ToSlash64("2001:db8:85a3:0:8a2e:370:7334:1");
    expect(result).toBe("2001:0db8:85a3:0000::/64");
  });

  it("handles compressed address", () => {
    const result = ipv6ToSlash64("2001:db8::1");
    expect(result).toBe("2001:0db8:0000:0000::/64");
  });
});
