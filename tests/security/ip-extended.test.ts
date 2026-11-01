import { describe, it, expect } from "vitest";
import { extractClientIp, normalizeIp, expandIpv6, ipv6ToSlash64 } from "@/lib/security/ip";

describe("extractClientIp extended", () => {
  it("returns 127.0.0.1 when no headers", () => {
    expect(extractClientIp(new Headers())).toBe("127.0.0.1");
  });

  it("extracts from single XFF", () => {
    const h = new Headers({ "X-Forwarded-For": "8.8.8.8" });
    expect(extractClientIp(h)).toBe("8.8.8.8");
  });

  it("handles spaces in XFF", () => {
    const h = new Headers({ "X-Forwarded-For": " 8.8.8.8 , 10.0.0.1 " });
    expect(extractClientIp(h)).toBeTruthy();
  });

  it("handles IPv6 in XFF (normalized to /64)", () => {
    const h = new Headers({ "X-Forwarded-For": "2001:db8::1" });
    const result = extractClientIp(h);
    expect(result).toContain("2001");
    expect(result).toContain("/64");
  });

  it("empty XFF returns fallback", () => {
    const h = new Headers({ "X-Forwarded-For": "" });
    expect(extractClientIp(h)).toBe("127.0.0.1");
  });
});

describe("normalizeIp extended", () => {
  it("IPv4-mapped to IPv4", () => {
    expect(normalizeIp("::ffff:192.168.1.1")).toBe("192.168.1.1");
  });

  it("plain IPv4 unchanged", () => {
    expect(normalizeIp("10.0.0.1")).toBe("10.0.0.1");
  });

  it("IPv6 normalized to /64", () => {
    const result = normalizeIp("2001:0db8:85a3:1234:5678:abcd:ef01:2345");
    expect(result).toContain("2001");
    expect(result).toContain("/64");
  });

  it("loopback IPv6 (normalized to /64)", () => {
    const result = normalizeIp("::1");
    expect(result).toContain("/64");
  });

  it("loopback IPv4", () => {
    expect(normalizeIp("127.0.0.1")).toBe("127.0.0.1");
  });
});

describe("expandIpv6 extended", () => {
  it("expands :: to full form", () => {
    const expanded = expandIpv6("2001:db8::1");
    expect(expanded.split(":")).toHaveLength(8);
  });

  it("already full stays same", () => {
    const full = "2001:0db8:0000:0000:0000:0000:0000:0001";
    const expanded = expandIpv6(full);
    expect(expanded.split(":")).toHaveLength(8);
  });

  it("all zeros", () => {
    const expanded = expandIpv6("::");
    expect(expanded.split(":")).toHaveLength(8);
    expect(expanded).toMatch(/^0000:/);
  });
});

describe("ipv6ToSlash64 extended", () => {
  it("preserves first 4 groups", () => {
    const result = ipv6ToSlash64("2001:0db8:85a3:1234:5678:abcd:ef01:2345");
    expect(result).toContain("2001");
    expect(result).toContain("0db8");
    expect(result).toContain("85a3");
    expect(result).toContain("1234");
  });

  it("zeroes last 4 groups", () => {
    const result = ipv6ToSlash64("2001:0db8:85a3:1234:5678:abcd:ef01:2345");
    expect(result).toMatch(/\/64$/);
    expect(result).toContain("2001");
    expect(result).toContain("1234");
  });

  it("ends with /64", () => {
    const result = ipv6ToSlash64("fe80:0000:0000:0001:0000:0000:0000:0001");
    expect(result).toMatch(/\/64$/);
  });
});
