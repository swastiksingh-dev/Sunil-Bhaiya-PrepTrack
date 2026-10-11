/** Syllabus checklist — shared by onboarding and settings.
 * One interface: <SyllabusChecklist grade value onChange/>. */
"use client";

import { useState } from "react";
import { getSubjects, scopedChapterId } from "../lib/chapters";

export default function SyllabusChecklist({
  grade,
  value,
  onChange,
}: {
  grade: number;
  value: Record<string, string[]>;
  onChange: (next: Record<string, string[]>) => void;
}) {
  const subjects = getSubjects(grade);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const toggle = (subjectId: string, scopedId: string) => {
    const cur = value[subjectId] ?? [];
    const next = cur.includes(scopedId)
      ? cur.filter((id) => id !== scopedId)
      : [...cur, scopedId];
    onChange({ ...value, [subjectId]: next });
  };

  return (
    <div className="space-y-3">
      {subjects.map((s) => {
        const ids = value[s.id] ?? [];
        const total = s.groups.reduce((n, g) => n + g.chapters.length, 0);
        const isCollapsed = collapsed[s.id];
        return (
          <div key={s.id} className="overflow-hidden rounded-[12px] bg-[#1c1c1c] ring-1 ring-white/[0.06]">
            <button
              type="button"
              onClick={() => setCollapsed((c) => ({ ...c, [s.id]: !c[s.id] }))}
              aria-expanded={!isCollapsed}
              className="flex min-h-[52px] w-full items-center justify-between px-4"
            >
              <span className="text-[15px] font-semibold">{s.name}</span>
              <span className="text-[13px] text-[#999]">
                {ids.length}/{total} {isCollapsed ? "▸" : "▾"}
              </span>
            </button>
            {!isCollapsed && (
              <div className="border-t border-white/[0.06] px-2 py-1">
                {s.groups.map((g) => (
                  <div key={g.id}>
                    {g.name && (
                      <p className="px-2 pt-2 text-[11px] font-semibold tracking-[0.08em] text-[#0099ff] uppercase">
                        {g.name}
                      </p>
                    )}
                    {g.chapters.map((ch) => {
                      const sid = scopedChapterId(s.id, g.id, ch.id, grade);
                      const checked = ids.includes(sid);
                      return (
                        <label
                          key={ch.id}
                          className="flex min-h-[48px] cursor-pointer items-center gap-3 border-b border-white/[0.05] px-2 last:border-0"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggle(s.id, sid)}
                            className="h-[22px] w-[22px] shrink-0 accent-white"
                          />
                          <span className="text-[14px]">
                            Ch {ch.no}: {ch.name}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
