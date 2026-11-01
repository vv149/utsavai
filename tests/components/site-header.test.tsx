import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SiteHeader } from "@/components/site-header";

describe("SiteHeader", () => {
  it("renders app name", () => {
    render(<SiteHeader />);
    expect(screen.getByText("UtsavAI")).toBeDefined();
  });

  it("has header element", () => {
    const { container } = render(<SiteHeader />);
    expect(container.querySelector("header")).not.toBeNull();
  });

  it("has nav with aria-label", () => {
    const { container } = render(<SiteHeader />);
    const nav = container.querySelector("nav");
    expect(nav).not.toBeNull();
    expect(nav!.getAttribute("aria-label")).toBe("Main");
  });

  it("links to home", () => {
    render(<SiteHeader />);
    const link = screen.getByText("UtsavAI");
    expect(link.getAttribute("href")).toBe("/");
  });

  it("is sticky", () => {
    const { container } = render(<SiteHeader />);
    const header = container.querySelector("header");
    expect(header!.className).toContain("sticky");
  });

  it("has z-index for stacking", () => {
    const { container } = render(<SiteHeader />);
    const header = container.querySelector("header");
    expect(header!.className).toContain("z-40");
  });
});
