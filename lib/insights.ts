/** Analytics — 7-day activity + per-subject breakdowns.
 * Single interface: get7DayActivity, calculateSubjectAnalytics.
 * Hand-rolled SVG data only; no chart library (offline-first). */

import { getStageKeys, getStageLabel } from "./stages";
import type { Subject } from "./chapters";
import { todayString, type Profile } from "./storage";
import { calculateSubjectPace, type SubjectPace } from "./planner";

export interface StageSlice {
  key: string;
  label: string;
  doneCh: number;
  progCh: number;
  noneCh: number;
  totalCh: number;
  pct: number;
}

export interface SubjectAnalytics extends SubjectPace {
  actualPace: number;
  stageBreakdown: StageSlice[];
  focusCallout: string | null;
}

export interface FinishForecast {
  finishDate: string | null;
  finishLabel: string;
  onTrack: boolean;
}

/** Projected finish date from actual 7-day pace vs remaining work.
 * Falls back to required pace when the student hasn't logged a week yet. */
export function forecastFinish(
  profile: Profile,
  subject: Subject,
): FinishForecast {
  const a = calculateSubjectAnalytics(profile, subject);
  if (a.remainingStages === 0)
    return { finishDate: null, finishLabel: "Complete", onTrack: true };
  const pace = a.actualPace > 0 ? a.actualPace : a.requiredPace;
  if (pace <= 0 || !Number.isFinite(pace))
    return { finishDate: null, finishLabel: "No pace yet", onTrack: false };
  const days = Math.ceil(a.remainingStages / pace);
  const d = new Date(todayString() + "T12:00:00");
  d.setDate(d.getDate() + days);
  const label = d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  const exam = a.examDate ? new Date(a.examDate + "T12:00:00") : null;
  return {
    finishDate: d.toISOString().split("T")[0],
    finishLabel: label,
    onTrack: exam ? d <= exam : true,
  };
}

export function get7DayActivity(profile: Profile): { dates: string[]; counts: number[] } {
  const today = new Date(todayString());
  const dates: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().split("T")[0]);
  }
  const counts = dates.map(() => 0);
  if (profile?.progress) {
    for (const prog of Object.values(profile.progress)) {
      const iso = prog?.updatedAt?.split("T")[0];
      const idx = iso ? dates.indexOf(iso) : -1;
      if (idx >= 0) counts[idx] += 1;
    }
  }
  return { dates, counts };
}

export function calculateSubjectAnalytics(
  profile: Profile,
  subject: Subject,
): SubjectAnalytics {
  const pace = calculateSubjectPace(profile, subject);
  const stageKeys = getStageKeys(profile.grade);
  const today = new Date(todayString());

  let recent = 0;
  for (const ch of pace.inSyllabusChapters) {
    const prog = profile.progress?.[`${subject.id}.${ch.id}`];
    if (!prog?.updatedAt) continue;
    const diffDays = (today.getTime() - new Date(prog.updatedAt.split("T")[0]).getTime()) / 86_400_000;
    if (diffDays <= 7 && diffDays >= 0) {
      for (const sk of stageKeys) {
        if (prog[sk] === "done") recent += 1;
        else if (prog[sk] === "progress") recent += 0.5;
      }
    }
  }
  const actualPace = parseFloat((recent / 7).toFixed(1));

  const breakdown: StageSlice[] = [];
  let weakest: StageSlice | null = null;
  let strongest: StageSlice | null = null;
  for (const sk of stageKeys) {
    let doneCh = 0;
    let progCh = 0;
    let noneCh = 0;
    for (const ch of pace.inSyllabusChapters) {
      const st = profile.progress?.[`${subject.id}.${ch.id}`]?.[sk] ?? "none";
      if (st === "done") doneCh++;
      else if (st === "progress") progCh++;
      else noneCh++;
    }
    const totalCh = pace.scopedChapterCount;
    const pct = totalCh > 0 ? Math.round(((doneCh + 0.5 * progCh) / totalCh) * 100) : 0;
    const slice: StageSlice = {
      key: sk,
      label: getStageLabel(subject.id, sk),
      doneCh,
      progCh,
      noneCh,
      totalCh,
      pct,
    };
    breakdown.push(slice);
    if (totalCh > 0) {
      if (!weakest || pct < weakest.pct) weakest = slice;
      if (!strongest || pct > strongest.pct) strongest = slice;
    }
  }

  let focusCallout: string | null = null;
  if (weakest && strongest && strongest.pct - weakest.pct >= 20 && pace.scopedChapterCount > 0) {
    focusCallout = `Weakest spot: ${weakest.label} — only ${weakest.pct}% done vs ${strongest.pct}% for ${strongest.label}.`;
  }

  return { ...pace, actualPace, stageBreakdown: breakdown, focusCallout };
}
