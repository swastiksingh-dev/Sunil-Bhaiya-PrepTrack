/** Landing hero backdrop — drifting particle field in brand hues.
 * Hydration-safe by construction: first render (server AND client) is an
 * empty placeholder div. three.js loads post-mount via dynamic import, so it
 * never enters the SSR tree and stays out of the initial bundle.
 * Optimized: DPR capped, single animation loop, pause when offscreen,
 * full dispose on unmount, static frame for reduced motion. */
"use client";

import { useEffect, useRef, useState } from "react";
import { reducedMotion } from "../lib/motion";

const HUES = ["#6a4cf5", "#d44df0", "#ff7a3d", "#ffffff"];

export default function HeroScene() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const mount = mountRef.current;
    if (!mount) return;

    let cancelled = false;
    let cleanup: (() => void) | undefined;

    import("three").then((THREE) => {
      if (cancelled || !mount.isConnected) return;

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      renderer.setSize(mount.clientWidth, mount.clientHeight);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      mount.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(
        55,
        mount.clientWidth / Math.max(1, mount.clientHeight),
        0.1,
        60,
      );
      camera.position.z = 9;

      const COUNT = window.matchMedia("(pointer: coarse)").matches ? 150 : 340;
      const pos = new Float32Array(COUNT * 3);
      const col = new Float32Array(COUNT * 3);
      const c = new THREE.Color();
      for (let i = 0; i < COUNT; i++) {
        pos[i * 3] = (Math.random() - 0.5) * 22;
        pos[i * 3 + 1] = (Math.random() - 0.5) * 12;
        pos[i * 3 + 2] = (Math.random() - 0.5) * 8;
        c.set(HUES[i % HUES.length]);
        col[i * 3] = c.r;
        col[i * 3 + 1] = c.g;
        col[i * 3 + 2] = c.b;
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
      const mat = new THREE.PointsMaterial({
        size: 0.055,
        vertexColors: true,
        transparent: true,
        opacity: 0.75,
        depthWrite: false,
        sizeAttenuation: true,
      });
      const points = new THREE.Points(geo, mat);
      scene.add(points);

      const mouse = { x: 0, y: 0 };
      const onMove = (e: PointerEvent) => {
        const r = mount.getBoundingClientRect();
        mouse.x = ((e.clientX - r.left) / r.width - 0.5) * 2;
        mouse.y = ((e.clientY - r.top) / r.height - 0.5) * 2;
      };
      window.addEventListener("pointermove", onMove, { passive: true });

      let visible = true;
      const io = new IntersectionObserver(([e]) => {
        visible = e.isIntersecting;
      });
      io.observe(mount);

      const onResize = () => {
        camera.aspect = mount.clientWidth / Math.max(1, mount.clientHeight);
        camera.updateProjectionMatrix();
        renderer.setSize(mount.clientWidth, mount.clientHeight);
      };
      window.addEventListener("resize", onResize);

      if (reducedMotion()) {
        // Accessibility: static frame only when the OS asks for less motion.
        renderer.render(scene, camera);
      } else {
        renderer.setAnimationLoop(() => {
          if (!visible) return;
          points.rotation.y += 0.0007;
          points.rotation.x += 0.0002;
          camera.position.x += (mouse.x * 0.9 - camera.position.x) * 0.04;
          camera.position.y += (-mouse.y * 0.5 - camera.position.y) * 0.04;
          camera.lookAt(scene.position);
          renderer.render(scene, camera);
        });
      }

      cleanup = () => {
        renderer.setAnimationLoop(null);
        io.disconnect();
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("resize", onResize);
        scene.remove(points);
        geo.dispose();
        mat.dispose();
        renderer.dispose();
        if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
      };
    });

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [mounted]);

  if (!mounted) return <div aria-hidden className="absolute inset-0" />;
  return <div ref={mountRef} aria-hidden className="absolute inset-0" />;
}
