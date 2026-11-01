import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SkipLink } from "@/components/skip-link";

describe("SkipLink", () => {
  it("renders skip link", () => {
    render(<SkipLink />);
    const link = screen.getByText("Skip to main content");
    expect(link).toBeDefined();
  });

  it("links to #main-content", () => {
    render(<SkipLink />);
    const link = screen.getByText("Skip to main content");
    expect(link.getAttribute("href")).toBe("#main-content");
  });

  it("is a link element", () => {
    render(<SkipLink />);
    const link = screen.getByText("Skip to main content");
    expect(link.tagName).toBe("A");
  });

  it("has sr-only class for visual hiding", () => {
    render(<SkipLink />);
    const link = screen.getByText("Skip to main content");
    expect(link.className).toContain("sr-only");
  });

  it("has focus styles", () => {
    render(<SkipLink />);
    const link = screen.getByText("Skip to main content");
    expect(link.className).toContain("focus:not-sr-only");
  });
});
