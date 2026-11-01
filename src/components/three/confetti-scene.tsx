"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

const COLORS = [0xC41E3A, 0xFFD700, 0x1B4332, 0xFF6B35, 0x7B2D8E];
const HIGH_COUNT = 200;
const LOW_COUNT = 50;

export default function ConfettiScene({ tier }: { tier: "high" | "low" }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = 200;
    const count = tier === "high" ? HIGH_COUNT : LOW_COUNT;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 100);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: tier === "high" });
    renderer.setSize(width, height);
    renderer.setPixelRatio(tier === "high" ? Math.min(window.devicePixelRatio, 2) : 1);
    container.appendChild(renderer.domElement);

    const particles: THREE.Mesh[] = [];
    const velocities: { x: number; y: number; rot: number }[] = [];

    for (let i = 0; i < count; i++) {
      const geo = new THREE.PlaneGeometry(0.08, 0.12);
      const mat = new THREE.MeshBasicMaterial({
        color: COLORS[i % COLORS.length],
        side: THREE.DoubleSide,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(
        (Math.random() - 0.5) * 8,
        Math.random() * 6 + 2,
        (Math.random() - 0.5) * 4,
      );
      scene.add(mesh);
      particles.push(mesh);
      velocities.push({
        x: (Math.random() - 0.5) * 0.02,
        y: -0.01 - Math.random() * 0.02,
        rot: (Math.random() - 0.5) * 0.1,
      });
    }

    let frameId: number;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const v = velocities[i];
        p.position.x += v.x;
        p.position.y += v.y;
        p.rotation.z += v.rot;
        if (p.position.y < -3) {
          p.position.y = 4;
          p.position.x = (Math.random() - 0.5) * 8;
        }
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
