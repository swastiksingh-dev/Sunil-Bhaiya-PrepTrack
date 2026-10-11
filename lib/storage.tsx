/** Persistence — profiles in localStorage (`cbse_tracker_v1`) + one React hook.
 * Single interface for UI: useTrackerStore. Everything else is internal.
 * 1:1 port of the original storage module, including Class 9 migrations. */
"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { getStageKeys, type StageKey, type StageState } from "./stages";
import { getSubjects, scopedChapterId } from "./chapters";

export const STORAGE_KEY = "cbse_tracker_v1";

export interface Datesheet {
  science: string;
  maths: string;
  sst: string;
}

export type ChapterProgress = Record<string, StageState | string | undefined> & {
  updatedAt?: string;
};

export interface Streak {
  count: number;
  lastActive: string;
}

export interface Todo {
  id: string;
  text: string;
  subjectId: string | null;
  done: boolean;
  createdAt: string;
}

export interface Profile {
  id: string;
  name: string;
  grade: number;
  datesheet: Datesheet;
  examSyllabus: Record<string, string[]>;
  progress: Record<string, ChapterProgress>;
  streak: Streak;
  todos?: Todo[];
  weeklyGoal?: number;
  needsSyllabusConfirmation?: boolean;
  v5NoticeNeeded?: boolean;
  v6PreResourceNoticeNeeded?: boolean;
  v5Class9EditionMigrated?: boolean;
  v6Class9StagesMigrated?: boolean;
  archivedProgress?: Record<string, unknown>;
}

export interface AppState {
  schemaVersion: number;
  activeProfileId: string | null;
  lastBackupAt: string | null;
  profiles: Profile[];
}

export function todayString(): string {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

function defaultSyllabus(grade: number): Record<string, string[]> {
  const syllabus: Record<string, string[]> = {};
  for (const sub of getSubjects(grade)) {
    const ids: string[] = [];
    for (const g of sub.groups)
      for (const ch of g.chapters) ids.push(scopedChapterId(sub.id, g.id, ch.id, grade));
    syllabus[sub.id] = ids;
  }
  return syllabus;
}

function emptyState(): AppState {
  return { schemaVersion: 1, activeProfileId: null, lastBackupAt: null, profiles: [] };
}

/* ---------- migrations (archived, never deleted) ---------- */

function migrateV5(p: Profile) {
  if (p.progress && Object.keys(p.progress).length > 0) {
    p.archivedProgress = { ...(p.archivedProgress ?? {}), class9_old_edition: { ...p.progress } };
    p.progress = {};
    p.v5NoticeNeeded = true;
  }
  p.examSyllabus = defaultSyllabus(9);
  p.v5Class9EditionMigrated = true;
}

function migrateV6(p: Profile) {
  if (p.progress) {
    const archived: Record<string, unknown> = {};
    let has = false;
    for (const [key, obj] of Object.entries(p.progress)) {
      if (!obj) continue;
      const { exemplar, cbq, pyq, ...rest } = obj as Record<string, string | undefined>;
      if ([exemplar, cbq, pyq].some((v) => v && v !== "none")) {
        archived[key] = { exemplar: exemplar ?? "none", cbq: cbq ?? "none", pyq: pyq ?? "none" };
        has = true;
      }
      const keep: ChapterProgress = { updatedAt: (obj as ChapterProgress).updatedAt };
      for (const sk of ["theory", "ncert", "revision"] as const)
        keep[sk] = ((obj as Record<string, string>)[sk] as StageState) ?? "none";
      p.progress[key] = keep;
      void rest;
    }
    if (has) {
      p.archivedProgress = { ...(p.archivedProgress ?? {}), class9_preResourceRemoval: archived };
      p.v6PreResourceNoticeNeeded = true;
    }
  }
  p.v6Class9StagesMigrated = true;
}

function migrateProfile(p: Profile): Profile {
  if (!p.examSyllabus) {
    p.examSyllabus = defaultSyllabus(p.grade || 10);
    p.needsSyllabusConfirmation = true;
  }
  if (p.grade === 9 && !p.v5Class9EditionMigrated) migrateV5(p);
  if (p.grade === 9 && !p.v6Class9StagesMigrated) migrateV6(p);
  return p;
}

/* ---------- low-level load/save (storage-block hardened) ---------- */

let blocked = false;
export function isStorageBlocked() {
  return blocked;
}

function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState();
    const data = JSON.parse(raw) as AppState;
    if (!Array.isArray(data.profiles)) data.profiles = [];
    data.profiles.forEach(migrateProfile);
    return data;
  } catch {
    blocked = true;
    return emptyState();
  }
}

function persist(state: AppState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    blocked = true;
  }
}

function touchStreak(p: Profile) {
  const today = todayString();
  if (!p.streak) {
    p.streak = { count: 1, lastActive: today };
    return;
  }
  if (p.streak.lastActive === today) return;
  const y = new Date();
  y.setDate(y.getDate() - 1);
  const yStr = `${y.getFullYear()}-${String(y.getMonth() + 1).padStart(2, "0")}-${String(y.getDate()).padStart(2, "0")}`;
  p.streak.count = p.streak.lastActive === yStr ? p.streak.count + 1 : 1;
  p.streak.lastActive = today;
}

const nid = () => `prof_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

/* ---------- store ---------- */

export interface Draft {
  name: string;
  grade: number;
  datesheet: Datesheet;
  examSyllabus: Record<string, string[]> | null;
}

export interface Store {
  ready: boolean;
  blocked: boolean;
  state: AppState;
  profile: Profile | null;
  createProfile: (d: Draft) => Profile;
  setActive: (id: string) => void;
  deleteProfile: (id: string) => void;
  updateDatesheet: (datesheet: Datesheet) => void;
  renameProfile: (name: string) => void;
  updateSyllabus: (syllabus: Record<string, string[]>) => void;
  cycleStage: (subjectId: string, chapterId: string, stageKey: StageKey) => void;
  touchStage: (subjectId: string, chapterId: string, stageKey: StageKey) => void;
  setWeeklyGoal: (n: number) => void;
  addTodo: (text: string, subjectId: string | null) => void;
  toggleTodo: (id: string) => void;
  deleteTodo: (id: string) => void;
  clearDoneTodos: () => void;
  backfill: (subjectId: string, chapterIds: string[], done: boolean) => void;
  dismissNotice: (key: "v5NoticeNeeded" | "v6PreResourceNoticeNeeded" | "needsSyllabusConfirmation") => void;
  shouldNudgeBackup: () => boolean;
  exportJson: () => string;
  validateImport: (json: string) =>
    | { valid: true; data: AppState; summary: { profiles: number; chapters: number } }
    | { valid: false; error: string };
  applyImport: (data: AppState) => void;
  resetAll: () => void;
  diagnostics: () => string;
}

const TrackerCtx = createContext<Store | null>(null);

export function TrackerProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(emptyState);
  const [ready, setReady] = useState(false);
  const [blockedFlag, setBlockedFlag] = useState(false);

  useEffect(() => {
    setState(loadState());
    setBlockedFlag(blocked);
    setReady(true);
  }, []);

  const commit = useCallback((next: AppState) => {
    persist(next);
    setBlockedFlag(blocked);
    setState({ ...next });
  }, []);

  const profile = useMemo(
    () => state.profiles.find((p) => p.id === state.activeProfileId) ?? state.profiles[0] ?? null,
    [state],
  );

  const store: Store = useMemo(
    () => ({
      ready,
      blocked: blockedFlag,
      state,
      profile,

      createProfile: (d) => {
        const next = { ...state, profiles: [...state.profiles] };
        const p: Profile = {
          id: nid(),
          name: d.name || "Student",
          grade: Number(d.grade) || 10,
          datesheet: d.datesheet,
          examSyllabus: d.examSyllabus ?? defaultSyllabus(d.grade),
          progress: {},
          streak: { count: 1, lastActive: todayString() },
        };
        next.profiles.push(p);
        next.activeProfileId = p.id;
        commit(next);
        return p;
      },

      setActive: (id) => {
        if (!state.profiles.some((p) => p.id === id)) return;
        commit({ ...state, activeProfileId: id });
      },

      deleteProfile: (id) => {
        const profiles = state.profiles.filter((p) => p.id !== id);
        commit({
          ...state,
          profiles,
          activeProfileId:
            state.activeProfileId === id ? (profiles[0]?.id ?? null) : state.activeProfileId,
        });
      },

      updateDatesheet: (datesheet) => {
        if (!profile) return;
        const profiles = state.profiles.map((p) =>
          p.id === profile.id ? { ...p, datesheet } : p,
        );
        commit({ ...state, profiles });
      },

      renameProfile: (name) => {
        if (!profile) return;
        const clean = name.trim().slice(0, 40) || profile.name;
        const profiles = state.profiles.map((p) =>
          p.id === profile.id ? { ...p, name: clean } : p,
        );
        commit({ ...state, profiles });
      },

      updateSyllabus: (syllabus) => {
        if (!profile) return;
        const profiles = state.profiles.map((p) =>
          p.id === profile.id
            ? { ...p, examSyllabus: syllabus, needsSyllabusConfirmation: undefined }
            : p,
        );
        commit({ ...state, profiles });
      },

      cycleStage: (subjectId, chapterId, stageKey) => {
        if (!profile) return;
        const key = `${subjectId}.${chapterId}`;
        const keys = getStageKeys(profile.grade);
        const cur: ChapterProgress = { ...(profile.progress[key] ?? {}) };
        for (const sk of keys) if (!(sk in cur)) cur[sk] = "none";
        const c = (cur[stageKey] as StageState) ?? "none";
        cur[stageKey] = c === "none" ? "progress" : c === "progress" ? "done" : "none";
        cur.updatedAt = new Date().toISOString();
        const updated: Profile = {
          ...profile,
          progress: { ...profile.progress, [key]: cur },
        };
        touchStreak(updated);
        commit({
          ...state,
          profiles: state.profiles.map((p) => (p.id === profile.id ? updated : p)),
        });
      },

      touchStage: (subjectId, chapterId, stageKey) => {
        if (!profile) return;
        const key = `${subjectId}.${chapterId}`;
        const cur: ChapterProgress = { ...(profile.progress[key] ?? {}) };
        if (!(stageKey in cur)) return;
        cur.updatedAt = new Date().toISOString();
        const updated: Profile = {
          ...profile,
          progress: { ...profile.progress, [key]: cur },
        };
        touchStreak(updated);
        commit({
          ...state,
          profiles: state.profiles.map((p) => (p.id === profile.id ? updated : p)),
        });
      },

      setWeeklyGoal: (n) => {
        if (!profile) return;
        const goal = Math.min(60, Math.max(3, Math.round(n) || 10));
        const updated = { ...profile, weeklyGoal: goal };
        commit({
          ...state,
          profiles: state.profiles.map((p) => (p.id === profile.id ? updated : p)),
        });
      },

      addTodo: (text, subjectId) => {
        if (!profile) return;
        const clean = text.trim().slice(0, 140);
        if (!clean) return;
        const todo: Todo = {
          id: `todo_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          text: clean,
          subjectId,
          done: false,
          createdAt: new Date().toISOString(),
        };
        const updated = { ...profile, todos: [...(profile.todos ?? []), todo] };
        commit({
          ...state,
          profiles: state.profiles.map((p) => (p.id === profile.id ? updated : p)),
        });
      },

      toggleTodo: (id) => {
        if (!profile) return;
        const todos = (profile.todos ?? []).map((t) =>
          t.id === id ? { ...t, done: !t.done } : t,
        );
        const updated = { ...profile, todos };
        commit({
          ...state,
          profiles: state.profiles.map((p) => (p.id === profile.id ? updated : p)),
        });
      },

      deleteTodo: (id) => {
        if (!profile) return;
        const updated = { ...profile, todos: (profile.todos ?? []).filter((t) => t.id !== id) };
        commit({
          ...state,
          profiles: state.profiles.map((p) => (p.id === profile.id ? updated : p)),
        });
      },

      clearDoneTodos: () => {
        if (!profile) return;
        const updated = { ...profile, todos: (profile.todos ?? []).filter((t) => !t.done) };
        commit({
          ...state,
          profiles: state.profiles.map((p) => (p.id === profile.id ? updated : p)),
        });
      },

      backfill: (subjectId, chapterIds, done) => {
        if (!profile) return;
        const keys = getStageKeys(profile.grade);
        const progress = { ...profile.progress };
        for (const chId of chapterIds) {
          const cur: ChapterProgress = { ...(progress[`${subjectId}.${chId}`] ?? {}) };
          for (const sk of keys) cur[sk] = done ? "done" : "none";
          cur.updatedAt = new Date().toISOString();
          progress[`${subjectId}.${chId}`] = cur;
        }
        const updated: Profile = { ...profile, progress };
        touchStreak(updated);
        commit({
          ...state,
          profiles: state.profiles.map((p) => (p.id === profile.id ? updated : p)),
        });
      },

      dismissNotice: (key) => {
        if (!profile) return;
        const updated = { ...profile };
        delete updated[key];
        commit({
          ...state,
          profiles: state.profiles.map((p) => (p.id === profile.id ? updated : p)),
        });
      },

      shouldNudgeBackup: () => {
        if (!profile?.progress) return false;
        if (Object.keys(profile.progress).length < 5) return false;
        return !state.lastBackupAt;
      },

      exportJson: () => {
        const next = { ...state, lastBackupAt: new Date().toISOString() };
        commit(next);
        return JSON.stringify(
          {
            appName: "Sunil Bhaiya PrepTrack",
            exportedAt: new Date().toISOString(),
            schemaVersion: 1,
            activeProfileId: next.activeProfileId,
            profiles: next.profiles,
          },
          null,
          2,
        );
      },

      validateImport: (json) => {
        try {
          const data = JSON.parse(json) as AppState;
          if (!data || typeof data !== "object" || !Array.isArray(data.profiles))
            return { valid: false, error: "Invalid backup: missing 'profiles' array." };
          let chapters = 0;
          for (const p of data.profiles) if (p.progress) chapters += Object.keys(p.progress).length;
          return { valid: true, data, summary: { profiles: data.profiles.length, chapters } };
        } catch (e) {
          return { valid: false, error: "JSON Syntax Error: " + (e as Error).message };
        }
      },

      applyImport: (data) => {
        const next = { ...state, profiles: [...state.profiles] };
        for (const imp of data.profiles) {
          migrateProfile(imp);
          const idx = next.profiles.findIndex(
            (p) => p.id === imp.id || (p.name.toLowerCase() === imp.name.toLowerCase() && p.grade === imp.grade),
          );
          if (idx === -1) {
            next.profiles.push(imp);
          } else {
            imp.id = nid();
            imp.name = `${imp.name} (Imported)`;
            next.profiles.push(imp);
          }
        }
        next.activeProfileId = data.activeProfileId ?? next.profiles[0]?.id ?? null;
        commit(next);
      },

      resetAll: () => commit(emptyState()),

      diagnostics: () => {
        let storage = "Working (Read & Write OK)";
        try {
          localStorage.setItem("__cbse_test__", "1");
          const ok = localStorage.getItem("__cbse_test__") === "1";
          localStorage.removeItem("__cbse_test__");
          if (!ok) storage = "Read Error";
        } catch (e) {
          storage = "Storage Access Blocked (" + (e as Error).message + ")";
        }
        return [
          `App: Sunil Bhaiya PrepTrack (Next.js)`,
          `Storage: ${storage}`,
          `Profiles: ${state.profiles.length}`,
          `Active: ${profile ? `${profile.name} (Class ${profile.grade})` : "none"}`,
          `Last backup: ${state.lastBackupAt ?? "never"}`,
          `UA: ${typeof navigator !== "undefined" ? navigator.userAgent : "ssr"}`,
        ].join("\n");
      },
    }),
    [state, profile, ready, blockedFlag, commit],
  );

  return <TrackerCtx.Provider value={store}>{children}</TrackerCtx.Provider>;
}

export function useTracker(): Store {
  const s = useContext(TrackerCtx);
  if (!s) throw new Error("useTracker must be used inside <TrackerProvider>");
  return s;
}
