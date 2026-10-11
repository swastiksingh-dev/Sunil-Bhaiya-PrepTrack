/** Pace math — countdowns, required pace, status, Today's Focus.
 * Single interface: calculateSubjectPace, getOrderedSubjectPaces, getTodaysFocus.
 * Pure functions over a Profile + Subject. Scoped to profile.examSyllabus only.
 * 1:1 port of the original planner: In Progress counts 0.5, Done counts 1.0. */

import { getStageKeys, getStageLabel, type StageKey } from "./stages";
import { scopedChapterId, type Subject } from "./chapters";
import { todayString, type Profile } from "./storage";

export type StatusColor = "grey" | "red" | "amber" | "green" | "blue";

export interface InSyllabusChapter {
  id: string;
  no: number;
  name: string;
  groupId: string;
  groupName: string | null;
  scopedId: string;
}

export interface SubjectPace {
  subjectId: string;
  subjectName: string;
  examDate: string | null;
  bookChapterCount: number;
  scopedChapterCount: number;
  totalStages: number;
  completedStages: number;
  remainingStages: number;
  completionPercentage: number;
  daysLeft: number | null;
  isPastExam: boolean;
  requiredPace: number;
  statusColor: StatusColor;
  statusLabel: string;
  stageKeys: StageKey[];
  inSyllabusChapters: InSyllabusChapter[];
}

export interface FocusItem extends InSyllabusChapter {
  subjectId: string;
  subjectName: string;
  chapterId: string;
  chapterNo: number;
  chapterName: string;
  stageKey: StageKey;
  stageLabel: string;
  currentState: string;
}

export function calculateSubjectPace(profile: Profile, subject: Subject): SubjectPace {
  const today = new Date(todayString());
  const syllabus = profile.examSyllabus?.[subject.id] ?? [];
  const stageKeys = getStageKeys(profile.grade);

  const allBook: InSyllabusChapter[] = [];
  for (const g of subject.groups) {
    for (const ch of g.chapters) {
      allBook.push({
        id: ch.id,
        no: ch.no,
        name: ch.name,
        groupId: g.id,
        groupName: g.name,
        scopedId: scopedChapterId(subject.id, g.id, ch.id, profile.grade),
      });
    }
  }
  const inSyllabus = allBook.filter((ch) => syllabus.includes(ch.scopedId));

  const scopedChapterCount = inSyllabus.length;
  const totalStages = scopedChapterCount * stageKeys.length;

  let doneCount = 0;
  let progressCount = 0;
  for (const ch of inSyllabus) {
    const prog = profile.progress?.[`${subject.id}.${ch.id}`];
    if (!prog) continue;
    for (const sk of stageKeys) {
      if (prog[sk] === "done") doneCount++;
      else if (prog[sk] === "progress") progressCount++;
    }
  }

  const completedStages = doneCount + 0.5 * progressCount;
  const remainingStages = totalStages - completedStages;
  const completionPercentage =
    totalStages > 0 ? Math.round((completedStages / totalStages) * 100) : 0;

  const examDateStr = profile.datesheet?.[subject.examKey] ?? null;
  let daysLeft: number | null = null;
  let isPastExam = false;
  if (examDateStr) {
    const diff = new Date(examDateStr).getTime() - today.getTime();
    daysLeft = Math.ceil(diff / 86_400_000);
    if (daysLeft < 0) isPastExam = true;
  }

  let requiredPace = 0;
  let statusColor: StatusColor = "grey";
  let statusLabel = "";
  if (totalStages === 0) {
    statusLabel = "No Chapters";
  } else if (remainingStages === 0) {
    statusLabel = "Done";
  } else if (isPastExam) {
    statusColor = "amber";
    statusLabel = "Exam Passed";
  } else if (daysLeft !== null) {
    requiredPace = parseFloat((remainingStages / Math.max(daysLeft, 1)).toFixed(1));
    if (completionPercentage === 0) statusLabel = "Not Started";
    else if (completionPercentage <= 30) {
      statusColor = "red";
      statusLabel = "Pace Up";
    } else if (completionPercentage <= 60) {
      statusColor = "amber";
      statusLabel = "Building Momentum";
    } else if (completionPercentage <= 90) {
      statusColor = "green";
      statusLabel = "On Track";
    } else {
      statusColor = "blue";
      statusLabel = "Exam Ready";
    }
  } else {
    statusLabel = "No Exam Date";
  }

  return {
    subjectId: subject.id,
    subjectName: subject.name,
    examDate: examDateStr,
    bookChapterCount: allBook.length,
    scopedChapterCount,
    totalStages,
    completedStages,
    remainingStages,
    completionPercentage,
    daysLeft,
    isPastExam,
    requiredPace,
    statusColor,
    statusLabel,
    stageKeys,
    inSyllabusChapters: inSyllabus,
  };
}

/** Subject paces ordered nearest-exam-first; past exams sink last. */
export function getOrderedSubjectPaces(profile: Profile, subjects: Subject[]): SubjectPace[] {
  return subjects
    .map((s) => calculateSubjectPace(profile, s))
    .sort((a, b) => {
      if (!a.examDate) return 1;
      if (!b.examDate) return -1;
      if (a.isPastExam && !b.isPastExam) return 1;
      if (!a.isPastExam && b.isPastExam) return -1;
      return (a.daysLeft ?? 9999) - (b.daysLeft ?? 9999);
    });
}

/** First 3 pending stages walking the nearest-exam-first subject order. */
export function getTodaysFocus(profile: Profile, subjects: Subject[]): FocusItem[] {
  const items: FocusItem[] = [];
  const stageKeys = getStageKeys(profile.grade);
  for (const pace of getOrderedSubjectPaces(profile, subjects)) {
    if (pace.remainingStages === 0) continue;
    for (const ch of pace.inSyllabusChapters) {
      const prog = profile.progress?.[`${pace.subjectId}.${ch.id}`];
      for (const sk of stageKeys) {
        const st = prog?.[sk] ?? "none";
        if (st !== "done") {
          items.push({
            ...ch,
            subjectId: pace.subjectId,
            subjectName: pace.subjectName,
            chapterId: ch.id,
            chapterNo: ch.no,
            chapterName: ch.name,
            stageKey: sk,
            stageLabel: getStageLabel(pace.subjectId, sk),
            currentState: st,
          });
          if (items.length === 3) return items;
        }
      }
    }
  }
  return items;
}
