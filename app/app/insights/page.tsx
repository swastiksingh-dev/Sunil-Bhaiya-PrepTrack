/** Insights — 7-day trend, per-subject donuts, pace comparison, stage breakdown. */
"use client";

import { useTracker } from "../../../lib/storage";
import { getSubjects } from "../../../lib/chapters";
import { calculateSubjectAnalytics, get7DayActivity } from "../../../lib/insights";
import { Card, CircleChart, EmptyNotice, StatusTag } from "../../../components/tracker-ui";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function InsightsPage() {
  const { profile, ready } = useTracker();
  if (!ready) return null;
  if (!profile) return <EmptyNotice title="No data yet" copy="Finish onboarding to see analytics." />;

  const subjects = getSubjects(profile.grade);
  const trend = get7DayActivity(profile);
  const max = Math.max(...trend.counts, 5);
  const analytics = subjects.map((s) => calculateSubjectAnalytics(profile, s));

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-[24px] font-semibold tracking-tight">Insights</h1>
        <p className="mt-0.5 text-[14px] text-[#999]">Class {profile.grade} preparation analytics.</p>
      </div>

      <Card>
        <h2 className="text-[15px] font-semibold tracking-tight">7-day activity trend</h2>
        <p className="text-[13px] text-[#999]">Stages marked per day, all subjects.</p>
        <div className="mt-4 flex h-32 items-end gap-2" role="img" aria-label="Bar chart of stages marked per day">
          {trend.dates.map((d, i) => {
            const v = trend.counts[i];
            return (
              <div key={d} className="flex flex-1 flex-col items-center gap-1.5">
                <span className="text-[11px] font-semibold text-[#ccc]">{v}</span>
                <div
                  className={`w-full rounded-full ${v > 0 ? "bg-white" : "bg-white/10"}`}
                  style={{ height: `${Math.max(6, Math.round((v / max) * 88))}px` }}
                />
                <span className="text-[11px] text-[#999]">{DAYS[new Date(d + "T12:00:00").getDay()]}</span>
              </div>
            );
          })}
        </div>
      </Card>

      {analytics.map((a) => (
        <Card key={a.subjectId}>
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-[17px] font-semibold tracking-tight">{a.subjectName}</h2>
            <StatusTag color={a.statusColor} label={a.statusLabel} />
          </div>

          <div className="mt-4 flex items-center gap-5">
            <CircleChart pct={a.completionPercentage} size={96} />
            <div>
              <p className="text-[16px] font-bold">{a.completionPercentage}% complete</p>
              <p className="mt-0.5 text-[13px] text-[#999]">
                {a.completedStages} / {a.totalStages} stages · {a.scopedChapterCount} chapters in exam
              </p>
            </div>
          </div>

          {a.focusCallout && (
            <p className="mt-4 rounded-[10px] bg-[#f59e0b]/10 p-3 text-[13px] leading-relaxed text-[#fbbf24] ring-1 ring-[#f59e0b]/25">
              {a.focusCallout}
            </p>
          )}

          <div className="mt-4 space-y-2.5 rounded-[12px] bg-[#101010] p-4 ring-1 ring-white/[0.05]">
            <PaceBar label={`Your pace (${a.actualPace}/day)`} width={pct(a.actualPace, a.requiredPace)} tone={a.actualPace >= a.requiredPace ? "good" : "bad"} />
            <PaceBar label={`Target pace (${a.requiredPace}/day)`} width={pct(a.requiredPace, a.actualPace)} tone="target" />
            <p className="text-[13px] text-[#999]">
              {a.actualPace >= a.requiredPace ? (
                <>Meeting your target of {a.requiredPace}/day. Hold the line.</>
              ) : (
                <>Doing {a.actualPace}/day — need <strong className="text-white">{a.requiredPace}/day</strong> to finish on time.</>
              )}
            </p>
          </div>

          <div className="mt-4">
            <h3 className="text-[13px] font-medium text-[#999] uppercase">Stage breakdown</h3>
            <div className="mt-2.5 space-y-3">
              {a.stageBreakdown.map((s) => (
                <div key={s.key}>
                  <div className="mb-1 flex items-center justify-between text-[13px]">
                    <span className="font-medium">{s.label}</span>
                    <span className="text-[#999]">
                      {s.doneCh} done · {s.progCh} active · {s.noneCh} pending
                    </span>
                  </div>
                  <div className="flex h-3.5 w-full overflow-hidden rounded-full bg-white/[0.07]">
                    <div className="h-full bg-[#22c55e]" style={{ width: `${(s.doneCh / Math.max(1, s.totalCh)) * 100}%` }} />
                    <div className="h-full bg-[#f59e0b]" style={{ width: `${(s.progCh / Math.max(1, s.totalCh)) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

function pct(v: number, other: number) {
  return Math.round((v / Math.max(v, other, 3)) * 100);
}

function PaceBar({ label, width, tone }: { label: string; width: number; tone: "good" | "bad" | "target" }) {
  const cls = tone === "good" ? "bg-[#22c55e]" : tone === "bad" ? "bg-[#f87171]" : "bg-[#0099ff]/80";
  return (
    <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-2.5">
      <span className="shrink-0 text-[12.5px] font-medium text-[#ccc] sm:w-[150px]">{label}</span>
      <div className="h-3.5 flex-1 overflow-hidden rounded-full bg-white/[0.07]">
        <div className={`h-full rounded-full ${cls}`} style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}
