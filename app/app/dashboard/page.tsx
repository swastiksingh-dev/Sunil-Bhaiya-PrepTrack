/** Dashboard - greeting band, live stats, subject pace cards, Today's list.
 * Entrances + count-ups via GSAP primitives; no scroll-jacking. */
"use client";

import Link from "next/link";
import { useTracker } from "../../../lib/storage";
import { getSubjects } from "../../../lib/chapters";
import { getOrderedSubjectPaces } from "../../../lib/planner";
import { calculateSubjectAnalytics } from "../../../lib/insights";
import { CountUp, Reveal } from "../../../lib/motion";
import { celebrate } from "../../../lib/celebrate";
import { Card, CircleChart, EmptyNotice, PrimaryButton, SpotCard, StatusTag } from "../../../components/tracker-ui";

export default function DashboardPage() {
  const store = useTracker();
  const { profile, ready } = store;
  if (!ready) return null;
  if (!profile)
    return (
      <EmptyNotice
        title="No student yet"
        copy="Add your first student to start tracking exam preparation."
        action={
          <Link href="/app/onboarding">
            <PrimaryButton small>Get started</PrimaryButton>
          </Link>
        }
      />
    );

  const subjects = getSubjects(profile.grade);
  const paces = getOrderedSubjectPaces(profile, subjects);
  const analyticsById = Object.fromEntries(
    subjects.map((s) => [s.id, calculateSubjectAnalytics(profile, s)]),
  );
  const stageCount = profile.grade === 9 ? 3 : 5;

  const totalStages = paces.reduce((n, p) => n + p.totalStages, 0);
  const doneStages = paces.reduce((n, p) => n + p.completedStages, 0);
  const overall = totalStages > 0 ? Math.round((doneStages / totalStages) * 100) : 0;
  const withDates = paces.filter((p) => p.daysLeft !== null && !p.isPastExam);
  const nearest = withDates.length > 0 ? Math.min(...withDates.map((p) => p.daysLeft as number)) : null;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-4 lg:space-y-5">
      {profile.v6PreResourceNoticeNeeded && (
        <Banner
          copy="Class 9 stage update: CBQ/PYQ/Exemplar tracking was removed -” no official material exists for the new edition. Prior progress was archived in Settings."
          cta="Got it"
          onCta={() => store.dismissNotice("v6PreResourceNoticeNeeded")}
        />
      )}
      {profile.v5NoticeNeeded && (
        <Banner
          copy="Your Class 9 books moved to the new NCERT edition. Old chapter tracking was archived -” please re-check your exam syllabus."
          cta="Got it"
          onCta={() => store.dismissNotice("v5NoticeNeeded")}
        />
      )}
      {!profile.v6PreResourceNoticeNeeded && !profile.v5NoticeNeeded && profile.needsSyllabusConfirmation && (
        <Banner
          copy="Confirm your exam syllabus for accurate pace tracking."
          cta="Review syllabus"
          link="/app/settings"
        />
      )}
      {!profile.needsSyllabusConfirmation && store.shouldNudgeBackup() && (
        <Banner
          copy="Progress lives only on this device. Save it to a file so a lost phone doesn't mean lost prep."
          cta="Save progress"
          link="/app/settings"
        />
      )}

      {/* Hero band */}
      <Reveal>
        <section className="relative overflow-hidden rounded-[20px] bg-[#141414] p-5 ring-1 ring-white/[0.06] sm:p-7 lg:p-8">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-24 right-[-60px] h-56 w-56 rounded-full opacity-[0.13] blur-[90px]"
            style={{ background: "linear-gradient(135deg, #6a4cf5, #d44df0)" }}
          />
          <div className="relative flex flex-wrap items-center gap-4 sm:gap-5 lg:gap-8">
            <CircleChart pct={overall} size={88} sub="complete" />
            <div className="min-w-[180px] flex-1">
              <p className="font-mono text-[11px] tracking-[0.08em] text-[#777] uppercase">
                {greeting} · Class {profile.grade}
              </p>
              <h1 className="display-tight tnum mt-1 text-[26px] break-words sm:text-[38px]">
                {profile.name}&apos;s prep is <CountUp to={overall} suffix="%" /> there.
              </h1>
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                <span className="tnum rounded-full bg-white/[0.07] px-3 py-1.5 text-[12px] font-semibold ring-1 ring-white/[0.07]">
                  {Math.round(doneStages)}/{totalStages} stages
                </span>
                {nearest !== null && (
                  <span className="tnum rounded-full bg-white/[0.07] px-3 py-1.5 text-[12px] font-semibold ring-1 ring-white/[0.07]">
                    nearest exam {nearest}d
                  </span>
                )}
                <span className="rounded-full bg-white/[0.07] px-3 py-1.5 text-[12px] font-semibold ring-1 ring-white/[0.07]">
                  {stageCount} stages/chapter
                </span>
              </div>
            </div>
            <Link href="/app/chapters" className="relative w-full sm:w-auto">
              <span className="inline-flex h-12 w-full items-center justify-center rounded-full bg-white px-6 text-sm font-medium text-black transition-transform hover:scale-[1.03] active:scale-[0.98] sm:w-auto">
                Continue studying
              </span>
            </Link>
          </div>
        </section>
      </Reveal>

      {/* Subjects */}
      <div>
        <Reveal>
          <div className="mb-2.5 flex items-baseline justify-between">
            <h2 className="text-[15px] font-semibold tracking-tight lg:text-[17px]">
              Subject preparation
            </h2>
            <span className="font-mono text-[12px] text-[#666]">01</span>
          </div>
        </Reveal>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {paces.map((p, i) => (
            <Reveal key={p.subjectId} delay={Math.min(i * 0.07, 0.21)}>
              <Link href={`/app/chapters?subject=${p.subjectId}`} className="block h-full">
                <SpotCard className="h-full rounded-[20px] bg-[#141414] ring-1 ring-white/[0.06] transition-all duration-300 hover:-translate-y-1 hover:bg-[#181818] hover:ring-white/[0.14]">
                <div className="p-5 sm:p-6">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[16px] font-semibold tracking-tight">{p.subjectName}</p>
                    <StatusTag color={p.statusColor} label={p.statusLabel} />
                  </div>
                  <p className="tnum mt-1.5 font-mono text-[11px] tracking-[0.08em] text-[#777] uppercase">
                    {p.examDate
                      ? `Exam ${new Date(p.examDate + "T12:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short" }).toUpperCase()}`
                      : "No exam date"}
                    {p.daysLeft !== null && !p.isPastExam && p.remainingStages > 0
                      ? ` · ${p.daysLeft}d left`
                      : ""}
                  </p>
                  <div className="mt-3 flex items-center gap-4">
                    <CircleChart pct={p.completionPercentage} size={84} />
                    <div className="min-w-0">
                      {p.totalStages === 0 ? (
                        <p className="text-[15px] font-semibold">No chapters in exam</p>
                      ) : p.remainingStages === 0 ? (
                        <p className="text-[15px] font-semibold">All 100% completed</p>
                      ) : (
                        <>
                          <p className="tnum text-[26px] leading-none font-bold">
                            {Math.round(p.remainingStages)}
                            <span className="ml-1 align-middle text-[12px] font-medium text-[#999]">stages left</span>
                          </p>
                          <p className="tnum mt-1.5 text-[13px] text-[#999]">
                            {p.scopedChapterCount} chapters ·{" "}
                            <strong className="text-white">{p.requiredPace}/day</strong> needed
                          </p>
                        </>
                      )}
                      {p.isPastExam && p.remainingStages > 0 && (
                        <p className="mt-1 text-[12.5px] text-[#999]">Update datesheet in Settings.</p>
                      )}
                    </div>
                  </div>
                  {p.totalStages > 0 && (
                    <div className="bar-shimmer mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
                      <div
                        className="h-full rounded-full bg-white transition-[width] duration-700"
                        style={{ width: `${p.completionPercentage}%` }}
                      />
                    </div>
                  )}
                  {p.totalStages > 0 && (
                    <div className="mt-2.5 flex items-center gap-1.5" aria-label="Per-stage progress">
                      {analyticsById[p.subjectId].stageBreakdown.map((s) => (
                        <span
                          key={s.key}
                          title={`${s.label}: ${s.pct}%`}
                          style={{ width: `${100 / Math.max(1, analyticsById[p.subjectId].stageBreakdown.length)}%` }}
                          className={`h-1.5 rounded-full ${
                            s.pct >= 100 ? "bg-[#22c55e]" : s.pct > 0 ? "bg-[#f59e0b]" : "bg-white/[0.12]"
                          }`}
                        />
                      ))}
                      <span className="ml-1 shrink-0 text-[11px] text-[#666]">stages</span>
                    </div>
                  )}
                </div>
                </SpotCard>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>

      {/* Today's list */}
      <Reveal>
        <Card>
          <div className="flex items-baseline justify-between gap-2">
            <h2 className="text-[15px] font-semibold tracking-tight lg:text-[17px]">
              Today&apos;s list
            </h2>
            <span className="font-mono text-[12px] text-[#666]">02</span>
          </div>
          <div className="mt-1 flex justify-end">
            <Link href="/app/todo" className="shrink-0 text-[13px] font-medium text-[#0099ff] hover:underline">
              Open to-do &rarr;
            </Link>
          </div>
          {(profile.todos ?? []).filter((t) => !t.done).length === 0 ? (
            <div className="mt-3 flex min-h-[64px] flex-col items-center justify-center gap-2 rounded-[12px] bg-[#1c1c1c] px-4 py-4 text-center ring-1 ring-white/[0.05]">
              <p className="text-[14px] text-[#999]">Nothing on the list. Add today&apos;s three.</p>
              <Link href="/app/todo" className="inline-flex h-10 items-center rounded-full bg-white px-5 text-[13px] font-medium text-black">
                Create tasks
              </Link>
            </div>
          ) : (
            <ul className="mt-3 space-y-2.5">
              {(profile.todos ?? [])
                .filter((t) => !t.done)
                .slice(0, 3)
                .map((t) => (
                  <li
                    key={t.id}
                    className="flex min-h-[56px] items-center gap-3 rounded-[12px] bg-[#1c1c1c] px-3.5 py-2.5 ring-1 ring-white/[0.05]"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        store.toggleTodo(t.id);
                        celebrate("stage");
                      }}
                      aria-label={`Complete ${t.text}`}
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full ring-2 ring-white/25 transition-all hover:ring-white/50 active:scale-90"
                    />
                    <p className="min-w-0 flex-1 truncate text-[14px] font-medium">{t.text}</p>
                  </li>
                ))}
          </ul>
        )}
      </Card>
      </Reveal>

      {profile.grade === 10 && (
      <Reveal>
        <div className="mb-2.5 flex items-baseline justify-between">
          <h2 className="text-[15px] font-semibold tracking-tight lg:text-[17px]">
            CBSE news - Class 10
          </h2>
          <span className="font-mono text-[12px] text-[#666]">03</span>
        </div>
        <Card>
          <div className="flex items-center gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/[0.07] ring-1 ring-white/10">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-[#999]">
                <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.7 21a2 2 0 01-3.4 0" />
              </svg>
            </span>
            <div>
              <p className="text-[15px] font-semibold tracking-tight">Board updates, soon</p>
              <p className="mt-0.5 text-[13px] text-[#999]">
                Datesheets, syllabus notices, and paper patterns will land here. Nothing yet - check back soon.
              </p>
            </div>
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            {[
              { label: "Datesheets", href: "https://www.cbse.gov.in/cbsenew/datesheet.html" },
              { label: "Syllabus and circulars", href: "https://cbseacademic.nic.in/" },
              { label: "Results", href: "https://results.cbse.nic.in/" },
            ].map((c) => (
              <a
                key={c.label}
                href={c.href}
                target="_blank"
                rel="noopener"
                className="group flex min-h-[52px] items-center justify-between gap-2 rounded-[12px] bg-[#1c1c1c] px-4 ring-1 ring-white/[0.06] transition-colors hover:bg-[#222]"
              >
                <span className="text-[13.5px] font-medium">{c.label}</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="shrink-0 text-[#777] transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-white">
                  <path d="M7 17L17 7M8 7h9v9" />
                </svg>
              </a>
            ))}
          </div>
          <p className="mt-3 text-[12px] text-[#666]">
            Official CBSE channels. Open outside the app and need internet.
          </p>
        </Card>
      </Reveal>
      )}
    </div>
  );
}

function Banner({ copy, cta, onCta, link }: { copy: string; cta: string; onCta?: () => void; link?: string }) {
  const btn = (
    <span className="inline-flex h-9 shrink-0 items-center rounded-full bg-white px-4 text-[13px] font-medium text-black">
      {cta}
    </span>
  );
  return (
    <div className="flex items-center justify-between gap-3 rounded-[15px] bg-[#1c1c1c] p-4 ring-1 ring-white/10">
      <p className="text-[13px] leading-relaxed text-[#ccc]">{copy}</p>
      {link ? <Link href={link}>{btn}</Link> : <button type="button" onClick={onCta}>{btn}</button>}
    </div>
  );
}
