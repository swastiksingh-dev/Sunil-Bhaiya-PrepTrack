/** Aurora page backdrop — masked gradient wash with slow drift.
 * Replaces the pixel field: two blurred brand-hue blobs fading out down the
 * page (Aura masked-aurora pattern, rebuilt). SSR-safe static divs; all
 * motion in effects; static under reduced motion. */
"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { reducedMotion } from "../lib/motion";

export default function AuroraBg() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current || reducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.to("[data-aurora-a]", {
        y: 70,
        x: 40,
        duration: 16,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
      });
      gsap.to("[data-aurora-b]", {
        y: -60,
        x: -50,
        duration: 21,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0"
      style={{
        maskImage: "linear-gradient(to bottom, black 0%, black 52%, transparent 96%)",
        WebkitMaskImage: "linear-gradient(to bottom, black 0%, black 52%, transparent 96%)",
      }}
    >
      <div
        data-aurora-a
        className="absolute -top-48 left-1/2 h-[560px] w-[920px] max-w-none -translate-x-1/2 rounded-full opacity-30 blur-[140px]"
        style={{ background: "linear-gradient(135deg, #6a4cf5, #d44df0)" }}
      />
      <div
        data-aurora-b
        className="absolute top-[36%] left-[4%] h-[440px] w-[540px] max-w-none rounded-full opacity-[0.14] blur-[130px]"
        style={{ background: "linear-gradient(135deg, #ff7a3d, #ff5577)" }}
      />
      <div className="absolute top-[62%] right-[2%] h-[380px] w-[460px] rounded-full bg-[#6a4cf5] opacity-[0.07] blur-[130px]" />
    </div>
  );
}
