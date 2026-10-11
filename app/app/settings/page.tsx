/** Settings — syllabus editor, datesheet, backup/restore, profiles, danger zone. */
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useTracker, STORAGE_KEY, type AppState } from "../../../lib/storage";
import { isMuted, previewSound, setMuted } from "../../../lib/celebrate";
import { getSubjects } from "../../../lib/chapters";
import { getOrderedSubjectPaces } from "../../../lib/planner";
import {
  Card,
  DateField,
  EmptyNotice,
  GhostButton,
  Modal,
  PrimaryButton,
  inputCls,
} from "../../../components/tracker-ui";
import SyllabusChecklist from "../../../components/syllabus-checklist";

export default function SettingsPage() {
  const store = useTracker();
  const { profile, ready, state } = store;
  const [syllabusOpen, setSyllabusOpen] = useState(false);
  const [draft, setDraft] = useState<Record<string, string[]> | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; name: string } | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [importSummary, setImportSummary] = useState<{
    data: AppState;
    summary: { profiles: number; chapters: number };
  } | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  // Mute + storage size resolve post-mount: localStorage is unavailable
  // during static prerender, and this avoids a hydration mismatch.
  const [muted, setMutedState] = useState(false);
  const [soundStatus, setSoundStatus] = useState<string | null>(null);
  const [storedKb, setStoredKb] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMutedState(isMuted());
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      setStoredKb(raw ? `${(raw.length / 1024).toFixed(1)} KB` : "0 KB");
    } catch {
      setStoredKb(null);
    }
  }, []);

  if (!ready) return null;
  if (!profile) return <EmptyNotice title="No student yet" copy="Finish onboarding first." />;

  const archived: Record<string, unknown> = profile.archivedProgress ?? {};
  const hasArchive = Boolean(archived.class9_preResourceRemoval || archived.class9_old_edition);

  const openSyllabus = () => {
    setDraft(JSON.parse(JSON.stringify(profile.examSyllabus)));
    setSyllabusOpen(true);
  };

  const onFile = async (f: File | undefined) => {
    if (!f) return;
    const text = await f.text();
    const res = store.validateImport(text);
    if (!res.valid) setImportError(res.error);
    else {
      setImportError(null);
      setImportSummary(res);
    }
  };

  const download = () => {
    const json = store.exportJson();
    const blob = new Blob([json], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `cbse-tracker-${profile.name.replace(/\s+/g, "-").toLowerCase()}-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="display-tight text-[30px] sm:text-[38px]">Settings</h1>
        <p className="mt-1 text-[14px] text-[#999]">Syllabus, dates, devices, profiles.</p>
      </div>

      <Card>
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white text-[22px] font-bold text-black">
            {profile.name.charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0 flex-1">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const v = new FormData(e.currentTarget).get("pname");
                if (typeof v === "string") store.renameProfile(v);
              }}
              className="flex items-center gap-2"
            >
              <input
                name="pname"
                key={profile.name}
                defaultValue={profile.name}
                maxLength={40}
                aria-label="Student name"
                className={`${inputCls} h-11 font-semibold`}
              />
              <button
                type="submit"
                aria-label="Save name"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-black transition-transform active:scale-95"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </button>
            </form>
            <p className="tnum mt-1.5 text-[13px] text-[#999]">
              Class {profile.grade} · {Object.keys(profile.progress ?? {}).length} chapters tracked ·{" "}
              {profile.streak ? `${profile.streak.count}-day streak` : "no streak yet"}
            </p>
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="text-[15px] font-semibold">Progress at a glance</h2>
        <dl className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {(() => {
            const subjects = getSubjects(profile.grade);
            const paces = getOrderedSubjectPaces(profile, subjects);
            const total = paces.reduce((n, p) => n + p.totalStages, 0);
            const done = paces.reduce((n, p) => n + p.completedStages, 0);
            const openTodos = (profile.todos ?? []).filter((t) => !t.done).length;
            const stats: [string, string][] = [
              [`${total > 0 ? Math.round((done / total) * 100) : 0}%`, "complete"],
              [`${Math.round(done)}/${total}`, "stages done"],
              [`${profile.streak?.count ?? 0} day`, "streak"],
              [`${openTodos} open`, "to-dos"],
            ];
            return stats.map(([v, l]) => (
              <div key={l} className="rounded-[12px] bg-[#1c1c1c] px-3 py-2.5 text-center ring-1 ring-white/[0.05]">
                <dt className="order-2 mt-0.5 block text-[11.5px] text-[#888]">{l}</dt>
                <dd className="tnum text-[19px] font-bold tracking-tight">{v}</dd>
              </div>
            ));
          })()}
        </dl>
      </Card>

      {hasArchive && (
        <Card>
          <h2 className="text-[15px] font-semibold">Archived progress</h2>
          <p className="mt-1 text-[13px] text-[#999]">
            Saved during NCERT updates — nothing was deleted, only archived.
          </p>
          {Object.entries(archived).map(([k, v]) => (
            <details key={k} className="mt-2 rounded-[10px] bg-[#101010] p-3 text-[13px] ring-1 ring-white/[0.05]">
              <summary className="cursor-pointer font-medium">{k}</summary>
              <pre className="mt-2 max-h-36 overflow-auto text-[12px] text-[#999]">
                {JSON.stringify(v, null, 2)}
              </pre>
            </details>
          ))}
        </Card>
      )}

      <Card>
        <h2 className="text-[15px] font-semibold">Exam syllabus</h2>
        <p className="mt-1 text-[13px] text-[#999]">
          Only checked chapters count toward pace, focus, and insights.
        </p>
        <div className="mt-3">
          <PrimaryButton small onClick={openSyllabus}>
            Edit syllabus checklist
          </PrimaryButton>
        </div>
      </Card>

      <Card>
        <h2 className="text-[15px] font-semibold">Exam datesheet — Class {profile.grade}</h2>
        <form
          className="mt-3 space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            store.updateDatesheet({
              science: String(fd.get("science") ?? ""),
              maths: String(fd.get("maths") ?? ""),
              sst: String(fd.get("sst") ?? ""),
            });
          }}
        >
          {(["science", "maths", "sst"] as const).map((k) => (
            <DateField
              key={k}
              name={k}
              label={`${k === "maths" ? "Mathematics" : k === "sst" ? "Social Science" : "Science"} exam date`}
              defaultValue={profile.datesheet[k]}
              required
            />
          ))}
          <PrimaryButton small type="submit">
            Save datesheet
          </PrimaryButton>
        </form>
      </Card>

      <Card>
        <h2 className="text-[15px] font-semibold">Device transfer &amp; diagnostics</h2>
        <p className="mt-1 text-[13px] text-[#999]">
          Move devices with a file, or copy diagnostics when asking for help.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <PrimaryButton small onClick={download}>
            Save progress to a file
          </PrimaryButton>
          <GhostButton small onClick={() => fileRef.current?.click()}>
            Load from a file
          </GhostButton>
          <GhostButton
            small
            onClick={() => {
              navigator.clipboard.writeText(store.diagnostics()).catch(() => {});
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
          >
            {copied ? "Copied" : "Copy diagnostics"}
          </GhostButton>
          <input
            ref={fileRef}
            type="file"
            accept=".json,application/json"
            className="hidden"
            onChange={(e) => onFile(e.target.files?.[0])}
          />
        </div>
        {importError && <p className="mt-3 text-[13px] font-medium text-[#f87171]">{importError}</p>}
      </Card>

      <Card>
        <h2 className="text-[15px] font-semibold">Celebration sounds</h2>
        <p className="mt-1 text-[13px] text-[#999]">
          A chime when a stage hits done, fanfare plus confetti on weekly goals.
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <div role="radiogroup" aria-label="Celebration sounds" className="flex rounded-full bg-[#1c1c1c] p-1 ring-1 ring-white/10">
            {[
              { v: false, label: "On" },
              { v: true, label: "Off" },
            ].map((o) => {
              const active = muted === o.v;
              return (
                <button
                  key={o.label}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => {
                    setMuted(o.v);
                    setMutedState(o.v);
                    setSoundStatus(null);
                  }}
                  className={`min-h-[40px] rounded-full px-5 text-[13px] font-medium transition-all ${
                    active ? "bg-white text-black" : "text-[#999] hover:text-white"
                  }`}
                >
                  {o.label}
                </button>
              );
            })}
          </div>
          <GhostButton
            small
            onClick={async () => {
              if (muted) {
                setSoundStatus("Sounds are off — switch On first, then test.");
                return;
              }
              setSoundStatus("Playing…");
              const ok = await previewSound();
              setSoundStatus(ok ? "Played ✓ — hear that?" : "Blocked — tap again or check silent mode");
            }}
          >
            Test sound
          </GhostButton>
        </div>
        {soundStatus && (
          <p className="mt-2 text-[13px] text-[#999]" role="status">
            {soundStatus}
          </p>
        )}
      </Card>

      <Card>
        <h2 className="text-[15px] font-semibold">Profiles</h2>
        <ul className="mt-2 divide-y divide-white/[0.06]">
          {state.profiles.map((p) => (
            <li key={p.id} className="flex min-h-[56px] flex-wrap items-center justify-between gap-x-2 gap-y-2 py-2">
              <p className="min-w-0 flex-1 text-[14px] break-words">
                <strong>{p.name}</strong> <span className="text-[#999]">· Class {p.grade}</span>
                {p.id === profile.id && <span className="ml-2 text-[12px] text-[#0099ff]">Active</span>}
              </p>
              <div className="flex shrink-0 gap-2">
                {p.id !== profile.id && (
                  <GhostButton small onClick={() => store.setActive(p.id)}>
                    Switch
                  </GhostButton>
                )}
                <GhostButton small danger onClick={() => setConfirmDelete({ id: p.id, name: p.name })}>
                  Delete
                </GhostButton>
              </div>
            </li>
          ))}
        </ul>
      </Card>

      <Card>
        <h2 className="text-[15px] font-semibold">App &amp; data</h2>
        <dl className="mt-2 space-y-1.5 text-[13.5px]">
          <div className="flex justify-between gap-3">
            <dt className="text-[#888]">Version</dt>
            <dd className="font-mono">v0.1.0 · offline-first PWA</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-[#888]">On-device storage</dt>
            <dd className="tnum font-mono">{storedKb ?? "…"}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-[#888]">Last backup</dt>
            <dd className="tnum font-mono">
              {state.lastBackupAt
                ? new Date(state.lastBackupAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })
                : "never"}
            </dd>
          </div>
        </dl>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link href="/privacy" className="inline-flex h-10 items-center rounded-full bg-[#1c1c1c] px-4 text-[13px] font-medium ring-1 ring-white/10 hover:bg-[#262626]">
            Privacy Policy
          </Link>
          <Link href="/terms" className="inline-flex h-10 items-center rounded-full bg-[#1c1c1c] px-4 text-[13px] font-medium ring-1 ring-white/10 hover:bg-[#262626]">
            Terms
          </Link>
        </div>
      </Card>

      <Card>
        <h2 className="text-[15px] font-semibold text-[#f87171]">Danger zone</h2>
        <p className="mt-1 text-[13px] text-[#999]">Clears every profile and all progress on this device.</p>
        <div className="mt-3">
          <GhostButton small danger onClick={() => setConfirmReset(true)}>
            Reset all app data
          </GhostButton>
        </div>
      </Card>

      {syllabusOpen && draft && (
        <Modal title="Exam syllabus" wide onClose={() => setSyllabusOpen(false)}>
          <p className="mb-3 text-[13px] text-[#999]">
            Uncheck chapters NOT in this exam — pace stays honest.
          </p>
          <SyllabusChecklist grade={profile.grade} value={draft} onChange={setDraft} />
          <div className="mt-4 flex justify-end gap-2">
            <GhostButton small onClick={() => setSyllabusOpen(false)}>
              Cancel
            </GhostButton>
            <PrimaryButton
              small
              onClick={() => {
                store.updateSyllabus(draft);
                setSyllabusOpen(false);
              }}
            >
              Save syllabus
            </PrimaryButton>
          </div>
        </Modal>
      )}

      {confirmDelete && (
        <Modal title="Delete profile" onClose={() => setConfirmDelete(null)}>
          <p className="text-[14px] text-[#999]">
            Delete <strong className="text-white">{confirmDelete.name}</strong> and all of their
            progress? This can&apos;t be undone — export a backup first if unsure.
          </p>
          <div className="mt-4 flex justify-end gap-2">
            <GhostButton small onClick={() => setConfirmDelete(null)}>
              Keep
            </GhostButton>
            <GhostButton
              small
              danger
              onClick={() => {
                store.deleteProfile(confirmDelete.id);
                setConfirmDelete(null);
              }}
            >
              Delete
            </GhostButton>
          </div>
        </Modal>
      )}

      {confirmReset && (
        <Modal title="Reset everything" onClose={() => setConfirmReset(false)}>
          <p className="text-[14px] text-[#999]">
            Clear all local data and return to onboarding? Export a backup first if you want to keep
            anything.
          </p>
          <div className="mt-4 flex justify-end gap-2">
            <GhostButton small onClick={() => setConfirmReset(false)}>
              Cancel
            </GhostButton>
            <GhostButton
              small
              danger
              onClick={() => {
                store.resetAll();
                setConfirmReset(false);
              }}
            >
              Reset all
            </GhostButton>
          </div>
        </Modal>
      )}

      {importSummary && (
        <Modal title="Restore backup" onClose={() => setImportSummary(null)}>
          <p className="text-[14px] text-[#999]">
            Found <strong className="text-white">{importSummary.summary.profiles} profiles</strong>{" "}
            with <strong className="text-white">{importSummary.summary.chapters} tracked chapters</strong>.
            Name clashes are imported as copies — nothing is overwritten.
          </p>
          <div className="mt-4 flex justify-end gap-2">
            <GhostButton small onClick={() => setImportSummary(null)}>
              Cancel
            </GhostButton>
            <PrimaryButton
              small
              onClick={() => {
                store.applyImport(importSummary.data);
                setImportSummary(null);
              }}
            >
              Restore
            </PrimaryButton>
          </div>
        </Modal>
      )}
    </div>
  );
}
