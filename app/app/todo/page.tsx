/** To-do list — student-created tasks per profile. Add, check off
 * (with a chime), filter, delete, clear completed. */
"use client";

import { useState } from "react";
import Link from "next/link";
import { useTracker } from "../../../lib/storage";
import { getSubjects } from "../../../lib/chapters";
import { celebrate } from "../../../lib/celebrate";
import { Card, EmptyNotice, Pill, PrimaryButton } from "../../../components/tracker-ui";
import { Reveal } from "../../../lib/motion";

type Filter = "open" | "done" | "all";

export default function TodoPage() {
  const store = useTracker();
  const { profile, ready } = store;
  const [text, setText] = useState("");
  const [subjectId, setSubjectId] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("open");

  if (!ready) return null;
  if (!profile) return <EmptyNotice title="No student yet" copy="Finish onboarding first." />;

  const subjects = getSubjects(profile.grade);
  const todos = profile.todos ?? [];
  const open = todos.filter((t) => !t.done);
  const done = todos.filter((t) => t.done);
  const shown = filter === "open" ? open : filter === "done" ? done : todos;
  const subName = (id: string | null) => subjects.find((s) => s.id === id)?.name ?? null;

  const toggle = (id: string, toDone: boolean) => {
    store.toggleTodo(id);
    if (toDone) celebrate("stage");
  };

  return (
    <div className="mx-auto w-full max-w-2xl space-y-4">
      <Reveal>
        <div>
          <h1 className="display-tight text-[30px] sm:text-[38px]">To-do list</h1>
          <p className="mt-1 text-[14px] text-[#999]">
            {open.length === 0
              ? "All clear. Add what matters for today."
              : `${open.length} open · ${done.length} done`}
          </p>
        </div>
      </Reveal>

      <Reveal>
        <Card>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              store.addTodo(text, subjectId);
              setText("");
            }}
            className="space-y-3"
          >
            <div className="flex items-center gap-2">
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="e.g. Revise Electricity diagrams"
                maxLength={140}
                aria-label="New task"
                className="h-12 min-w-0 flex-1 rounded-[12px] bg-[#1c1c1c] px-4 text-[15px] text-white ring-1 ring-white/10 outline-none placeholder:text-[#666] focus:ring-[#0099ff]"
              />
              <PrimaryButton type="submit" small>
                Add
              </PrimaryButton>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              <Pill active={subjectId === null} onClick={() => setSubjectId(null)}>
                General
              </Pill>
              {subjects.map((s) => (
                <Pill key={s.id} active={subjectId === s.id} onClick={() => setSubjectId(s.id)}>
                  {s.name}
                </Pill>
              ))}
            </div>
          </form>
        </Card>
      </Reveal>

      {todos.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {(["open", "done", "all"] as Filter[]).map((f) => (
            <Pill key={f} active={filter === f} onClick={() => setFilter(f)}>
              {f === "open" ? `Open (${open.length})` : f === "done" ? `Done (${done.length})` : `All (${todos.length})`}
            </Pill>
          ))}
          {done.length > 0 && (
            <button
              type="button"
              onClick={store.clearDoneTodos}
              className="ml-auto min-h-[40px] px-3 text-[13px] font-medium text-[#777] hover:text-white"
            >
              Clear done
            </button>
          )}
        </div>
      )}

      {shown.length === 0 ? (
        <EmptyNotice
          title={todos.length === 0 ? "A blank slate" : filter === "done" ? "Nothing finished yet" : "Nothing open"}
          copy={
            todos.length === 0
              ? "Small tasks, written down, beat big plans in your head. Add the first one above."
              : filter === "done"
                ? "Check something off and it lands here."
                : "Everything is done. Enjoy it."
          }
        />
      ) : (
        <ul className="space-y-2">
          {shown.map((t, i) => (
            <Reveal key={t.id} delay={Math.min(i * 0.04, 0.24)} y={12}>
              <li className="flex min-h-[60px] items-center gap-3 rounded-[14px] bg-[#141414] px-3.5 py-2.5 ring-1 ring-white/[0.06]">
                <button
                  type="button"
                  onClick={() => toggle(t.id, !t.done)}
                  aria-label={t.done ? `Reopen ${t.text}` : `Complete ${t.text}`}
                  aria-pressed={t.done}
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all active:scale-90 ${
                    t.done ? "bg-[#22c55e]" : "ring-2 ring-white/25 hover:ring-white/50"
                  }`}
                >
                  {t.done && (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#090909" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  )}
                </button>
                <div className="min-w-0 flex-1">
                  <p className={`text-[14.5px] font-medium break-words ${t.done ? "text-[#666] line-through" : ""}`}>
                    {t.text}
                  </p>
                  {subName(t.subjectId) && (
                    <p className="mt-0.5 text-[12.5px] text-[#0099ff]">{subName(t.subjectId)}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => store.deleteTodo(t.id)}
                  aria-label={`Delete ${t.text}`}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[#666] transition-colors hover:bg-white/[0.06] hover:text-white"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M4 7h16M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2m-9 0l1 13h10l1-13" />
                  </svg>
                </button>
              </li>
            </Reveal>
          ))}
        </ul>
      )}

      <Reveal>
        <p className="text-center text-[13px] text-[#666]">
          Tasks live with {profile.name}&apos;s profile —{" "}
          <Link href="/app/settings" className="text-[#0099ff] hover:underline">
            backed up
          </Link>{" "}
          with everything else.
        </p>
      </Reveal>
    </div>
  );
}
