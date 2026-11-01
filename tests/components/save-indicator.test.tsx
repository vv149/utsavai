import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SaveIndicator } from "@/components/save-indicator";

describe("SaveIndicator", () => {
  it("renders nothing when idle", () => {
    const { container } = render(<SaveIndicator saving="idle" />);
    expect(container.innerHTML).toBe("");
  });

  it("shows Saving... when saving", () => {
    render(<SaveIndicator saving="saving" />);
    expect(screen.getByText("Saving...")).toBeDefined();
  });

  it("shows Saved when saved", () => {
    render(<SaveIndicator saving="saved" />);
    expect(screen.getByText("Saved")).toBeDefined();
  });

  it("shows Save failed on error", () => {
    render(<SaveIndicator saving="error" />);
    expect(screen.getByText("Save failed")).toBeDefined();
  });

  it("has aria-live polite", () => {
    render(<SaveIndicator saving="saving" />);
    const el = screen.getByText("Saving...");
    expect(el.getAttribute("aria-live")).toBe("polite");
  });

  it("applies success color when saved", () => {
    render(<SaveIndicator saving="saved" />);
    const el = screen.getByText("Saved");
    expect(el.style.color).toContain("success");
  });

  it("applies error color on error", () => {
    render(<SaveIndicator saving="error" />);
    const el = screen.getByText("Save failed");
    expect(el.style.color).toContain("error");
  });
});
