import { describe, it, expect } from "vitest";
import { computeColumns, assignParticles, springStep } from "@/lib/engine/particles";
import type { Particle } from "@/lib/engine/particles";

describe("computeColumns", () => {
  it("computes proportional column widths", () => {
    const cols = computeColumns([0.5, 0.5], 10, 1);
    expect(cols).toHaveLength(2);
    expect(cols[0].width + cols[1].width).toBeCloseTo(9, 0);
  });

  it("centers columns correctly", () => {
    const cols = computeColumns([1.0], 10, 0);
    expect(cols[0].centerX).toBeCloseTo(0, 0);
  });

  it("handles single proportion", () => {
    const cols = computeColumns([1.0], 10, 1);
    expect(cols).toHaveLength(1);
    expect(cols[0].count).toBeGreaterThan(0);
  });

  it("handles many small proportions", () => {
    const props = Array.from({ length: 8 }, () => 0.125);
    const cols = computeColumns(props, 20, 0.5);
    expect(cols).toHaveLength(8);
    const totalCount = cols.reduce((s, c) => s + c.count, 0);
    expect(totalCount).toBeGreaterThan(0);
  });

  it("ensures at least 1 particle per column", () => {
    const cols = computeColumns([0.001, 0.999], 10, 1);
    expect(cols[0].count).toBeGreaterThanOrEqual(1);
  });

  it("assigns correct category indices", () => {
    const cols = computeColumns([0.3, 0.7], 10, 1);
    expect(cols[0].categoryIndex).toBe(0);
    expect(cols[1].categoryIndex).toBe(1);
  });
});

describe("assignParticles", () => {
  it("assigns particles to columns", () => {
    const cols = computeColumns([0.5, 0.5], 10, 1);
    const particles = assignParticles([], cols);
    expect(particles.length).toBeGreaterThan(0);
  });

  it("preserves existing particles in same category", () => {
    const cols = computeColumns([1.0], 10, 0);
    const existing: Particle[] = [{ x: 1, y: 2, z: 3, category: 0 }];
    const result = assignParticles(existing, cols);
    expect(result[0]).toEqual(existing[0]);
  });

  it("reassigns particles when category changes", () => {
    const cols = computeColumns([0.5, 0.5], 10, 1);
    const existing: Particle[] = [{ x: 0, y: 0, z: 0, category: 99 }];
    const result = assignParticles(existing, cols);
    expect(result[0].category).not.toBe(99);
  });
});

describe("springStep", () => {
  it("moves particles toward targets", () => {
    const particles: Particle[] = [{ x: 0, y: 0, z: 0, category: 0 }];
    const targets: Particle[] = [{ x: 10, y: 10, z: 10, category: 0 }];
    const result = springStep(particles, targets, 0.5);
    expect(result[0].x).toBe(5);
    expect(result[0].y).toBe(5);
    expect(result[0].z).toBe(5);
  });

  it("reaches target with stiffness 1", () => {
    const particles: Particle[] = [{ x: 0, y: 0, z: 0, category: 0 }];
    const targets: Particle[] = [{ x: 10, y: 10, z: 10, category: 0 }];
    const result = springStep(particles, targets, 1.0);
    expect(result[0].x).toBe(10);
  });

  it("stays in place with stiffness 0", () => {
    const particles: Particle[] = [{ x: 5, y: 5, z: 5, category: 0 }];
    const targets: Particle[] = [{ x: 10, y: 10, z: 10, category: 0 }];
    const result = springStep(particles, targets, 0);
    expect(result[0].x).toBe(5);
  });

  it("handles empty arrays", () => {
    expect(springStep([], [], 0.5)).toHaveLength(0);
  });

  it("updates category from target", () => {
    const particles: Particle[] = [{ x: 0, y: 0, z: 0, category: 0 }];
    const targets: Particle[] = [{ x: 0, y: 0, z: 0, category: 1 }];
    const result = springStep(particles, targets, 0);
    expect(result[0].category).toBe(1);
  });
});
