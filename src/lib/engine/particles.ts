/** A particle position in 3D space for budget visualization. */
export interface Particle {
  x: number;
  y: number;
  z: number;
  category: number;
}

/** Column layout configuration for particle flow visualization. */
export interface ColumnLayout {
  categoryIndex: number;
  centerX: number;
  width: number;
  count: number;
}

/** Computes column layouts from budget proportions. */
export function computeColumns(
  proportions: readonly number[],
  totalWidth: number,
  gap: number
): ColumnLayout[] {
  const usableWidth = totalWidth - gap * (proportions.length - 1);
  let x = -totalWidth / 2;

  return proportions.map((p, i) => {
    const width = usableWidth * p;
    const centerX = x + width / 2;
    x += width + gap;
    return {
      categoryIndex: i,
      centerX,
      width,
      count: Math.max(Math.round(p * 200), 1),
    };
  });
}

/** Assigns particles to columns using delta-only reassignment. */
export function assignParticles(
  particles: Particle[],
  columns: readonly ColumnLayout[]
): Particle[] {
  const totalCount = columns.reduce((s, c) => s + c.count, 0);
  const result: Particle[] = [];
  let idx = 0;

  for (const col of columns) {
    for (let i = 0; i < col.count && idx < totalCount; i++) {
      const existing = idx < particles.length ? particles[idx] : null;
      const targetX = col.centerX + (Math.random() - 0.5) * col.width * 0.8;
      const targetY = (Math.random() - 0.5) * 4;
      const targetZ = (Math.random() - 0.5) * 2;

      if (existing !== null && existing.category === col.categoryIndex) {
        result.push(existing);
      } else {
        result.push({
          x: existing?.x ?? targetX,
          y: existing?.y ?? targetY,
          z: existing?.z ?? targetZ,
          category: col.categoryIndex,
        });
      }
      idx++;
    }
  }

  return result;
}

/** Applies spring convergence step to move particles toward targets. */
export function springStep(
  particles: readonly Particle[],
  targets: readonly Particle[],
  stiffness: number
): Particle[] {
  return particles.map((p, i) => {
    const t = targets[i] ?? p;
    return {
      x: p.x + (t.x - p.x) * stiffness,
      y: p.y + (t.y - p.y) * stiffness,
      z: p.z + (t.z - p.z) * stiffness,
      category: t.category,
    };
  });
}
