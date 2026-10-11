/** Analysis — finish forecasts, subject comparison, stage heatmap, best day.
 * Deeper cuts than Insights; everything derives from logged stage updates. */
"use client";

import { useTracker } from "../../../lib/storage";
import { getSubjects } from "../../../lib/chapters";
import { getStageKeys, getStageLabel } from "../../../lib/stages";
import {
  calculateSubjectAnalytics,
  forecastFinish,
  get7DayActivity,
} from "../../../lib/insights";
import { CountUp, Reveal } from "../../../lib/motion";
import { Card, EmptyNotice, SpotCard, StatusTag } from "../../../components/tracker-ui";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function AnalysisPage() {
  const { profile, ready } = useTracker();
  if (!ready) return null;
  if (!profile) return <EmptyNotice title="No data yet" copy="Finish onboarding to see analysis." />;

  const subjects = getSubjects(profile.grade);
  const analytics = subjects.map((s) => ({
    ...calculateSubjectAnalytics(profile, s),
    forecast: forecastFinish(profile, s),
  }));
  const ranked = [...analytics].sort((a, b) => b.completionPercentage - a.completionPercentage);
  const maxPct = Math.max(...ranked.map((a) => a.completionPercentage), 1);

  const trend = get7DayActivity(profile);
  let bestIdx = 0;
  trend.counts.forEach((c, i) => {
    if (c > trend.counts[bestIdx]) bestIdx = i;
  });
  const bestDay = DAYS[new Date(trend.dates[bestIdx] + "T12:00:00").getDay()];
  const weekTotal = trend.counts.reduce((n, c) => n + c, 0);
  const stageKeys = getStageKeys(profile.grade);

  return (
    <div className="space-y-4">
      <Reveal>
        <div>
          <h1 className="display-tight text-[30px] sm:text-[38px]">Will you finish in time?</h1>
          <p className="mt-1 text-[14px] text-[#999]">
            Projected finish dates from your actual 7-day pace — not wishful thinking.
          </p>
        </div>
      </Reveal>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {analytics.map((a, i) => (
          <Reveal key={a.subjectId} delay={Math.min(i * 0.07, 0.21)}>
            <SpotCard className="h-full rounded-[20px] bg-[#141414] ring-1 ring-white/[0.06]">
              <div className="p-5">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[15px] font-semibold tracking-tight">{a.subjectName}</p>
                  <StatusTag
                    color={a.forecast.onTrack ? "green" : "red"}
                    label={a.forecast.onTrack ? "On track" : "At risk"}
                  />
                </div>
                <p className="display-tight mt-2 text-[34px]">
                  {a.forecast.finishLabel === "Complete" || a.forecast.finishLabel === "No pace yet" ? (
                    a.forecast.finishLabel
                  ) : (
                    <>
                      <CountUp to={parseInt(a.forecast.finishDate!.split("-")[2], 10)} suffix="" />{" "}
                      <span className="text-[22px] text-[#999]">{a.forecast.finishLabel.replace(/^\d+\s*/, "")}</span>
                    </>
                  )}
                </p>
                <p className="mt-1 text-[13px] text-[#999]">
                  {a.remainingStages === 0
                    ? "Every stage in your syllabus is done."
                    : `Finishes ~${a.forecast.finishLabel} at ${a.actualPace}/day · ${a.remainingStages} stages left`}
                </p>
                {a.examDate && (
                  <p className="mt-1 text-[13px] text-[#999]">
                    Exam: {new Date(a.examDate + "T12:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  </p>
                )}
              </div>
            </SpotCard>
          </Reveal>
        ))}
      </div>

      <Reveal>
        <Card>
          <h2 className="text-[15px] font-semibold tracking-tight">Subject comparison</h2>
          <div className="mt-4 space-y-3.5">
            {ranked.map((a, i) => (
              <div key={a.subjectId}>
                <div className="mb-1.5 flex items-baseline justify-between text-[14px]">
                  <span className="font-medium">
                    <span className="mr-2 font-mono text-[12px] text-[#666]">{i + 1}</span>
                    {a.subjectName}
                  </span>
                  <span className="font-bold">
                    <CountUp to={a.completionPercentage} suffix="%" />
                  </span>
                </div>
                <div className="bar-shimmer h-2.5 overflow-hidden rounded-full bg-white/[0.07]">
                  <div
                    className="h-full rounded-full bg-white transition-[width] duration-1000"
                    style={{ width: `${(a.completionPercentage / maxPct) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </Reveal>

      <Reveal>
        <Card>
          <h2 className="text-[15px] font-semibold tracking-tight">Stage heatmap</h2>
          <p className="text-[13px] text-[#999]">Completion % per subject × stage. Bright = stronger.</p>
          {/* Mobile: stacked per-subject cards, no sideways scroll */}
          <div className="mt-4 space-y-3 sm:hidden">
            {analytics.map((a) => (
              <div key={a.subjectId} className="rounded-[14px] bg-[#101010] p-3.5 ring-1 ring-white/[0.05]">
                <p className="mb-2.5 text-[14px] font-semibold">{a.subjectName}</p>
                <div className="space-y-2">
                  {a.stageBreakdown.map((s) => (
                    <div key={s.key}>
                      <div className="mb-1 flex items-center justify-between text-[12.5px]">
                        <span className="text-[#ccc]">{s.label}</span>
                        <span className="tnum font-bold">{s.pct}%</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-white/[0.07]">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${s.pct}%`,
                            background: `rgba(255,255,255,${0.35 + (s.pct / 100) * 0.65})`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 hidden overflow-x-auto sm:block">
            <table className="w-full min-w-[520px] border-separate" style={{ borderSpacing: 6 }}>
              <thead>
                <tr>
                  <th className="w-28" />
                  {stageKeys.map((sk) => (
                    <th key={sk} className="pb-1 text-left text-[11px] font-medium leading-tight text-[#999]">
                      {getStageLabel("default", sk)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {analytics.map((a) => (
                  <tr key={a.subjectId}>
                    <td className="pr-1 text-[13px] font-medium">{a.subjectName}</td>
                    {a.stageBreakdown.map((s) => (
                      <td key={s.key}>
                        <div
                          className="flex h-12 items-center justify-center rounded-[10px] text-[13px] font-bold"
                          style={{ background: `rgba(255,255,255,${0.05 + (s.pct / 100) * 0.75})` }}
                          title={`${s.label}: ${s.pct}%`}
                        >
                          {s.pct}
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </Reveal>

      <Reveal>
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-[15px] font-semibold tracking-tight">Your power day is {bestDay}</h2>
              <p className="mt-0.5 text-[13px] text-[#999]">
                Most stages logged on {bestDay}s · <CountUp to={weekTotal} suffix="" /> stages this week
              </p>
            </div>
            <p className="rounded-full bg-white/[0.07] px-4 py-2 text-[13px] font-semibold ring-1 ring-white/10">
              Protect that day. Schedule hard stages on {bestDay}s.
            </p>
          </div>
        </Card>
      </Reveal>
    </div>
  );
}
