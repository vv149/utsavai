import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SiteFooter } from "@/components/site-footer";

describe("SiteFooter", () => {
  it("renders footer element", () => {
    const { container } = render(<SiteFooter />);
    expect(container.querySelector("footer")).not.toBeNull();
  });

  it("contains app name", () => {
    render(<SiteFooter />);
    expect(screen.getByText(/UtsavAI/)).toBeDefined();
  });

  it("contains tagline", () => {
    render(<SiteFooter />);
    expect(screen.getByText(/AI ideates, code calculates/)).toBeDefined();
  });

  it("contains copyright symbol", () => {
    render(<SiteFooter />);
    expect(screen.getByText(/©/)).toBeDefined();
  });

  it("contains year", () => {
    render(<SiteFooter />);
    expect(screen.getByText(/2026/)).toBeDefined();
  });
});
