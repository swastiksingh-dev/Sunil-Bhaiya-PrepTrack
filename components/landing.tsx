/** Landing — hero, how-it-works, stages, insights preview, resources,
 * offline/PWA, FAQ, CTA, footer. Aura section patterns adapted to DESIGN.md;
 * motion via <Reveal/> + <CountUp/> (GSAP) inside <SmoothScroll/> (Lenis). */
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SiteHeader, { BrandMark } from "./site-header";
import { CountUp, Reveal, ScrollFX, ScrollProgress, SmoothScroll, lowFx, reducedMotion } from "../lib/motion";
import { SpotCard } from "./tracker-ui";
import HeroScene from "./hero-scene";
import HeroVideo from "./hero-video";
import AuroraBg from "./aurora-bg";
import { CLASS_10_RESOURCES, CBSE_PYQ_PORTAL_URL } from "../lib/chapters";

function Eyebrow({ children }: { children: string }) {
  return (
    <p className="text-[13px] font-medium tracking-[-0.13px] text-[#999] uppercase">{children}</p>
  );
}

function SectionHead({
  eyebrow,
  title,
  copy,
  index,
}: {
  eyebrow: string;
  title: string;
  copy: string;
  index: string;
}) {
  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
      <div className="max-w-2xl">
        <Reveal>
          <Eyebrow>{eyebrow}</Eyebrow>
        </Reveal>
        <Reveal delay={0.08}>
          <h2 className="display-tight mt-3 text-[38px] sm:text-[52px]">{title}</h2>
        </Reveal>
        <Reveal delay={0.16}>
          <p className="mt-4 max-w-xl text-[17px] leading-[1.4] text-[#999]">{copy}</p>
        </Reveal>
      </div>
      <Reveal delay={0.2}>
        <p className="font-mono text-sm text-[#999]">{index}</p>
      </Reveal>
    </div>
  );
}

const TYPE_WORDS = ["trigonometry", "chemical reactions", "nationalism", "electricity", "probability"];

/** Rotating typed line — SSR renders the first word whole, typing starts post-mount. */
function Typewriter() {
  const [text, setText] = useState(TYPE_WORDS[0]);

  useEffect(() => {
    if (reducedMotion()) return;
    let word = 0;
    let i = TYPE_WORDS[0].length;
    let deleting = true;
    let timer: ReturnType<typeof setTimeout>;
    const step = () => {
      if (deleting) {
        i -= 1;
        setText(TYPE_WORDS[word].slice(0, Math.max(0, i)));
        if (i <= 0) {
          deleting = false;
          word = (word + 1) % TYPE_WORDS.length;
          timer = setTimeout(step, 420);
          return;
        }
        timer = setTimeout(step, 26);
      } else {
        const full = TYPE_WORDS[word];
        i += 1;
        setText(full.slice(0, i));
        if (i >= full.length) {
          deleting = true;
          timer = setTimeout(step, 1700);
          return;
        }
        timer = setTimeout(step, 58);
      }
    };
    timer = setTimeout(step, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <span className="font-mono text-[13px] tracking-wide text-[#999]" aria-label={`This week, master ${TYPE_WORDS[0]} and more`}>
      <span aria-hidden>
        This week, master <span className="font-semibold text-white">{text}</span>
        <span className="ml-0.5 inline-block h-[14px] w-[2px] animate-pulse bg-[#0099ff] align-middle" />
      </span>
    </span>
  );
}

function Hero() {
  const secRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const sec = secRef.current;
    if (!sec || reducedMotion() || lowFx()) return;
    const glow = sec.querySelector("[data-mx-glow]");
    const tile = sec.querySelector("[data-mx-tile]");
    if (!glow || !tile) return;
    const gx = gsap.quickTo(glow, "x", { duration: 0.9, ease: "power3" });
    const gy = gsap.quickTo(glow, "y", { duration: 0.9, ease: "power3" });
    const tx = gsap.quickTo(tile, "x", { duration: 0.7, ease: "power3" });
    const ty = gsap.quickTo(tile, "y", { duration: 0.7, ease: "power3" });
    const onMove = (e: PointerEvent) => {
      const r = sec.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width - 0.5;
      const ny = (e.clientY - r.top) / r.height - 0.5;
      gx(nx * 44);
      gy(ny * 30);
      tx(nx * -14);
      ty(ny * -10);
    };
    sec.addEventListener("pointermove", onMove, { passive: true });
    return () => sec.removeEventListener("pointermove", onMove);
  }, []);

  return (
    <section ref={secRef} className="relative overflow-hidden pt-32 pb-16 sm:pt-40">
      <HeroVideo />
      <HeroScene />
      <div
        aria-hidden
        data-parallax="10"
        data-mx-glow
        className="animate-drift pointer-events-none absolute top-[-220px] left-1/2 h-[480px] w-[820px] -translate-x-1/2 rounded-full opacity-25 blur-[140px]"
        style={{ background: "linear-gradient(135deg, #6a4cf5, #d44df0, #ff7a3d)" }}
      />
      <div className="relative mx-auto max-w-6xl px-5 text-center">
        <Reveal>
          <p className="inline-flex items-center gap-2 rounded-full bg-white/[0.06] px-4 py-2 text-xs font-medium tracking-wide text-[#ccc] ring-1 ring-white/10">
            <span className="h-1.5 w-1.5 rounded-full bg-[#22c55e]" />
            Offline-first · Class 9 &amp; 10 · CBSE
          </p>
        </Reveal>
        <Reveal delay={0.1}>
          <h1 className="display-tight mx-auto mt-6 max-w-4xl text-[52px] sm:text-[84px]">
            Know exactly what to study next.
          </h1>
        </Reveal>
        <Reveal delay={0.18}>
          <p className="mx-auto mt-6 max-w-2xl text-[18px] leading-[1.45] text-[#999]">
            The Study Tracker plans backwards from your exam datesheet, scopes pace to your real
            exam syllabus, and surfaces today&apos;s top 3 stages — for Science, Maths, and Social
            Science.
          </p>
        </Reveal>
        <Reveal delay={0.22}>
          <p className="mt-4 flex justify-center">
            <Typewriter />
          </p>
        </Reveal>
        <Reveal delay={0.26}>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <GlowCta href="/app/dashboard">Start tracking — it&apos;s free</GlowCta>
            <Link
              href="#how"
              className="flex h-12 w-full items-center justify-center rounded-full bg-[#141414] px-7 text-sm font-medium text-white ring-1 ring-white/10 transition-colors hover:bg-[#1c1c1c] sm:w-auto"
            >
              See how it works
            </Link>
          </div>
        </Reveal>

        <Reveal delay={0.34}>
          <dl className="mx-auto mt-12 grid max-w-3xl grid-cols-3 gap-3">
            {[
              { v: 49, s: "", label: "Class 10 chapters" },
              { v: 5, s: "", label: "Prep stages per chapter" },
              { v: 100, s: "%", label: "Offline capable" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-[15px] bg-[#141414] px-4 py-5 ring-1 ring-white/[0.06]"
              >
                <dt className="order-2 mt-1 block text-[13px] text-[#999]">{stat.label}</dt>
                <dd className="text-[30px] font-semibold tracking-tight">
                  <CountUp to={stat.v} suffix={stat.s} />
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>

        <Reveal delay={0.4}>
          <div data-mx-tile data-parallax="6" className="glass-hi mx-auto mt-10 max-w-4xl rounded-[20px] bg-white/[0.04] p-4 text-left ring-1 ring-white/10 backdrop-blur-xl sm:p-5">
            <div className="flex items-center gap-2 border-b border-white/[0.06] px-2 pb-3">
              <span className="h-2.5 w-2.5 rounded-full bg-[#f87171]/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#fbbf24]/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#22c55e]/70" />
              <span className="tnum ml-2 hidden rounded-full bg-white/[0.06] px-3 py-1 font-mono text-[11px] text-[#999] ring-1 ring-white/[0.07] sm:inline-block">
                tracker · today&apos;s focus
              </span>
              <span className="ml-auto flex items-center gap-1.5 rounded-full bg-[#22c55e]/10 px-2.5 py-1 text-[11px] font-semibold text-[#4ade80] ring-1 ring-[#22c55e]/25">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#22c55e]" />
                Live demo
              </span>
            </div>
            {[
              { sub: "Science", ch: "Ch 11 · Electricity", stage: "Previous Year Questions", pct: 72 },
              { sub: "Mathematics", ch: "Ch 8 · Trigonometry", stage: "NCERT Questions", pct: 45 },
              { sub: "Social Science", ch: "History · Nationalism in India", stage: "Theory Read", pct: 20 },
            ].map((f) => (
              <div key={f.ch} className="flex items-center gap-3 border-b border-white/[0.05] px-2 py-3.5 last:border-0">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/[0.07] text-[13px] font-semibold">
                  {f.sub[0]}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-medium">{f.ch}</p>
                  <p className="truncate text-[13px] text-[#999]">
                    {f.sub} · {f.stage}
                  </p>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
                    <div className="h-full rounded-full bg-white" style={{ width: `${f.pct}%` }} />
                  </div>
                </div>
                <span className="shrink-0 font-mono text-[13px] text-[#999]">{f.pct}%</span>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

const STEPS = [
  {
    n: "01",
    title: "Set your datesheet",
    copy: "Enter one exam date per subject. Every countdown and every pace number derives from these three dates.",
  },
  {
    n: "02",
    title: "Scope your syllabus",
    copy: "Uncheck chapters that aren't in this exam. Pace is calculated only against chapters you actually have to finish.",
  },
  {
    n: "03",
    title: "Work the Focus 3",
    copy: "Each day, the tracker surfaces the next 3 pending stages from your nearest exam. Tap a dot: Not started → In progress → Done.",
  },
];

const C10_STAGES = [
  "Theory Read",
  "NCERT Questions",
  "NCERT Exemplar",
  "Previous Year Questions",
  "Competency Questions",
];
const C9_STAGES = ["Theory Read", "NCERT Questions", "Revision"];

/** Primary CTA — white pill over a breathing gradient glow with hover sheen
 * and sliding arrow (Aura glow-CTA pattern, rebuilt in our tokens). */
function GlowCta({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="group relative inline-flex items-center"
    >
      <span
        aria-hidden
        className="absolute -inset-1.5 rounded-full bg-gradient-to-r from-[#6a4cf5] via-[#d44df0] to-[#ff7a3d] opacity-30 blur-lg transition-opacity duration-500 group-hover:opacity-60"
      />
      <span className="relative inline-flex h-12 items-center gap-2 overflow-hidden rounded-full bg-white px-7 text-sm font-medium text-black transition-transform duration-300 group-hover:scale-[1.03] active:scale-[0.98]">
        <span
          aria-hidden
          className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-[#6a4cf5]/25 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full"
        />
        <span className="relative">{children}</span>
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
          className="relative transition-transform duration-300 group-hover:translate-x-1"
        >
          <path d="M5 12h14m-7-7l7 7-7 7" />
        </svg>
      </span>
    </Link>
  );
}

function Marquee() {
  const items = [
    "Chemical Reactions", "Real Numbers", "Nationalism in India", "Electricity",
    "Trigonometry", "Life Processes", "Power Sharing", "Carbon Compounds",
    "Agriculture", "Probability", "Light & Refraction", "Development",
  ];
  const row = [...items, ...items];
  const trackRef = useRef<HTMLDivElement>(null);
  const tweenRef = useRef<gsap.core.Tween | null>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track || reducedMotion()) return;
    if (lowFx()) {
      // GSAP stands down on touch devices — hand motion to the CSS fallback.
      track.classList.add("marquee-fallback");
      return;
    }
    gsap.registerPlugin(ScrollTrigger);
    const tw = gsap.to(track, {
      xPercent: -50,
      repeat: -1,
      duration: 32,
      ease: "none",
    });
    tweenRef.current = tw;
    const boost = gsap.utils.clamp(1, 4);
    const st = ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: (self) => {
        const v = boost(1 + Math.abs(self.getVelocity()) / 2500);
        gsap.to(tw, { timeScale: v, duration: 0.3, overwrite: true });
        gsap.to(tw, { timeScale: 1, duration: 1.2, delay: 0.3, overwrite: "auto" });
      },
    });
    return () => {
      st.kill();
      tw.kill();
      tweenRef.current = null;
    };
  }, []);

  return (
    <div
      className="marquee border-y border-white/[0.06] py-4"
      aria-hidden
      onMouseEnter={() => tweenRef.current?.timeScale(0)}
      onMouseLeave={() => tweenRef.current?.timeScale(1)}
    >
      <div ref={trackRef} className="marquee-track-css flex w-max gap-10">
        {row.map((t, i) => (
          <span key={i} className="flex shrink-0 items-center gap-3 text-[14px] text-[#777]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#22c55e]" />
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

function PaceDemo() {
  const [chapters, setChapters] = useState(10);
  const [days, setDays] = useState(40);
  const pace = (chapters * 5) / days;
  return (
    <Reveal>
      <div className="relative mt-3">
        <div aria-hidden className="absolute -inset-2 -z-10 rounded-[24px] bg-white/[0.04] ring-1 ring-white/[0.07] backdrop-blur-md" />
      <article className="glass-hi rounded-[20px] bg-[#101010]/90 p-6 ring-1 ring-white/[0.08] backdrop-blur-xl sm:p-8">
        <div className="grid items-center gap-8 lg:grid-cols-2">
          <div>
            <p className="text-[13px] font-medium tracking-wide text-[#999] uppercase">Try the math</p>
            <h3 className="display-tight mt-2 text-[30px] sm:text-[38px]">
              <CountUp key={`${chapters}-${days}`} to={pace} decimals={1} /> stages/day
            </h3>
            <p className="mt-2 max-w-md text-[15px] text-[#999]">
              {chapters} chapters × 5 stages ÷ {days} days. Drag the sliders — this is exactly the
              number the tracker shows per subject.
            </p>
            <Link
              href="/app/dashboard"
              className="mt-5 inline-flex h-11 items-center rounded-full bg-white px-6 text-sm font-medium text-black transition-transform hover:scale-[1.03]"
            >
              Get your real number
            </Link>
          </div>
          <div className="space-y-6">
            {[
              { label: "Chapters in your exam", value: chapters, min: 1, max: 30, set: setChapters },
              { label: "Days left", value: days, min: 7, max: 120, set: setDays },
            ].map((s) => (
              <div key={s.label}>
                <div className="mb-2 flex items-baseline justify-between">
                  <label className="text-[14px] font-medium">{s.label}</label>
                  <span className="font-mono text-[15px] font-bold">{s.value}</span>
                </div>
                <input
                  type="range"
                  min={s.min}
                  max={s.max}
                  value={s.value}
                  onChange={(e) => s.set(Number(e.target.value))}
                  aria-label={s.label}
                  className="h-2 w-full cursor-pointer appearance-none rounded-full bg-white/[0.1] accent-white"
                />
              </div>
            ))}
          </div>
        </div>
      </article>
      </div>
    </Reveal>
  );
}

function Faq() {
  const [open, setOpen] = useState(0);
  const items = [
    {
      q: "Does it work without internet?",
      a: "Yes. After the first load the whole app shell works offline, and all progress is stored on-device in localStorage. Only the external CBSE PYQ portal link needs a connection.",
    },
    {
      q: "Which classes and subjects are covered?",
      a: "CBSE Class 9 and Class 10 — Science, Mathematics, and Social Science (with History, Geography, Civics, and Economics split out for Class 10).",
    },
    {
      q: "What if my midterm covers only some chapters?",
      a: "That's exactly what Exam Syllabus scoping is for. Uncheck the chapters outside your exam and every pace number, focus item, and insight recalculates against your real syllabus.",
    },
    {
      q: "How do I move to a new phone?",
      a: "Settings → Save My Progress downloads one JSON file. Open the tracker on the new phone, Settings → Load Progress, pick the file — profiles, streaks, datesheets, and syllabus come along.",
    },
    {
      q: "Why does Class 9 have no question-bank stages?",
      a: "There's no official CBQ/PYQ/Exemplar material for the new Class 9 NCERT edition yet, so Class 9 tracks Theory, NCERT, and Revision. Earlier progress on the removed stages is archived in Settings, never deleted.",
    },
  ];
  return (
    <div className="mt-10 divide-y divide-white/10 rounded-[20px] border border-white/10 bg-white/[0.02]">
      {items.map((it, i) => {
        const isOpen = i === open;
        return (
          <div key={it.q} className="p-5 sm:p-6">
            <button
              type="button"
              onClick={() => setOpen(isOpen ? -1 : i)}
              aria-expanded={isOpen}
              className="flex min-h-[44px] w-full items-center justify-between gap-4 text-left"
            >
              <span className="text-[15px] font-semibold tracking-tight sm:text-base">{it.q}</span>
              <span
                className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/10 transition-transform duration-300 ${isOpen ? "rotate-45" : ""}`}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </span>
            </button>
            <div
              className={`grid transition-all duration-300 ${isOpen ? "mt-3 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
            >
              <p className="overflow-hidden text-[15px] leading-relaxed text-[#999]">{it.a}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function Landing() {
  return (
    <SmoothScroll>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Sunil Bhaiya PrepTrack",
            applicationCategory: "EducationalApplication",
            operatingSystem: "Any",
            offers: { "@type": "Offer", price: "0" },
            description:
              "PrepTrack — the rebuilt, offline-first evolution of the original Sunil Bhaiya tracker: exam-syllabus pacing, stage tracking, and insights for CBSE Class 9 & 10.",
          }),
        }}
      />
      <AuroraBg />
      <ScrollFX>
      <ScrollProgress />
      <SiteHeader />
      <main className="relative z-10">
        <Hero />
        <Marquee />

        <section id="how" className="mx-auto max-w-6xl scroll-mt-24 px-5 py-16 sm:py-24">
          <SectionHead
            eyebrow="How it works"
            title="Three steps. Then one number a day."
            copy="No accounts, no servers, no setup beyond your exam reality. The tracker turns dates + syllabus into a daily pace you can actually follow."
            index="001 — 003"
          />
          <div className="mt-10 grid gap-3 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <Reveal key={s.n} delay={i * 0.08}>
                <SpotCard className="glass-hi h-full rounded-[20px] bg-[#141414] p-6 ring-1 ring-white/[0.06]">
                  <p className="font-mono text-[13px] text-[#999]">{s.n}</p>
                  <h3 className="mt-3 text-[22px] font-semibold tracking-tight">{s.title}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-[#999]">{s.copy}</p>
                </SpotCard>
              </Reveal>
            ))}
          </div>
        </section>

        <section id="stages" className="mx-auto max-w-6xl scroll-mt-24 px-5 py-16 sm:py-24">
          <SectionHead
            eyebrow="Preparation stages"
            title="Every chapter, broken into finishable stages."
            copy="A chapter isn't done when you've read it. Class 10 tracks five stages per chapter; Class 9 tracks three. In-progress work earns half credit in the pace math."
            index="002 — 003"
          />
          <div className="mt-10 grid gap-3 md:grid-cols-2">
            <Reveal>
              <SpotCard className="glass-hi h-full rounded-[20px] bg-[#141414] p-6 ring-1 ring-white/[0.06] sm:p-8">
                <p className="text-[13px] font-medium text-[#999] uppercase">Class 10 · 5 stages</p>
                <ul className="mt-4 space-y-1">
                  {C10_STAGES.map((s, i) => (
                    <li key={s} className="flex items-center gap-3 border-b border-white/[0.05] py-3 last:border-0">
                      <span className="font-mono text-[13px] text-[#999]">{String(i + 1).padStart(2, "0")}</span>
                      <span className="text-[16px] font-medium tracking-tight">{s}</span>
                    </li>
                  ))}
                </ul>
              </SpotCard>
            </Reveal>
            <Reveal delay={0.1}>
              <SpotCard className="flex h-full flex-col rounded-[20px] bg-[#141414] p-6 ring-1 ring-white/[0.06] sm:p-8">
                <p className="text-[13px] font-medium text-[#999] uppercase">Class 9 · 3 stages</p>
                <ul className="mt-4 space-y-1">
                  {C9_STAGES.map((s, i) => (
                    <li key={s} className="flex items-center gap-3 border-b border-white/[0.05] py-3 last:border-0">
                      <span className="font-mono text-[13px] text-[#999]">{String(i + 1).padStart(2, "0")}</span>
                      <span className="text-[16px] font-medium tracking-tight">{s}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-auto pt-6">
                  <p className="text-[13px] font-medium text-[#999] uppercase">3-state control</p>
                  <div className="mt-3 flex items-center gap-4">
                    {[
                      { c: "bg-transparent ring-2 ring-white/25", l: "Not started" },
                      { c: "bg-[#f59e0b]", l: "In progress" },
                      { c: "bg-[#22c55e]", l: "Done" },
                    ].map((d) => (
                      <span key={d.l} className="flex items-center gap-2 text-[13px] text-[#999]">
                        <span className={`h-6 w-6 rounded-full ${d.c}`} />
                        {d.l}
                      </span>
                    ))}
                  </div>
                </div>
              </SpotCard>
            </Reveal>
          </div>
          <PaceDemo />
        </section>

        <section id="subjects" className="mx-auto max-w-6xl scroll-mt-24 px-5 py-16 sm:py-24">
          <SectionHead
            eyebrow="Coverage"
            title="One tracker, every chapter."
            copy="Full NCERT chapter lists for Class 10 and the new Class 9 edition — Social Science split into History, Geography, Civics, and Economics where it matters."
            index="SUB · 003"
          />
          <div className="mt-10 grid gap-3 sm:grid-cols-3">
            {[
              { sub: "Science", c10: "13 chapters", c9: "13 chapters" },
              { sub: "Mathematics", c10: "14 chapters", c9: "8 chapters" },
              { sub: "Social Science", c10: "22 chapters · H5 G7 C5 E5", c9: "9 chapters · 5 groups" },
            ].map((r, i) => (
              <Reveal key={r.sub} delay={i * 0.08}>
                <SpotCard className="glass-hi h-full rounded-[20px] bg-white/[0.03] p-6 ring-1 ring-white/10 backdrop-blur-md">
                  <p className="font-mono text-[11px] tracking-[0.08em] text-[#777] uppercase">
                    {String(i + 1).padStart(2, "0")} — Subject
                  </p>
                  <h3 className="display-tight mt-2 text-[26px]">{r.sub}</h3>
                  <p className="tnum mt-2 text-[14px] text-[#999]">Class 10 · {r.c10}</p>
                  <p className="tnum text-[14px] text-[#999]">Class 9 · {r.c9}</p>
                  <Link
                    href="/app/onboarding"
                    className="mt-4 inline-flex h-10 items-center rounded-full bg-[#1c1c1c] px-5 text-sm font-medium ring-1 ring-white/10 transition-colors hover:bg-[#262626]"
                  >
                    Track {r.sub} →
                  </Link>
                </SpotCard>
              </Reveal>
            ))}
          </div>
        </section>

        <section id="insights" className="mx-auto max-w-6xl scroll-mt-24 px-5 py-16 sm:py-24">
          <SectionHead
            eyebrow="Insights"
            title="See the week. Fix the weak spot."
            copy="A 7-day activity trend, per-subject completion donuts, your pace versus the pace you need, and a callout when one stage lags 20%+ behind the rest."
            index="003 — 003"
          />
          <div className="mt-10 grid gap-3 lg:grid-cols-5">
            <Reveal className="lg:col-span-3">
              <article className="glass-hi h-full rounded-[20px] bg-[#141414] p-6 ring-1 ring-white/[0.06] sm:p-8">
                <div className="flex items-baseline justify-between">
                  <h3 className="text-[18px] font-semibold tracking-tight">7-day activity</h3>
                  <p className="rounded-full bg-[#fffbeb] px-3 py-1 text-[12px] font-semibold text-[#b45309]">
                    6 day streak
                  </p>
                </div>
                <div className="mt-6 flex h-32 items-end gap-2 sm:gap-3" aria-hidden>
                  {[3, 5, 2, 7, 4, 6, 8].map((v, i) => (
                    <div key={i} className="flex flex-1 flex-col items-center gap-2">
                      <span className="text-[11px] text-[#999]">{v}</span>
                      <div className="w-full rounded-full bg-white/[0.07]">
                        <div className="rounded-full bg-white" style={{ height: `${v * 12}px` }} />
                      </div>
                      <span className="text-[11px] text-[#999]">
                        {["M", "T", "W", "T", "F", "S", "S"][i]}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-6 space-y-3 border-t border-white/[0.06] pt-6">
                  {[
                    { l: "Your pace (2.1/day)", w: 62, c: "bg-white" },
                    { l: "Target pace (2.8/day)", w: 84, c: "bg-[#0099ff]" },
                  ].map((b) => (
                    <div key={b.l}>
                      <p className="mb-1.5 text-[13px] text-[#999]">{b.l}</p>
                      <div className="h-2.5 overflow-hidden rounded-full bg-white/[0.07]">
                        <div className={`h-full rounded-full ${b.c}`} style={{ width: `${b.w}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            </Reveal>
            <Reveal delay={0.1} className="lg:col-span-2">
              <article
                className="flex h-full flex-col justify-between rounded-[30px] p-6 sm:p-8"
                style={{ background: "linear-gradient(150deg, #6a4cf5 0%, #d44df0 55%, #ff5577 100%)" }}
              >
                <div>
                  <p className="text-[13px] font-medium uppercase opacity-80">Weakest-spot callout</p>
                  <p className="display-tight mt-3 text-[30px]">
                    PYQs lag Theory by 40%.
                  </p>
                </div>
                <div>
                  <p className="mt-4 text-[15px] leading-relaxed opacity-90">
                    Previous Year Questions sit at 20% while Theory is at 80%. Tomorrow&apos;s Focus
                    3 reorders itself around closing that gap.
                  </p>
                  <Link
                    href="/app/insights"
                    className="mt-6 inline-flex h-11 items-center rounded-full bg-white px-6 text-sm font-medium text-black transition-transform hover:scale-[1.03]"
                  >
                    Preview insights
                  </Link>
                </div>
              </article>
            </Reveal>
          </div>
        </section>

        <section id="resources" className="mx-auto max-w-6xl scroll-mt-24 px-5 py-16 sm:py-24">
          <SectionHead
            eyebrow="Resources"
            title="Question banks, on-device."
            copy="Eight Competency Focused volumes ship with the app and open in a built-in viewer. Previous-year papers link out to the official CBSE portal."
            index="PDF · 8 vols"
          />
          <div className="mt-10 grid gap-3 md:grid-cols-3">
            {(
              [
                { sub: "Science", vols: CLASS_10_RESOURCES.science.length },
                { sub: "Mathematics", vols: CLASS_10_RESOURCES.maths.length },
                { sub: "Social Science", vols: CLASS_10_RESOURCES.sst.length },
              ]
            ).map((r, i) => (
              <Reveal key={r.sub} delay={i * 0.08}>
                <SpotCard className="glass-hi h-full rounded-[20px] bg-[#141414] p-6 ring-1 ring-white/[0.06]">
                  <h3 className="text-[20px] font-semibold tracking-tight">{r.sub}</h3>
                  <p className="mt-1 text-[14px] text-[#999]">
                    {r.vols} Competency volumes · PDF
                  </p>
                  <Link
                    href="/app/resources"
                    className="mt-5 inline-flex h-10 items-center rounded-full bg-[#1c1c1c] px-5 text-sm font-medium ring-1 ring-white/10 transition-colors hover:bg-[#262626]"
                  >
                    Browse papers
                  </Link>
                </SpotCard>
              </Reveal>
            ))}
          </div>
          <Reveal>
            <p className="mt-6 text-[14px] text-[#999]">
              Previous Year Question Papers live on the{" "}
              <a href={CBSE_PYQ_PORTAL_URL} target="_blank" rel="noopener" className="text-[#0099ff] hover:underline">
                official CBSE portal ↗
              </a>
            </p>
          </Reveal>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-16 sm:py-24">
          <Reveal>
            <article className="rounded-[20px] bg-[#141414] p-6 ring-1 ring-white/[0.06] sm:p-10">
              <div className="grid gap-8 md:grid-cols-2">
                <div>
                  <Eyebrow>Offline &amp; PWA</Eyebrow>
                  <h2 className="display-tight mt-3 text-[32px] sm:text-[40px]">
                    Install it. Lose signal. Keep studying.
                  </h2>
                </div>
                <ul className="space-y-4 text-[15px] leading-relaxed text-[#999]">
                  {[
                    "Installable to the home screen with its own icon and standalone display.",
                    "App shell cached on first visit; progress saves to this device only.",
                    "One-file JSON backup moves everything — profiles, streaks, syllabus — to a new phone.",
                    "PDF volumes are never precached, so installs stay light on storage.",
                  ].map((t) => (
                    <li key={t} className="flex gap-3">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mt-1 shrink-0">
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          </Reveal>
        </section>

        <section id="faq" className="mx-auto max-w-4xl scroll-mt-24 px-5 py-16 sm:py-24">
          <div className="text-center">
            <Reveal>
              <Eyebrow>FAQ</Eyebrow>
            </Reveal>
            <Reveal delay={0.08}>
              <h2 className="display-tight mt-3 text-[38px] sm:text-[52px]">Questions, answered.</h2>
            </Reveal>
          </div>
          <Reveal delay={0.12}>
            <Faq />
          </Reveal>
        </section>

        <section className="mx-auto max-w-6xl px-5 pb-24">
          <Reveal>
            <article className="rounded-[30px] bg-white px-6 py-14 text-center text-black sm:py-20">
              <h2 className="display-tight mx-auto max-w-2xl text-[40px] sm:text-[62px]">
                Your exam date is fixed. Your plan should be too.
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-[17px] text-black/60">
                Set the datesheet, scope the syllabus, and let the tracker do the pacing.
              </p>
              <div className="mt-8 flex justify-center">
                <GlowCta href="/app/dashboard">Open the tracker</GlowCta>
              </div>
            </article>
          </Reveal>
        </section>
      </main>

      <footer className="relative z-10 overflow-hidden border-t border-white/[0.06] px-5 pt-14 pb-8">
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.5]"
          style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.09) 1px, transparent 1px)", backgroundSize: "22px 22px" }}
        />
        <div className="relative mx-auto max-w-6xl">
          <Reveal>
            <p className="display-tight max-w-4xl text-[42px] sm:text-[64px]">
              Study like it&apos;s handled.
            </p>
          </Reveal>
          <div className="mt-10 grid gap-10 md:grid-cols-[1.2fr_2fr]">
            <div>
              <p className="flex items-center gap-2.5">
                <BrandMark size={28} />
                <span className="text-[15px] font-semibold tracking-tight">PrepTrack</span>
              </p>
              <p className="mt-3 max-w-xs text-[13px] leading-relaxed text-[#999]">
                The rebuilt, offline-first evolution of the original Sunil Bhaiya tracker.
                Built for exam dates that don&apos;t move.
              </p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {["Offline-first", "No account", "Free forever"].map((t) => (
                  <span key={t} className="rounded-full bg-white/[0.06] px-3 py-1.5 text-[12px] font-medium text-[#ccc] ring-1 ring-white/10">
                    {t}
                  </span>
                ))}
              </div>
            </div>
            <nav className="grid grid-cols-2 gap-8 text-[13px] sm:grid-cols-3" aria-label="Footer">
              <div>
                <p className="font-medium text-white">Tracker</p>
                <ul className="mt-3 space-y-2.5 text-[#999]">
                  <li><Link href="/app/dashboard" className="hover:text-white">Dashboard</Link></li>
                  <li><Link href="/app/chapters" className="hover:text-white">Chapters</Link></li>
                  <li><Link href="/app/insights" className="hover:text-white">Insights</Link></li>
                  <li><Link href="/app/analysis" className="hover:text-white">Analysis</Link></li>
                </ul>
              </div>
              <div>
                <p className="font-medium text-white">Study</p>
                <ul className="mt-3 space-y-2.5 text-[#999]">
                  <li><Link href="/app/resources" className="hover:text-white">Resources</Link></li>
                  <li><Link href="/app/revision" className="hover:text-white">Revision</Link></li>
                  <li><Link href="/app/goals" className="hover:text-white">Goals</Link></li>
                  <li><Link href="/app/todo" className="hover:text-white">To Do</Link></li>
                </ul>
              </div>
              <div>
                <p className="font-medium text-white">Elsewhere</p>
                <ul className="mt-3 space-y-2.5 text-[#999]">
                  <li><Link href="/app/onboarding" className="hover:text-white">Get started</Link></li>
                  <li><Link href="/app/settings" className="hover:text-white">Settings</Link></li>
                  <li><Link href="/privacy" className="hover:text-white">Privacy</Link></li>
                  <li><Link href="/terms" className="hover:text-white">Terms</Link></li>
                  <li><a href={CBSE_PYQ_PORTAL_URL} target="_blank" rel="noopener" className="hover:text-white">CBSE portal ↗</a></li>
                  <li><Link href="#faq" className="hover:text-white">FAQ</Link></li>
                </ul>
              </div>
            </nav>
          </div>
          <div className="mt-10 flex flex-col gap-2 border-t border-white/[0.06] pt-5 text-[12.5px] text-[#666] sm:flex-row sm:items-center sm:justify-between">
            <p>© {new Date().getFullYear()} PrepTrack by Sunil Bhaiya. Study data never leaves your device.</p>
            <p className="font-mono">pace = remaining ÷ days left</p>
          </div>
        </div>
      </footer>
      </ScrollFX>
    </SmoothScroll>
  );
}
