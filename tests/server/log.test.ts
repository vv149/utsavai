import { describe, it, expect, vi, afterEach } from "vitest";
import { log } from "@/lib/server/log";

describe("log", () => {
  afterEach(() => vi.restoreAllMocks());

  it("logs info as JSON to stdout", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});
    log("info", "test-event");
    expect(spy).toHaveBeenCalledOnce();
    const parsed = JSON.parse(spy.mock.calls[0][0] as string);
    expect(parsed.severity).toBe("INFO");
    expect(parsed.event).toBe("test-event");
    expect(parsed.timestamp).toBeTruthy();
  });

  it("logs warn as JSON to stdout", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});
    log("warn", "warn-event");
    const parsed = JSON.parse(spy.mock.calls[0][0] as string);
    expect(parsed.severity).toBe("WARN");
  });

  it("logs error to stderr", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    log("error", "err-event");
    expect(spy).toHaveBeenCalledOnce();
    const parsed = JSON.parse(spy.mock.calls[0][0] as string);
    expect(parsed.severity).toBe("ERROR");
  });

  it("includes extra fields", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});
    log("info", "req", { method: "POST", path: "/api/plan", latencyMs: 42 });
    const parsed = JSON.parse(spy.mock.calls[0][0] as string);
    expect(parsed.method).toBe("POST");
    expect(parsed.path).toBe("/api/plan");
    expect(parsed.latencyMs).toBe(42);
  });

  it("has ISO timestamp", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});
    log("info", "ts-test");
    const parsed = JSON.parse(spy.mock.calls[0][0] as string);
    expect(parsed.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it("never includes user text fields", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});
    log("info", "sanitized", { count: 5 });
    const str = spy.mock.calls[0][0] as string;
    expect(str).not.toContain("userText");
  });
});
