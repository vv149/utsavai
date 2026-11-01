"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

const LANTERN_COLORS = [0xFF6B35, 0xFFD700, 0xE11D48, 0xC41E3A];

export default function LanternScene({ tier }: { tier: "high" | "low" }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = 200;
    const count = tier === "high" ? 30 : 10;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 100);
    camera.position.z = 8;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: tier === "high" });
    renderer.setSize(width, height);
    renderer.setPixelRatio(tier === "high" ? Math.min(window.devicePixelRatio, 2) : 1);
    container.appendChild(renderer.domElement);

    const lanterns: THREE.Group[] = [];
    const speeds: number[] = [];

    for (let i = 0; i < count; i++) {
      const group = new THREE.Group();
      const bodyGeo = new THREE.CylinderGeometry(0.15, 0.2, 0.4, tier === "high" ? 12 : 6);
      const bodyMat = new THREE.MeshBasicMaterial({
        color: LANTERN_COLORS[i % LANTERN_COLORS.length],
        transparent: true,
        opacity: 0.8,
      });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      group.add(body);

      const glowGeo = new THREE.SphereGeometry(0.1, 8, 8);
      const glowMat = new THREE.MeshBasicMaterial({
        color: 0xFFFFAA,
        transparent: true,
        opacity: 0.6,
      });
      const glow = new THREE.Mesh(glowGeo, glowMat);
      group.add(glow);

      group.position.set(
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 4 - 2,
        (Math.random() - 0.5) * 4,
      );
      scene.add(group);
      lanterns.push(group);
      speeds.push(0.003 + Math.random() * 0.005);
    }

    let frameId: number;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      for (let i = 0; i < lanterns.length; i++) {
        lanterns[i].position.y += speeds[i];
        lanterns[i].rotation.y += 0.005;
        if (lanterns[i].position.y > 5) {
          lanterns[i].position.y = -4;
          lanterns[i].position.x = (Math.random() - 0.5) * 10;
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
