/** Profile switcher — avatar button opening a sheet with all students.
 * Replaces the native select with checkmarked rows + new-student action. */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTracker } from "../lib/storage";
import { GhostButton, Modal, PrimaryButton } from "./tracker-ui";

export default function ProfileSwitcher({ onNavigate }: { onNavigate?: () => void }) {
  const store = useTracker();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { profile, state } = store;
  if (!profile) return null;

  const go = (fn: () => void) => {
    fn();
    setOpen(false);
    onNavigate?.();
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Switch student"
        aria-haspopup="dialog"
        className="flex h-[52px] w-full items-center gap-3 rounded-full bg-[#1c1c1c] px-2.5 pr-4 ring-1 ring-white/10 transition-colors hover:bg-[#222]"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-[15px] font-bold text-black">
          {profile.name.charAt(0).toUpperCase()}
        </span>
        <span className="min-w-0 flex-1 truncate text-left text-[14px] font-medium">
          {profile.name} · Cl{profile.grade}
        </span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="shrink-0 text-[#777]">
          <path d="M8 9l4-4 4 4M8 15l4 4 4-4" />
        </svg>
      </button>

      {open && (
        <Modal title="Switch student" onClose={() => setOpen(false)}>
          <ul className="space-y-2">
            {state.profiles.map((p) => {
              const active = p.id === profile.id;
              return (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => go(() => store.setActive(p.id))}
                    aria-current={active ? "true" : undefined}
                    className={`flex min-h-[60px] w-full items-center gap-3 rounded-[14px] px-3.5 text-left ring-1 transition-colors ${
                      active ? "bg-white text-black ring-white" : "bg-[#1c1c1c] ring-white/[0.06] hover:bg-[#222]"
                    }`}
                  >
                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[16px] font-bold ${
                        active ? "bg-black text-white" : "bg-white/[0.08] text-white"
                      }`}
                    >
                      {p.name.charAt(0).toUpperCase()}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[15px] font-semibold">{p.name}</span>
                      <span className={`block text-[13px] ${active ? "text-black/60" : "text-[#999]"}`}>
                        Class {p.grade} · {Object.keys(p.progress ?? {}).length} chapters tracked
                      </span>
                    </span>
                    {active && (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
          <div className="mt-3 flex gap-2">
            <GhostButton small onClick={() => setOpen(false)}>
              Close
            </GhostButton>
            <PrimaryButton small onClick={() => go(() => router.push("/app/onboarding"))}>
              + New student
            </PrimaryButton>
          </div>
        </Modal>
      )}
    </>
  );
}
