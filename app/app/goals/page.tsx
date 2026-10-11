/** Weekly goal — a student-set stages/week target with a live progress ring.
 * Target persists on the profile; progress reuses the 7-day activity count. */
"use client";

import { useEffect, useRef } from "react";
import { useTracker } from "../../../lib/storage";
import { celebrate } from "../../../lib/celebrate";
import { get7DayActivity } from "../../../lib/insights";
import { CountUp, Reveal } from "../../../lib/motion";
import { Card, CircleChart, EmptyNotice } from "../../../components/tracker-ui";

const DAYS = ["S", "M", "T", "W", "T", "F", "S"];

export default function GoalsPage() {
  const store = useTracker();
  const { profile, ready } = store;
  if (!ready) return null;
  if (!profile) return <EmptyNotice title="No data yet" copy="Finish onboarding first." />;

  const goal = profile.weeklyGoal ?? 10;
  const trend = get7DayActivity(profile);
  const weekCount = trend.counts.reduce((n, c) => n + c, 0);
  const pct = Math.min(100, Math.round((weekCount / goal) * 100));
  const max = Math.max(...trend.counts, 1);
  const left = Math.max(0, goal - weekCount);
  const prevCount = useRef(weekCount);
  useEffect(() => {
    if (prevCount.current < goal && weekCount >= goal) celebrate("goal");
    prevCount.current = weekCount;
  }, [weekCount, goal]);

  return (
    <div className="space-y-4">
      <Reveal>
        <div>
          <h1 className="display-tight text-[30px] sm:text-[38px]">This week&apos;s goal</h1>
          <p className="mt-1 text-[14px] text-[#999]">
            One number to beat, reset every Monday in spirit — tracked over rolling 7 days.
          </p>
        </div>
      </Reveal>

      <Reveal>
        <section className="glow-ring relative overflow-hidden rounded-[20px] bg-[#141414] p-6 ring-1 ring-white/[0.06] sm:p-8">
          <div className="flex flex-wrap items-center gap-6">
            <CircleChart pct={pct} size={112} sub="of goal" />
            <div className="min-w-[200px] flex-1">
              <p className="text-[13px] font-medium tracking-wide text-[#999] uppercase">Stages logged</p>
              <p className="display-tight mt-1 text-[44px]">
                <CountUp to={weekCount} suffix="" />
                <span className="text-[22px] text-[#999]"> / {goal}</span>
              </p>
              <p className="mt-1 text-[14px] text-[#999]">
                {left === 0 ? (
                  <strong className="text-white">Goal smashed. Raise it?</strong>
                ) : (
                  <><strong className="text-white">{left} to go</strong> — about {(left / 7).toFixed(1)}/day</>
                )}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="Lower weekly goal"
                onClick={() => store.setWeeklyGoal(goal - 1)}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-[#1c1c1c] text-[20px] ring-1 ring-white/10 transition-transform active:scale-90"
              >
                −
              </button>
              <span className="w-16 text-center text-[15px] font-bold">{goal}/wk</span>
              <button
                type="button"
                aria-label="Raise weekly goal"
                onClick={() => store.setWeeklyGoal(goal + 1)}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-[20px] font-bold text-black transition-transform active:scale-90"
              >
                +
              </button>
            </div>
          </div>
          <div className="mt-6 flex h-24 items-end gap-2">
            {trend.counts.map((c, i) => (
              <div key={trend.dates[i]} className="flex flex-1 flex-col items-center gap-1.5">
                <span className="text-[11px] font-semibold text-[#ccc]">{c}</span>
                <div
                  className={`bar-shimmer w-full rounded-full ${c > 0 ? "bg-white" : "bg-white/10"}`}
                  style={{ height: `${Math.max(6, Math.round((c / max) * 64))}px` }}
                />
                <span className="text-[11px] text-[#999]">{DAYS[i]}</span>
              </div>
            ))}
          </div>
        </section>
      </Reveal>

      <Reveal>
        <Card>
          <h2 className="text-[15px] font-semibold tracking-tight">How goals compound</h2>
          <ul className="mt-3 space-y-2.5 text-[14px] text-[#999]">
            {[
              "10 stages a week finishes a 50-stage subject in 5 weeks — before most datesheets.",
              "Logging daily protects your streak; the streak protects the habit.",
              "Miss a day? The goal counts the week, never the day. No guilt spirals.",
            ].map((t) => (
              <li key={t} className="flex gap-3">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mt-1 shrink-0">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                {t}
              </li>
            ))}
          </ul>
        </Card>
      </Reveal>
    </div>
  );
}
