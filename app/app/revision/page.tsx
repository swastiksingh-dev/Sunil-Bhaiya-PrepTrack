/** Revision queue — done stages gone stale, oldest first.
 * "Mark revised" refreshes the timestamp without changing state. */
"use client";

import { useTracker } from "../../../lib/storage";
import { getSubjects } from "../../../lib/chapters";
import { getStageKeys, getStageLabel } from "../../../lib/stages";
import { CountUp, Reveal } from "../../../lib/motion";
import { Card, EmptyNotice, GhostButton } from "../../../components/tracker-ui";

interface StaleItem {
  subjectId: string;
  subjectName: string;
  groupName: string | null;
  chNo: number;
  chName: string;
  chId: string;
  stageKey: string;
  stageLabel: string;
  daysAgo: number;
}

export default function RevisionPage() {
  const store = useTracker();
  const { profile, ready } = store;
  if (!ready) return null;
  if (!profile) return <EmptyNotice title="No data yet" copy="Finish onboarding first." />;

  const now = Date.now();
  const items: StaleItem[] = [];
  for (const s of getSubjects(profile.grade)) {
    for (const g of s.groups) {
      for (const ch of g.chapters) {
        const prog = profile.progress[`${s.id}.${ch.id}`];
        if (!prog) continue;
        for (const sk of getStageKeys(profile.grade)) {
          if (prog[sk] !== "done" || !prog.updatedAt) continue;
          const daysAgo = Math.max(
            0,
            Math.floor((now - new Date(prog.updatedAt).getTime()) / 86_400_000),
          );
          items.push({
            subjectId: s.id,
            subjectName: s.name,
            groupName: g.name,
            chNo: ch.no,
            chName: ch.name,
            chId: ch.id,
            stageKey: sk,
            stageLabel: getStageLabel(s.id, sk),
            daysAgo,
          });
        }
      }
    }
  }
  items.sort((a, b) => b.daysAgo - a.daysAgo);
  const queue = items.slice(0, 12);
  const stalest = queue[0]?.daysAgo ?? 0;

  return (
    <div className="space-y-4">
      <Reveal>
        <div>
          <h1 className="display-tight text-[30px] sm:text-[38px]">Revision queue</h1>
          <p className="mt-1 text-[14px] text-[#999]">
            Finished stages go stale. {queue.length > 0 ? (
              <>Oldest untouched for <strong className="text-white"><CountUp to={stalest} suffix="" /> days</strong> — start there.</>
            ) : (
              "Mark stages done and they'll resurface here when they age."
            )}
          </p>
        </div>
      </Reveal>

      {queue.length === 0 ? (
        <EmptyNotice
          title="Nothing to revise yet"
          copy="Complete some stages first. Anything marked done will appear here once it starts ageing."
        />
      ) : (
        <Card>
          <ul className="space-y-2.5">
            {queue.map((it, i) => (
              <Reveal key={`${it.subjectId}.${it.chId}.${it.stageKey}`} delay={Math.min(i * 0.04, 0.3)} y={14}>
                <li className="flex min-h-[60px] items-center justify-between gap-3 rounded-[12px] bg-[#1c1c1c] px-3.5 py-2.5 ring-1 ring-white/[0.05]">
                  <div className="min-w-0">
                    <p className="text-[12px] font-medium text-[#0099ff]">
                      {it.subjectName}
                      {it.groupName ? ` · ${it.groupName}` : ""} ·{" "}
                      <span className={it.daysAgo >= 14 ? "font-bold text-[#fbbf24]" : ""}>
                        {it.daysAgo === 0 ? "revised today" : `${it.daysAgo}d ago`}
                      </span>
                    </p>
                    <p className="truncate text-[14px] font-medium">
                      Ch {it.chNo}: {it.chName}
                    </p>
                    <p className="truncate text-[13px] text-[#999]">{it.stageLabel}</p>
                  </div>
                  <GhostButton small onClick={() => store.touchStage(it.subjectId, it.chId, it.stageKey as never)}>
                    Revised ✓
                  </GhostButton>
                </li>
              </Reveal>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
