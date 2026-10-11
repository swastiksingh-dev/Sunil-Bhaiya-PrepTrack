/** Chapters — subject tabs, pace header, All/Incomplete/Completed filters,
 * expandable rows with stage dots. Out-of-syllabus chapters are guarded. */
"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTracker } from "../../../lib/storage";
import { tapStage } from "../../../lib/celebrate";
import { getSubjects, scopedChapterId } from "../../../lib/chapters";
import { getStageKeys, getStageLabel } from "../../../lib/stages";
import { calculateSubjectPace } from "../../../lib/planner";
import { Card, Dot, EmptyNotice, Modal, Pill, StageDot } from "../../../components/tracker-ui";

type Filter = "all" | "incomplete" | "completed";

function ChaptersInner() {
  const store = useTracker();
  const params = useSearchParams();
  const { profile, ready } = store;
  const [filter, setFilter] = useState<Filter>("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const [guardMsg, setGuardMsg] = useState(false);

  const subjects = useMemo(() => (profile ? getSubjects(profile.grade) : []), [profile]);
  const [tab, setTab] = useState<string | null>(null);
  const activeId = tab ?? params.get("subject") ?? subjects[0]?.id ?? "";
  const subject = subjects.find((s) => s.id === activeId) ?? subjects[0];

  if (!ready) return null;
  if (!profile || !subject) return <EmptyNotice title="Nothing here yet" copy="Finish onboarding first." />;

  const pace = calculateSubjectPace(profile, subject);
  const stageKeys = getStageKeys(profile.grade);
  const syllabus = profile.examSyllabus?.[subject.id] ?? [];

  const paceLine =
    pace.totalStages === 0 ? (
      <>No chapters selected for this exam. Edit syllabus in Settings.</>
    ) : pace.remainingStages === 0 ? (
      <>All 100% completed for this exam.</>
    ) : pace.isPastExam ? (
      <>Exam date passed. Update datesheet in Settings.</>
    ) : pace.daysLeft !== null ? (
      <>
        <strong className="text-white">{pace.daysLeft} days left</strong> · {pace.remainingStages}{" "}
        stages pending · pace <strong className="text-white">{pace.requiredPace}/day</strong>
      </>
    ) : (
      "No exam date set."
    );

  return (
    <div className="space-y-4">
      <div className="flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Subjects">
        {subjects.map((s) => (
          <span key={s.id} role="tab" aria-selected={s.id === subject.id}>
            <Pill active={s.id === subject.id} onClick={() => { setTab(s.id); setOpenId(null); }}>
              {s.name}
            </Pill>
          </span>
        ))}
      </div>

      <Card>
        <h1 className="text-[19px] font-semibold tracking-tight">{subject.name} chapters</h1>
        <p className="mt-1 text-[14px] text-[#999]">{paceLine}</p>
      </Card>

      <div className="flex gap-2">
        {(["all", "incomplete", "completed"] as Filter[]).map((f) => (
          <Pill key={f} active={filter === f} onClick={() => setFilter(f)}>
            {f === "all" ? "All chapters" : f === "incomplete" ? "Incomplete" : "Completed"}
          </Pill>
        ))}
      </div>

      {filter === "all" ? (
        <div className="space-y-4">
          {subject.groups.map((g) => (
            <div key={g.id}>
                {g.name && (
                  <p className="mb-2 text-[12px] font-semibold tracking-[0.08em] text-[#0099ff] uppercase">
                    {g.name}
                  </p>
                )}
                <div className="space-y-2">
                  {g.chapters.map((ch) => {
                    const inExam = syllabus.includes(
                      scopedChapterId(subject.id, g.id, ch.id, profile.grade),
                    );
                    const prog = profile.progress[`${subject.id}.${ch.id}`] ?? {};
                    const isOpen = openId === ch.id;
                    return (
                      <div
                        key={ch.id}
                        className={`overflow-hidden rounded-[15px] ring-1 ring-white/[0.06] ${
                          inExam ? "bg-[#141414]" : "bg-[#101010] opacity-60"
                        }`}
                      >
                        <div className="flex min-h-[56px] items-center justify-between gap-2 px-3.5">
                          <button
                            type="button"
                            onClick={() => setOpenId(isOpen ? null : ch.id)}
                            aria-expanded={isOpen}
                            className="flex min-h-[48px] flex-1 items-center gap-2 text-left"
                          >
                            <span className="text-[#666]">{isOpen ? "▾" : "▸"}</span>
                            <span className="text-[14.5px] font-medium">
                              Ch {ch.no}: {ch.name}
                              {!inExam && (
                                <span className="ml-2 rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-medium text-[#999]">
                                  Not in this exam
                                </span>
                              )}
                            </span>
                          </button>
                          <div className="flex items-center gap-1.5">
                            {stageKeys.map((sk) => (
                              <StageDot
                                key={sk}
                                size={24}
                                state={prog[sk] ?? "none"}
                                disabled={!inExam}
                                label={getStageLabel(subject.id, sk)}
                                onTap={() =>
                                  inExam
                                    ? tapStage(store, subject.id, ch.id, sk)
                                    : setGuardMsg(true)
                                }
                              />
                            ))}
                          </div>
                        </div>
                        {isOpen && (
                          <div className="space-y-2 border-t border-white/[0.06] bg-[#101010] p-3.5">
                            {stageKeys.map((sk) => (
                              <button
                                key={sk}
                                type="button"
                                onClick={() =>
                                  inExam
                                    ? tapStage(store, subject.id, ch.id, sk)
                                    : setGuardMsg(true)
                                }
                                className={`flex min-h-[52px] w-full items-center justify-between rounded-[10px] px-3.5 ring-1 ring-white/[0.05] transition-colors ${
                                  inExam ? "bg-[#1c1c1c] hover:bg-[#222]" : "cursor-pointer bg-[#1c1c1c] opacity-60"
                                }`}
                              >
                                <span className="text-[14px] font-medium">
                                  {getStageLabel(subject.id, sk)}
                                </span>
                                <Dot
                                  size={26}
                                  state={prog[sk] ?? "none"}
                                />
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
        </div>
      ) : (
        <FlatList
          subjectId={subject.id}
          groupLabel={(gId) => subject.groups.find((g) => g.id === gId)?.name ?? null}
          filter={filter}
        />
      )}

      {guardMsg && (
        <Modal title="Chapter out of syllabus" onClose={() => setGuardMsg(false)}>
          <p className="text-[14px] leading-relaxed text-[#999]">
            This chapter isn&apos;t in your current exam syllabus, so its stages are locked. Edit
            the checklist in Settings → Exam Syllabus to include it.
          </p>
        </Modal>
      )}
    </div>
  );
}

function FlatList({
  subjectId,
  groupLabel,
  filter,
}: {
  subjectId: string;
  groupLabel: (gId: string) => string | null;
  filter: Filter;
}) {
  const store = useTracker();
  const { profile } = store;
  if (!profile) return null;
  const subjects = getSubjects(profile.grade);
  const subject = subjects.find((s) => s.id === subjectId)!;
  const stageKeys = getStageKeys(profile.grade);
  const syllabus = profile.examSyllabus?.[subjectId] ?? [];

  const rows: { group: string | null; chNo: number; chName: string; chId: string; sk: string; st: string }[] = [];
  for (const g of subject.groups) {
    for (const ch of g.chapters) {
      if (!syllabus.includes(scopedChapterId(subjectId, g.id, ch.id, profile.grade))) continue;
      const prog = profile.progress[`${subjectId}.${ch.id}`] ?? {};
      for (const sk of stageKeys) {
        const st = (prog[sk] as string) ?? "none";
        if ((filter === "completed" && st === "done") || (filter === "incomplete" && st !== "done")) {
          rows.push({ group: g.name, chNo: ch.no, chName: ch.name, chId: ch.id, sk, st });
        }
      }
    }
  }

  if (rows.length === 0)
    return (
      <EmptyNotice
        title={filter === "completed" ? "Nothing completed yet" : "All done here"}
        copy={filter === "completed" ? "Mark a stage to see it listed here." : "Every stage in this subject is complete."}
      />
    );

  return (
    <div className="space-y-2">
      {rows.map((r) => (
        <div
          key={`${r.chId}.${r.sk}`}
          className="flex min-h-[56px] items-center justify-between gap-3 rounded-[12px] bg-[#141414] px-3.5 py-2.5 ring-1 ring-white/[0.06]"
        >
          <p className="min-w-0 text-[14px]">
            <span className="font-medium">
              {r.group ? `${r.group} · ` : ""}Ch {r.chNo}: {r.chName}
            </span>{" "}
            <span className="text-[#666]">→</span>{" "}
            <span className="font-semibold text-[#0099ff]">{getStageLabel(subjectId, r.sk)}</span>
          </p>
          <StageDot
            state={r.st}
            label={getStageLabel(subjectId, r.sk)}
            onTap={() => tapStage(store, subjectId, r.chId, r.sk as never)}
          />
        </div>
      ))}
    </div>
  );
}

export default function ChaptersPage() {
  return (
    <Suspense>
      <ChaptersInner />
    </Suspense>
  );
}
