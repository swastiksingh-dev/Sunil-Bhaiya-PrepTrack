/** Motion primitives — Lenis smooth scroll + GSAP entrances.
 * Single interface: <SmoothScroll/>, <Reveal/>, <CountUp/>.
 * Lenis runs on the landing page only; dashboard lists never scroll-jack.
 * Everything no-ops under prefers-reduced-motion. */
"use client";

import { useEffect, useRef, type ReactNode } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function reducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/** Low-FX mode: coarse pointers only (phones/tablets).
 * Window size alone must NOT kill motion — a small desktop window still gets
 * full FX. Everything no-ops under prefers-reduced-motion separately. */
export function lowFx(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.matchMedia("(pointer: coarse)").matches;
  } catch {
    return false;
  }
}

export function SmoothScroll({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (reducedMotion() || lowFx()) return;
    const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    (window as unknown as { __lenis?: Lenis }).__lenis = lenis;
    let raf = 0;
    const loop = (t: number) => {
      lenis.raf(t);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
      (window as unknown as { __lenis?: Lenis }).__lenis = undefined;
    };
  }, []);
  return <>{children}</>;
}

const EASE = "power3.out";

export function Reveal({
  children,
  delay = 0,
  y = 28,
  className,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reducedMotion()) {
      gsap.set(el, { opacity: 1, y: 0 });
      return;
    }
    gsap.set(el, { opacity: 0, y, willChange: "transform, opacity" });
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            gsap.to(el, {
              opacity: 1,
              y: 0,
              duration: 0.9,
              delay,
              ease: EASE,
              force3D: true,
              overwrite: true,
              onComplete: () => {
                el.style.willChange = "auto";
              },
            });
            io.disconnect();
          }
        }
      },
      { threshold: 0.12 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [delay, y]);
  return (
    <div ref={ref} className={className} style={{ opacity: 0 }}>
      {children}
    </div>
  );
}

/** Scroll-linked parallax for landing decorations (GSAP ScrollTrigger + Lenis).
 * Only `[data-parallax]` elements move, with scrub smoothing. Scoped + reverted. */
export function ScrollFX({ children }: { children: ReactNode }) {
  useEffect(() => {
    // Scrub parallax is cheap and works with native touch scroll — only the
    // OS reduced-motion setting opts out.
    if (reducedMotion()) return;
    gsap.registerPlugin(ScrollTrigger);
    let alive = true;
    let tries = 0;
    const timer = setInterval(() => {
      const lenis = (window as unknown as { __lenis?: Lenis }).__lenis;
      tries++;
      if (!lenis && tries < 20) return;
      clearInterval(timer);
      if (!alive) return;
      const ctx = gsap.context(() => {
        if (lenis) lenis.on("scroll", ScrollTrigger.update);
        gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((el) => {
          const amt = Number(el.dataset.parallax || 8);
          gsap.fromTo(
            el,
            { yPercent: -amt },
            {
              yPercent: amt,
              ease: "none",
              scrollTrigger: {
                trigger: el.closest("section") ?? el,
                start: "top bottom",
                end: "bottom top",
                scrub: 1,
              },
            },
          );
        });
        if (document.fonts) document.fonts.ready.then(() => ScrollTrigger.refresh()).catch(() => {});
      });
      (ScrollFX as { __ctx?: gsap.Context }).__ctx = ctx;
    }, 60);
    return () => {
      alive = false;
      clearInterval(timer);
      const ctx = (ScrollFX as { __ctx?: gsap.Context }).__ctx;
      ctx?.revert();
      (ScrollFX as { __ctx?: gsap.Context }).__ctx = undefined;
    };
  }, []);
  return <>{children}</>;
}

/** Thin scroll-progress hairline pinned to the viewport top. */
export function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (reducedMotion() || !ref.current) return;
    gsap.registerPlugin(ScrollTrigger);
    const tw = gsap.fromTo(
      ref.current,
      { scaleX: 0 },
      {
        scaleX: 1,
        ease: "none",
        scrollTrigger: { start: 0, end: "max", scrub: 0.3 },
      },
    );
    return () => {
      tw.scrollTrigger?.kill();
      tw.kill();
    };
  }, []);
  return (
    <div
      ref={ref}
      aria-hidden
      className="fixed top-0 left-0 z-40 h-[2px] w-full origin-left bg-gradient-to-r from-[#6a4cf5] via-[#d44df0] to-[#ff7a3d]"
    />
  );
}

export function CountUp({ to, suffix = "", decimals = 0 }: { to: number; suffix?: string; decimals?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const fmt = (v: number) => `${decimals > 0 ? v.toFixed(decimals) : Math.round(v)}${suffix}`;
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reducedMotion()) {
      el.textContent = fmt(to);
      return;
    }
    const obj = { v: 0 };
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          gsap.to(obj, {
            v: to,
            duration: 1.6,
            ease: EASE,
            onUpdate: () => {
              el.textContent = fmt(obj.v);
            },
          });
          io.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [to, suffix, decimals]);
  return <span ref={ref}>0{suffix}</span>;
}
