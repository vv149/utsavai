import { describe, it, expect } from "vitest";
import { computeColumns, assignParticles, springStep } from "@/lib/engine/particles";
import type { Particle, ColumnLayout } from "@/lib/engine/particles";

describe("computeColumns extended", () => {
  it("single column fills width", () => {
    const cols = computeColumns([1.0], 800, 0);
    expect(cols[0].width).toBe(800);
  });

  it("two equal columns", () => {
    const cols = computeColumns([0.5, 0.5], 800, 0);
    expect(cols[0].width).toBeCloseTo(400, 0);
    expect(cols[1].width).toBeCloseTo(400, 0);
  });

  it("accounts for gap", () => {
    const cols = computeColumns([0.5, 0.5], 810, 10);
    expect(cols[0].width + cols[1].width + 10).toBeCloseTo(810, 0);
  });

  it("three columns with different proportions", () => {
    const cols = computeColumns([0.5, 0.3, 0.2], 1000, 0);
    expect(cols[0].width).toBeGreaterThan(cols[1].width);
    expect(cols[1].width).toBeGreaterThan(cols[2].width);
  });

  it("columns have centerX positions", () => {
    const cols = computeColumns([0.5, 0.5], 800, 10);
    expect(typeof cols[0].centerX).toBe("number");
    expect(cols[1].centerX).toBeGreaterThan(cols[0].centerX);
  });

  it("many columns (10)", () => {
    const props = Array.from({ length: 10 }, () => 0.1);
    const cols = computeColumns(props, 1000, 5);
    expect(cols).toHaveLength(10);
  });

  it("columns have categoryIndex", () => {
    const cols = computeColumns([0.5, 0.5], 800, 0);
    expect(cols[0].categoryIndex).toBe(0);
    expect(cols[1].categoryIndex).toBe(1);
  });

  it("columns have count", () => {
    const cols = computeColumns([0.5, 0.5], 800, 0);
    expect(cols[0].count).toBeGreaterThan(0);
    expect(cols[1].count).toBeGreaterThan(0);
  });
});

describe("assignParticles extended", () => {
  const columns: ColumnLayout[] = [
    { categoryIndex: 0, centerX: -200, width: 400, count: 2 },
    { categoryIndex: 1, centerX: 200, width: 400, count: 2 },
  ];

  it("produces particles based on column counts", () => {
    const particles: Particle[] = [
      { x: 100, y: 50, z: 0, category: 0 },
      { x: 500, y: 50, z: 0, category: 1 },
      { x: 300, y: 50, z: 0, category: 0 },
      { x: 400, y: 50, z: 0, category: 1 },
    ];
    const result = assignParticles(particles, columns);
    expect(result.length).toBeGreaterThan(0);
  });

  it("handles empty particles by creating new ones", () => {
    const result = assignParticles([], columns);
    expect(result.length).toBeGreaterThan(0);
  });

  it("assigned particles have numeric category", () => {
    const result = assignParticles([], columns);
    result.forEach((p) => expect(typeof p.category).toBe("number"));
  });
});

describe("springStep extended", () => {
  it("moves particles toward targets", () => {
    const particles: Particle[] = [{ x: 0, y: 0, z: 0, category: 0 }];
    const targets = [{ x: 100, y: 100, z: 0, category: 0 }];
    const result = springStep(particles, targets, 0.5);
    expect(result[0].x).toBeGreaterThan(0);
    expect(result[0].y).toBeGreaterThan(0);
  });

  it("higher stiffness moves faster", () => {
    const particles: Particle[] = [{ x: 0, y: 0, z: 0, category: 0 }];
    const targets = [{ x: 100, y: 100, z: 0, category: 0 }];
    const low = springStep(particles, targets, 0.1);
    const high = springStep(particles, targets, 0.9);
    expect(high[0].x).toBeGreaterThan(low[0].x);
  });

  it("at target stays at target", () => {
    const particles: Particle[] = [{ x: 100, y: 100, z: 0, category: 0 }];
    const targets = [{ x: 100, y: 100, z: 0, category: 0 }];
    const result = springStep(particles, targets, 0.5);
    expect(result[0].x).toBeCloseTo(100, 5);
    expect(result[0].y).toBeCloseTo(100, 5);
  });

  it("preserves category", () => {
    const particles: Particle[] = [{ x: 0, y: 0, z: 0, category: 3 }];
    const targets = [{ x: 100, y: 100, z: 0, category: 3 }];
    const result = springStep(particles, targets, 0.5);
    expect(result[0].category).toBe(3);
  });

  it("handles 100 particles", () => {
    const particles: Particle[] = Array.from({ length: 100 }, (_, i) => ({
      x: i, y: i, z: 0, category: 0,
    }));
    const targets: Particle[] = Array.from({ length: 100 }, (_, i) => ({
      x: i * 10, y: i * 10, z: 0, category: 0,
    }));
    const result = springStep(particles, targets, 0.3);
    expect(result).toHaveLength(100);
  });
});
