"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

const CATEGORY_COLORS = [0xC41E3A, 0xFFD700, 0x1B4332, 0xFF6B35, 0x7B2D8E, 0x2563EB, 0xE11D48];

/** Animated budget flow visualization with colour-coded spheres. */
export default function BudgetFlowScene({ tier }: { tier: "high" | "low" }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = 200;
    const count = tier === "high" ? 150 : 40;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 100);
    camera.position.z = 6;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: tier === "high" });
    renderer.setSize(width, height);
    renderer.setPixelRatio(tier === "high" ? Math.min(window.devicePixelRatio, 2) : 1);
    container.appendChild(renderer.domElement);

    const spheres: THREE.Mesh[] = [];
    const targets: { x: number; y: number }[] = [];

    for (let i = 0; i < count; i++) {
      const catIdx = i % CATEGORY_COLORS.length;
      const geo = new THREE.SphereGeometry(0.06, tier === "high" ? 12 : 6, tier === "high" ? 12 : 6);
      const mat = new THREE.MeshBasicMaterial({ color: CATEGORY_COLORS[catIdx] });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(0, (Math.random() - 0.5) * 3, (Math.random() - 0.5) * 2);
      scene.add(mesh);
      spheres.push(mesh);

      const col = (catIdx - 3) * 1.2;
      targets.push({ x: col + (Math.random() - 0.5) * 0.8, y: (Math.random() - 0.5) * 2 });
    }

    let frameId: number;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      for (let i = 0; i < spheres.length; i++) {
        const s = spheres[i];
        const t = targets[i];
        s.position.x += (t.x - s.position.x) * 0.03;
        s.position.y += (t.y - s.position.y) * 0.03;
      }
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(frameId);
      renderer.dispose();
      container.removeChild(renderer.domElement);
    };
  }, [tier]);

  return (
    <div
      ref={containerRef}
      className="w-full h-48 rounded-lg overflow-hidden"
      aria-hidden="true"
    />
  );
}
