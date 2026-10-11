/** Site header — sticky floating pill nav (Aura sticky-pill + slide-in menu patterns,
 * rebuilt against DESIGN.md: canvas pill, hairline ring, white pill CTA). */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const LINKS = [
  { href: "#how", label: "How it works" },
  { href: "#stages", label: "Stages" },
  { href: "#insights", label: "Insights" },
  { href: "#resources", label: "Resources" },
  { href: "#faq", label: "FAQ" },
];

export function BrandMark({ size = 30 }: { size?: number }) {
  return (
    <span
      className="inline-flex items-center justify-center rounded-full bg-white/[0.07] ring-1 ring-white/10"
      style={{ width: size, height: size }}
      aria-hidden
    >
      <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 512 512" fill="none">
        <path
          d="M352 176 C352 128, 160 128, 160 208 C160 288, 352 288, 352 368 C352 448, 160 448, 160 400"
          stroke="#fff"
          strokeWidth="72"
          strokeLinecap="round"
        />
        <circle cx="368" cy="128" r="44" fill="#22c55e" />
      </svg>
    </span>
  );
}

export default function SiteHeader() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open ]);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50">
        <div className="mx-auto max-w-6xl px-3 pt-3">
          <div className="flex h-14 items-center justify-between rounded-full bg-[#090909]/85 py-0 pr-2 pl-4 ring-1 ring-white/10 backdrop-blur-xl">
            <Link href="/" className="flex items-center gap-2.5" aria-label="PrepTrack home">
              <BrandMark />
              <span className="text-[15px] font-semibold tracking-tight">PrepTrack</span>
            </Link>
            <nav className="hidden items-center gap-7 text-sm text-[#999] md:flex" aria-label="Primary">
              {LINKS.map((l) => (
                <Link key={l.href} href={l.href} className="transition-colors hover:text-white">
                  {l.label}
                </Link>
              ))}
            </nav>
            <div className="flex items-center gap-2">
              <Link
                href="/app/dashboard"
                className="hidden h-10 items-center rounded-full bg-white px-5 text-sm font-medium text-black transition-transform hover:scale-[1.03] active:scale-[0.98] sm:inline-flex"
              >
                Open tracker
              </Link>
              <button
                type="button"
                onClick={() => setOpen(true)}
                aria-label="Open menu"
                aria-expanded={open}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#141414] ring-1 ring-white/10 md:hidden"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M4 7h16M4 12h16M4 17h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {open && (
        <div className="fixed inset-0 z-[60] md:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="absolute inset-x-3 top-3 rounded-[20px] bg-[#141414] p-4 ring-1 ring-white/10">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2.5">
                <BrandMark size={28} />
                <span className="text-[15px] font-semibold tracking-tight">PrepTrack</span>
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#1c1c1c] ring-1 ring-white/10"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>
            <nav className="mt-4 flex flex-col" aria-label="Mobile">
              {LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="flex min-h-[48px] items-center border-t border-white/[0.06] text-[17px] font-medium tracking-tight"
                >
                  {l.label}
                </Link>
              ))}
            </nav>
            <Link
              href="/app/dashboard"
              onClick={() => setOpen(false)}
              className="mt-4 flex h-12 items-center justify-center rounded-full bg-white text-sm font-medium text-black"
            >
              Open tracker
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
