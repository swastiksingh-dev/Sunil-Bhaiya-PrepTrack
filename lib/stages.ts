/** Preparation stage definitions — the vocabulary of the tracker.
 * Single interface: stage keys per grade + subject-aware labels. */

export type StageKey =
  | "theory"
  | "ncert"
  | "exemplar"
  | "pyq"
  | "cbq"
  | "revision";

export type Grade = 9 | 10;
export type StageState = "none" | "progress" | "done";

const STAGE_SETS: Record<Grade, StageKey[]> = {
  9: ["theory", "ncert", "revision"],
  10: ["theory", "ncert", "exemplar", "pyq", "cbq"],
};

const LABELS_BY_SUBJECT: Record<string, Partial<Record<StageKey, string>>> = {
  maths: { theory: "Concepts and Formulae" },
  default: {
    theory: "Theory Read",
    ncert: "NCERT Questions",
    exemplar: "NCERT Exemplar Questions",
    pyq: "Previous Year Questions",
    cbq: "Competency Focused Questions",
    revision: "Revision",
  },
};

/** Stage keys in exact display order for a grade. */
export function getStageKeys(grade: number): StageKey[] {
  return STAGE_SETS[grade as Grade] ?? STAGE_SETS[10];
}

/** Human label. Call as getStageLabel("maths", "theory") or getStageLabel("theory"). */
export function getStageLabel(subjectId: string, stageKey?: string): string {
  let sub = subjectId;
  let key = stageKey;
  if (!key) {
    key = sub;
    sub = "default";
  }
  const subKey = (sub || "default").toLowerCase();
  return (
    LABELS_BY_SUBJECT[subKey]?.[key as StageKey] ??
    LABELS_BY_SUBJECT.default[key as StageKey] ??
    key
  );
}
