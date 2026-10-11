/** Onboarding — 4 steps in landing style: gradient header, stepped rail,
 * spotlight panel, GSAP step transitions, Lenis smooth scroll.
 * Logic unchanged from spec: details → datesheet → syllabus → backfill. */
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { gsap } from "gsap";
import { useTracker, type Datesheet } from "../../../lib/storage";
import { getSubjects, scopedChapterId } from "../../../lib/chapters";
import { Card, DateField, Field, GhostButton, PrimaryButton, inputCls } from "../../../components/tracker-ui";
import SyllabusChecklist from "../../../components/syllabus-checklist";
import { SmoothScroll, reducedMotion } from "../../../lib/motion";
import { celebrate } from "../../../lib/celebrate";
import { BrandMark } from "../../../components/site-header";

const STEPS = [
  { n: "01", title: "Details", copy: "Who's studying, which class." },
  { n: "02", title: "Datesheet", copy: "Pace plans backwards from these." },
  { n: "03", title: "Syllabus", copy: "Only your real exam chapters." },
  { n: "04", title: "Backfill", copy: "Credit work already done." },
];

const SUBJECT_META = [
  { key: "science", label: "Science", dot: "bg-[#6a4cf5]" },
  { key: "maths", label: "Mathematics", dot: "bg-[#d44df0]" },
  { key: "sst", label: "Social Science", dot: "bg-[#ff7a3d]" },
] as const;

function daysUntil(iso: string): number | null {
  if (!iso) return null;
  const t = new Date();
  t.setHours(0, 0, 0, 0);
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return null;
  return Math.round((d.getTime() - t.getTime()) / 86400000);
}

export default function OnboardingPage() {
  const store = useTracker();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [grade, setGrade] = useState(10);
  const [datesheet, setDatesheet] = useState<Datesheet>({ science: "", maths: "", sst: "" });
  const [syllabus, setSyllabus] = useState<Record<string, string[]> | null>(null);
  const [backfilled, setBackfilled] = useState<Record<string, boolean>>({});
  const bodyRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (reducedMotion()) return;
    if (bodyRef.current)
      gsap.fromTo(
        bodyRef.current,
        { opacity: 0, x: 28 },
        { opacity: 1, x: 0, duration: 0.55, ease: "power3.out" },
      );
    if (barRef.current) gsap.to(barRef.current, { width: `${(step / 4) * 100}%`, duration: 0.6, ease: "power3.out" });
  }, [step]);

  if (!store.ready) return null;

  const startSyllabus = () => {
    const full: Record<string, string[]> = {};
    for (const s of getSubjects(grade)) {
      full[s.id] = s.groups.flatMap((g) =>
        g.chapters.map((ch) => scopedChapterId(s.id, g.id, ch.id, grade)),
      );
    }
    setSyllabus(full);
    setStep(3);
  };

  const finish = (withBackfill: boolean) => {
    store.createProfile({ name: name.trim() || "Student", grade, datesheet, examSyllabus: syllabus });
    if (withBackfill) {
      const bySubject: Record<string, string[]> = {};
      for (const [key, v] of Object.entries(backfilled)) {
        if (!v) continue;
        const [sid, cid] = key.split("|");
        (bySubject[sid] = bySubject[sid] ?? []).push(cid);
      }
      for (const [sid, cids] of Object.entries(bySubject)) store.backfill(sid, cids, true);
    }
    celebrate("goal");
    router.replace("/app/dashboard");
  };

  const datesSet = (["science", "maths", "sst"] as const).filter((k) => datesheet[k]).length;
  const selectedCount = syllabus ? Object.values(syllabus).reduce((n, a) => n + a.length, 0) : 0;
  const totalCount = getSubjects(grade).reduce(
    (n, s) => n + s.groups.reduce((m, g) => m + g.chapters.length, 0),
    0,
  );
  const backfillCount = Object.values(backfilled).filter(Boolean).length;

  return (
    <SmoothScroll>
      <section className="relative">
        <div
          aria-hidden
          className="pointer-events-none absolute top-[-180px] left-1/2 h-[380px] w-[720px] max-w-full -translate-x-1/2 rounded-full opacity-25 blur-[130px]"
          style={{ background: "linear-gradient(135deg, #6a4cf5, #d44df0, #ff7a3d)" }}
        />
        <div className="relative mx-auto max-w-5xl px-4 pt-6 pb-10 lg:pt-10">
          <div className="text-center">
            <p className="inline-flex items-center gap-2 rounded-full bg-white/[0.06] px-4 py-2 text-xs font-medium tracking-wide text-[#ccc] ring-1 ring-white/10">
              <span aria-hidden className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#22c55e]" />
              <BrandMark size={18} />
              Get started · takes 2 minutes
            </p>
            <h1 className="display-tight mx-auto mt-5 max-w-2xl text-[40px] sm:text-[56px]">
              Set up your prep.
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-[16px] text-[#999]">
              Four quick steps. Your dates, your syllabus, your head start — then a daily plan.
            </p>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-[280px_1fr]">
            {/* Rail */}
            <aside className="hidden lg:block">
              <ol className="relative space-y-1.5">
                <span aria-hidden className="absolute top-5 bottom-5 left-[27px] w-px bg-white/10" />
                {STEPS.map((s, i) => {
                  const idx = i + 1;
                  const active = idx === step;
                  const done = idx < step;
                  return (
                    <li
                      key={s.n}
                      aria-current={active ? "step" : undefined}
                      className={`relative rounded-[15px] p-4 ring-1 transition-all ${
                        active
                          ? "bg-white text-black ring-white"
                          : done
                            ? "bg-[#141414] ring-white/10"
                            : "bg-[#101010] ring-white/[0.05]"
                      }`}
                    >
                      <p className={`font-mono text-[12px] ${active ? "text-black/60" : "text-[#666]"}`}>
                        {done ? "✓" : s.n}
                      </p>
                      <p className="mt-0.5 text-[15px] font-semibold tracking-tight">{s.title}</p>
                      <p className={`text-[13px] ${active ? "text-black/60" : "text-[#777]"}`}>{s.copy}</p>
                      {active && (
                        <span
                          aria-hidden
                          className="absolute top-1/2 -right-[9px] hidden h-4 w-4 -translate-y-1/2 rotate-45 bg-white lg:block"
                        />
                      )}
                    </li>
                  );
                })}
              </ol>
              <div
                className="mt-4 rounded-[20px] p-5"
                style={{ background: "linear-gradient(150deg, #6a4cf5, #d44df0 60%, #ff5577)" }}
              >
                <p className="text-[15px] font-semibold tracking-tight">Pace, not panic.</p>
                <p className="mt-1 text-[14px] leading-relaxed opacity-90">
                  The tracker converts “exam in 40 days, 60 stages left” into one honest number:
                  stages per day.
                </p>
              </div>
            </aside>

            {/* Form card */}
            <Card className="glow-ring relative overflow-hidden sm:p-7">
              <div
                aria-hidden
                className="pointer-events-none absolute -top-20 -right-20 h-48 w-48 rounded-full opacity-[0.12] blur-[80px]"
                style={{ background: "linear-gradient(135deg, #6a4cf5, #ff7a3d)" }}
              />
              <div className="relative flex items-center justify-between">
                <p className="text-[13px] font-medium tracking-wide text-[#999] uppercase">
                  Step {step} of 4 · {STEPS[step - 1].title}
                </p>
                <p className="tnum font-mono text-[12px] text-[#666]">{Math.round((step / 4) * 100)}%</p>
              </div>
              <div className="relative mt-2 h-2 overflow-hidden rounded-full bg-white/[0.08]">
                <span
                  ref={barRef}
                  className="block h-full rounded-full"
                  style={{
                    width: `${(step / 4) * 100}%`,
                    background: "linear-gradient(90deg, #6a4cf5, #d44df0, #ff7a3d)",
                  }}
                />
              </div>

              {/* Mobile step dots */}
              <ol className="relative mt-4 flex gap-2 lg:hidden" aria-label="Progress">
                {STEPS.map((s, i) => (
                  <li key={s.n} className="flex-1">
                    <span
                      className={`block h-1.5 rounded-full transition-colors ${i + 1 <= step ? "bg-white" : "bg-white/10"}`}
                    />
                    <span className={`mt-1 block text-[11px] font-medium ${i + 1 === step ? "text-white" : "text-[#666]"}`}>
                      {s.title}
                    </span>
                  </li>
                ))}
              </ol>

              <div ref={bodyRef} key={step} className="relative mt-6">
                {step === 1 && (
                  <form
                    className="space-y-4"
                    onSubmit={(e) => {
                      e.preventDefault();
                      setStep(2);
                    }}
                  >
                    <h2 className="text-[22px] font-semibold tracking-tight">Who&apos;s studying?</h2>
                    <Field label="Student name">
                      <div className="flex items-center gap-3">
                        <span
                          aria-hidden
                          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-[19px] font-bold text-black ring-1 ring-white/20"
                        >
                          {(name.trim().charAt(0) || "S").toUpperCase()}
                        </span>
                        <input
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="e.g. Aarav"
                          required
                          autoFocus
                          maxLength={40}
                          className={inputCls}
                        />
                      </div>
                    </Field>
                    <Field label="Class">
                      <div role="radiogroup" aria-label="Class" className="grid grid-cols-2 gap-2">
                        {[
                          { v: 10, t: "Class 10", s: "5 stages / chapter" },
                          { v: 9, t: "Class 9", s: "3 stages / chapter" },
                        ].map((g) => {
                          const active = grade === g.v;
                          return (
                            <button
                              key={g.v}
                              type="button"
                              role="radio"
                              aria-checked={active}
                              onClick={() => setGrade(g.v)}
                              className={`min-h-[68px] rounded-[14px] px-4 py-3 text-left ring-1 transition-all active:scale-[0.98] ${
                                active
                                  ? "bg-white text-black ring-white"
                                  : "bg-[#1c1c1c] ring-white/10 hover:bg-[#242424]"
                              }`}
                            >
                              <span className="block text-[15px] font-semibold">{g.t}</span>
                              <span className={`mt-0.5 block text-[12.5px] ${active ? "text-black/60" : "text-[#888]"}`}>
                                {g.s}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </Field>
                    <div className="flex flex-wrap gap-1.5">
                      {["Offline-first", "No account", "Free forever"].map((t) => (
                        <span key={t} className="rounded-full bg-white/[0.06] px-3 py-1.5 text-[12px] font-medium text-[#bbb] ring-1 ring-white/10">
                          {t}
                        </span>
                      ))}
                    </div>
                    <PrimaryButton type="submit">Next: datesheet →</PrimaryButton>
                  </form>
                )}

                {step === 2 && (
                  <form
                    className="space-y-4"
                    onSubmit={(e) => {
                      e.preventDefault();
                      startSyllabus();
                    }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h2 className="text-[22px] font-semibold tracking-tight">Exam datesheet</h2>
                        <p className="-mt-0.5 text-[14px] text-[#999]">Pace is planned backwards from these dates.</p>
                      </div>
                      <span className="tnum shrink-0 rounded-full bg-white/[0.07] px-3 py-1.5 font-mono text-[12px] font-bold ring-1 ring-white/10">
                        {datesSet}/3 set
                      </span>
                    </div>
                    {SUBJECT_META.map((m) => {
                      const left = daysUntil(datesheet[m.key]);
                      return (
                        <div key={m.key} className="rounded-[14px] bg-[#1c1c1c]/60 p-3 ring-1 ring-white/[0.05]">
                          <div className="mb-1 flex items-center gap-2 px-1">
                            <span aria-hidden className={`h-2 w-2 rounded-full ${m.dot}`} />
                            <span className="text-[13px] font-semibold">{m.label}</span>
                            {left !== null && (
                              <span className={`ml-auto text-[12px] font-medium ${left < 0 ? "text-[#f87171]" : "text-[#4ade80]"}`}>
                                {left < 0 ? `${Math.abs(left)}d ago — update?` : left === 0 ? "exam today?!" : `in ${left}d`}
                              </span>
                            )}
                          </div>
                          <DateField
                            label={`${m.label} exam date`}
                            value={datesheet[m.key]}
                            required
                            onChange={(v) => setDatesheet((d) => ({ ...d, [m.key]: v }))}
                          />
                        </div>
                      );
                    })}
                    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                      <GhostButton onClick={() => setStep(1)}>← Back</GhostButton>
                      <PrimaryButton type="submit">Next: syllabus →</PrimaryButton>
                    </div>
                  </form>
                )}

                {step === 3 && syllabus && (
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h2 className="text-[22px] font-semibold tracking-tight">Exam syllabus</h2>
                        <p className="mt-1 text-[14px] text-[#999]">
                          Uncheck chapters NOT in this exam — daily pace stays honest.
                        </p>
                      </div>
                      <span className="tnum shrink-0 rounded-full bg-white/[0.07] px-3 py-1.5 font-mono text-[12px] font-bold ring-1 ring-white/10">
                        {selectedCount}/{totalCount}
                      </span>
                    </div>
                    <div className="mt-4 max-h-[46dvh] overflow-y-auto pr-1">
                      <SyllabusChecklist grade={grade} value={syllabus} onChange={setSyllabus} />
                    </div>
                    <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                      <GhostButton onClick={() => setStep(2)}>← Back</GhostButton>
                      <PrimaryButton onClick={() => setStep(4)}>Next: finished work →</PrimaryButton>
                    </div>
                  </div>
                )}

                {step === 4 && syllabus && (
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h2 className="text-[22px] font-semibold tracking-tight">Already finished anything?</h2>
                        <p className="mt-1 text-[14px] text-[#999]">
                          Tap chapters you&apos;ve fully completed — or skip. Everything stays editable.
                        </p>
                      </div>
                      {backfillCount > 0 && (
                        <span className="tnum shrink-0 rounded-full bg-[#22c55e]/10 px-3 py-1.5 font-mono text-[12px] font-bold text-[#4ade80] ring-1 ring-[#22c55e]/25">
                          {backfillCount} done
                        </span>
                      )}
                    </div>
                    <div className="mt-4 max-h-[42dvh] space-y-3 overflow-y-auto pr-1">
                      {getSubjects(grade).map((s) => {
                        const rows = s.groups.flatMap((g) =>
                          g.chapters
                            .filter((ch) =>
                              (syllabus[s.id] ?? []).includes(scopedChapterId(s.id, g.id, ch.id, grade)),
                            )
                            .map((ch) => ({ ch })),
                        );
                        if (rows.length === 0) return null;
                        const doneInSub = rows.filter(({ ch }) => backfilled[`${s.id}|${ch.id}`]).length;
                        const allOn = doneInSub === rows.length;
                        return (
                          <div key={s.id} className="overflow-hidden rounded-[14px] bg-[#1c1c1c]/60 ring-1 ring-white/[0.05]">
                            <div className="flex min-h-[48px] items-center justify-between gap-2 px-3.5">
                              <p className="text-[14px] font-semibold">
                                {s.name}{" "}
                                <span className="tnum font-mono text-[12px] font-normal text-[#888]">
                                  {doneInSub}/{rows.length}
                                </span>
                              </p>
                              <button
                                type="button"
                                onClick={() =>
                                  setBackfilled((b) => {
                                    const next = { ...b };
                                    for (const { ch } of rows) next[`${s.id}|${ch.id}`] = !allOn;
                                    return next;
                                  })
                                }
                                className="min-h-[36px] rounded-full px-3 text-[12.5px] font-semibold text-[#0099ff] hover:bg-white/[0.06]"
                              >
                                {allOn ? "Clear" : "Select all"}
                              </button>
                            </div>
                            <div className="space-y-1.5 px-2 pb-2">
                              {rows.map(({ ch }) => {
                                const key = `${s.id}|${ch.id}`;
                                const done = !!backfilled[key];
                                return (
                                  <button
                                    key={key}
                                    type="button"
                                    onClick={() => setBackfilled((b) => ({ ...b, [key]: !b[key] }))}
                                    aria-pressed={done}
                                    className={`flex min-h-[52px] w-full items-center justify-between gap-3 rounded-[10px] px-3.5 text-left ring-1 transition-all active:scale-[0.99] ${
                                      done ? "bg-white text-black ring-white" : "bg-[#1c1c1c] ring-white/[0.06] hover:bg-[#222]"
                                    }`}
                                  >
                                    <span className="text-[14px] font-medium">
                                      Ch {ch.no}: {ch.name}
                                    </span>
                                    <span className="shrink-0 text-[13px] font-semibold">{done ? "✓ Done" : "Mark"}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                      <GhostButton onClick={() => finish(false)}>Skip &amp; finish</GhostButton>
                      <PrimaryButton onClick={() => finish(true)}>Start tracking →</PrimaryButton>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </section>
    </SmoothScroll>
  );
}
