/** Hero video backdrop — Pexels library footage behind the particle field.
 * Client-only, hydration-safe: first render is a plain dark layer, the
 * <video> element mounts post-hydration. Reduced-motion / low-FX devices
 * get the static poster only. External stream (needs internet); offline
 * falls back to the dark base with zero breakage. */
"use client";

import { useEffect, useState } from "react";
import { reducedMotion } from "../lib/motion";

const POSTER =
  "https://images.pexels.com/videos/9569475/pexels-photo-9569475.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=630&w=1200";
const SRC_HD =
  "https://videos.pexels.com/video-files/9569475/9569475-hd_1366_720_25fps.mp4";

export default function HeroVideo() {
  const [mounted, setMounted] = useState(false);
  const [staticOnly, setStaticOnly] = useState(true);

  useEffect(() => {
    setMounted(true);
    // Accessibility: poster only when the OS asks for less motion.
    setStaticOnly(reducedMotion());
  }, []);

  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden bg-[#090909]">
      {mounted && staticOnly && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={POSTER}
          alt=""
          loading="eager"
          className="h-full w-full object-cover opacity-30"
        />
      )}
      {mounted && !staticOnly && (
        <video
          className="h-full w-full object-cover opacity-30"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster={POSTER}
        >
          <source src={SRC_HD} type="video/mp4" />
        </video>
      )}
      {/* Readability gradients over footage */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#090909]/70 via-[#090909]/55 to-[#090909]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_38%,transparent_30%,#090909_100%)]" />
      <p className="absolute right-4 bottom-2 font-mono text-[10px] text-white/30">
        Video: Tima Miroshnichenko / Pexels
      </p>
    </div>
  );
}
