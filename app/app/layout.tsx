/** Tracker shell — provider, top bar, desktop sidebar, mobile bottom nav.
 * Mobile-first: bottom tab bar <lg; fixed left rail ≥lg with content offset. */
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { TrackerProvider, useTracker } from "../../lib/storage";
import { getSubjects } from "../../lib/chapters";
import { getStageLabel } from "../../lib/stages";
import { getTodaysFocus } from "../../lib/planner";
import { reducedMotion } from "../../lib/motion";
import { StageDot } from "../../components/tracker-ui";
import ProfileSwitcher from "../../components/profile-switcher";
import { tapStage } from "../../lib/celebrate";
import { BrandMark } from "../../components/site-header";

const TABS = [
  { href: "/app/dashboard", label: "Home", icon: "M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8v-10h-8v10zm0-18v6h8V3h-8z" },
  { href: "/app/chapters", label: "Chapters", icon: "M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z" },
  { href: "/app/insights", label: "Insights", icon: "M5 9.2h3V19H5zM10.6 5h2.8v14h-2.8zM16.2 13H19v6h-2.8z" },
  { href: "/app/analysis", label: "Analysis", icon: "M3 3v18h18v-2H5V3H3zm4 12l4-4 3 3 5-6v2h2V6h-4v2h2l-5 5-3-3-4 4v2z" },
  { href: "/app/revision", label: "Revision", icon: "M12 5V1L7 6l5 5V7c3.3 0 6 2.7 6 6s-2.7 6-6 6-6-2.7-6-6H4c0 4.4 3.6 8 8 8s8-3.6 8-8-3.6-8-8-8z" },
  { href: "/app/goals", label: "Goals", icon: "M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18a8 8 0 110-16 8 8 0 010 16zm0-13a5 5 0 100 10 5 5 0 000-10zm0 8a3 3 0 110-6 3 3 0 010 6z" },
  { href: "/app/todo", label: "To Do", icon: "M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zm-8 14l-5-5 1.4-1.4L11 14.2l6.6-6.6L19 9l-8 8z" },
  { href: "/app/resources", label: "Resources", icon: "M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" },
  { href: "/app/settings", label: "Settings", icon: "M12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6zm9.14-3.6c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58z" },
];

function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { ready, blocked, profile, state } = useTracker();
  const [quickOpen, setQuickOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [fabOpen, setFabOpen] = useState(false);

  useEffect(() => {
    if (!ready) return;
    if (state.profiles.length === 0 && pathname !== "/app/onboarding") {
      router.replace("/app/onboarding");
    }
  }, [ready, state.profiles.length, pathname, router]);

  const tabs =
    profile && profile.grade === 9 ? TABS.filter((t) => t.href !== "/app/resources") : TABS;
  const showNav = ready && state.profiles.length > 0 && pathname !== "/app/onboarding";

  return (
    <div className="min-h-dvh">
      {/* Desktop rail */}
      {showNav && (
        <aside className="fixed inset-y-0 left-0 z-50 hidden w-60 flex-col border-r border-white/[0.07] bg-[#0c0c0c] p-4 lg:flex">
          <Link href="/app/dashboard" className="flex items-center gap-2.5 px-2 py-2" aria-label="Tracker home">
            <BrandMark size={32} />
            <span className="text-[15px] font-semibold tracking-tight">PrepTrack</span>
          </Link>
          <nav className="mt-6 flex max-h-[55dvh] flex-col gap-1 overflow-y-auto" aria-label="Tracker">
            {tabs.map((t) => {
              const active = pathname === t.href || (t.href === "/app/dashboard" && pathname === "/app");
              return (
                <Link
                  key={t.href}
                  href={t.href}
                  aria-current={active ? "page" : undefined}
                  className={`group flex min-h-[48px] items-center gap-3 rounded-full px-4 text-[14px] font-medium transition-colors ${
                    active ? "bg-white text-black" : "text-[#999] hover:bg-white/[0.06] hover:text-white"
                  }`}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden className="transition-transform duration-300 group-hover:scale-110">
                    <path d={t.icon} />
                  </svg>
                  {t.label}
                </Link>
              );
            })}
          </nav>
          <div className="mt-auto space-y-3">
            {profile?.streak && (
              <p className="rounded-[12px] bg-[#f59e0b]/10 px-4 py-3 text-[13px] font-semibold text-[#fbbf24] ring-1 ring-[#f59e0b]/25">
                {profile.streak.count}-day streak. Keep it burning.
              </p>
            )}
            {state.profiles.length > 0 && <ProfileSwitcher />}
          </div>
        </aside>
      )}

      {/* Content */}
      <div className="mx-auto flex w-full max-w-3xl flex-col px-4 pt-4 pb-12 lg:max-w-6xl lg:px-8 lg:pt-8 lg:pb-12 lg:pl-68">
        <header className="flex items-center justify-between gap-3 lg:hidden">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open navigation"
              className="flex h-11 w-11 items-center justify-center rounded-full bg-[#141414] ring-1 ring-white/10 transition-transform active:scale-95"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            </button>
            <Link href="/app/dashboard" className="flex items-center gap-2.5" aria-label="Tracker home">
              <BrandMark size={30} />
              <span className="text-[15px] font-semibold tracking-tight">PrepTrack</span>
            </Link>
          </div>
          {profile?.streak && (
            <span className="inline-flex h-10 items-center rounded-full bg-[#f59e0b]/10 px-3.5 text-[13px] font-semibold text-[#fbbf24] ring-1 ring-[#f59e0b]/25">
              {profile.streak.count}-day streak
            </span>
          )}
        </header>

        {blocked && (
          <p className="mt-3 rounded-[10px] bg-[#f87171]/10 p-3 text-[13px] leading-relaxed text-[#f87171] ring-1 ring-[#f87171]/25 lg:mt-0">
            Storage is blocked by this browser (extension or private mode). Progress works this
            session but won&apos;t be saved. Try an incognito window.
          </p>
        )}

        <main className="mt-4 flex-1 lg:mt-2">{ready ? children : <LoadingSkeleton />}</main>

        {/* Mobile drawer + FAB speed-dial */}
        {showNav && (
          <>
            <SpeedDial
              open={fabOpen}
              onToggle={() => setFabOpen((v) => !v)}
              onLog={() => {
                setFabOpen(false);
                setQuickOpen(true);
              }}
            />
            <MobileDrawer
              open={drawerOpen}
              onClose={() => setDrawerOpen(false)}
              onQuickLog={() => {
                setDrawerOpen(false);
                setQuickOpen(true);
              }}
            />
          </>
        )}
        <QuickLogSheet open={quickOpen} onClose={() => setQuickOpen(false)} />
      </div>
    </div>
  );
}

/** Slide-in drawer for mobile: profile header, full nav, streak, quick actions.
 * GSAP x-tween entrance, scrim dismiss, body scroll lock. */
/** Expanding quick-action dial: log today's focus or jump to revision.
 * Mini actions stagger up with GSAP; scrim tap collapses. */
function SpeedDial({ open, onToggle, onLog }: { open: boolean; onToggle: () => void; onLog: () => void }) {
  const router = useRouter();
  const itemsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && itemsRef.current && !reducedMotion()) {
      gsap.fromTo(
        itemsRef.current.children,
        { y: 16, opacity: 0, scale: 0.9 },
        { y: 0, opacity: 1, scale: 1, duration: 0.3, stagger: 0.06, ease: "back.out(1.6)" },
      );
    }
  }, [open ]);

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onToggle}
          aria-hidden
        />
      )}
      <div className="fixed right-4 bottom-[calc(1.25rem+env(safe-area-inset-bottom))] z-50 flex flex-col items-end gap-2.5 lg:hidden">
        {open && (
          <div ref={itemsRef} className="flex flex-col items-end gap-2.5">
            <button
              type="button"
              onClick={onLog}
              className="flex h-12 items-center gap-2.5 rounded-full bg-[#1c1c1c] pr-5 pl-4 text-[13.5px] font-medium ring-1 ring-white/15"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-[15px] text-black">✓</span>
              Log focus
            </button>
            <button
              type="button"
              onClick={() => {
                onToggle();
                router.push("/app/todo");
              }}
              className="flex h-12 items-center gap-2.5 rounded-full bg-[#1c1c1c] pr-5 pl-4 text-[13.5px] font-medium ring-1 ring-white/15"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-[15px] text-black">☰</span>
              Today&apos;s list
            </button>
            <button
              type="button"
              onClick={() => {
                onToggle();
                router.push("/app/revision");
              }}
              className="flex h-12 items-center gap-2.5 rounded-full bg-[#1c1c1c] pr-5 pl-4 text-[13.5px] font-medium ring-1 ring-white/15"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-[15px] text-black">↻</span>
              Revise stale
            </button>
          </div>
        )}
        <button
          type="button"
          onClick={onToggle}
          aria-label={open ? "Close quick actions" : "Open quick actions"}
          aria-expanded={open}
          className={`flex h-14 w-14 items-center justify-center rounded-full text-[28px] font-light shadow-[0_8px_30px_rgba(0,0,0,0.5)] transition-all hover:scale-105 active:scale-95 ${
            open ? "rotate-45 bg-[#1c1c1c] text-white ring-1 ring-white/20" : "bg-white text-black"
          }`}
        >
          +
        </button>
      </div>
    </>
  );
}

function MobileDrawer({ open, onClose, onQuickLog }: { open: boolean; onClose: () => void; onQuickLog: () => void }) {
  const store = useTracker();
  const pathname = usePathname();
  const panelRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const { profile, state } = store;

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    if (open && !reducedMotion()) {
      if (panelRef.current) {
        gsap.fromTo(panelRef.current, { x: "-100%" }, { x: "0%", duration: 0.4, ease: "power3.out" });
      }
      if (navRef.current) {
        gsap.fromTo(
          navRef.current.children,
          { x: -18, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.35, stagger: 0.045, ease: "power3.out", delay: 0.1 },
        );
      }
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open ]);

  if (!open) return null;
  const tabs =
    profile && profile.grade === 9 ? TABS.filter((t) => t.href !== "/app/resources") : TABS;

  return (
    <div className="fixed inset-0 z-[80] lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div
        ref={panelRef}
        className="absolute inset-y-0 left-0 flex w-[300px] max-w-[85vw] flex-col bg-[#0e0e0e] p-4 ring-1 ring-white/10"
      >
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2.5">
            <BrandMark size={32} />
            <span className="text-[15px] font-semibold tracking-tight">PrepTrack</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-[#1c1c1c] ring-1 ring-white/10"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        {profile && (
          <div className="mt-4 flex items-center gap-3 rounded-[16px] bg-[#141414] p-3.5 ring-1 ring-white/[0.07]">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-[17px] font-bold text-black">
              {profile.name.charAt(0).toUpperCase()}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[15px] font-semibold">{profile.name}</p>
              <p className="text-[13px] text-[#999]">
                Class {profile.grade} · {profile.streak ? `${profile.streak.count}-day streak` : "new"}
              </p>
            </div>
          </div>
        )}

        <nav ref={navRef} className="mt-3 flex-1 space-y-1 overflow-y-auto" aria-label="Tracker">
          {tabs.map((t, i) => {
            const active = pathname === t.href || (t.href === "/app/dashboard" && pathname === "/app");
            return (
              <Link
                key={t.href}
                href={t.href}
                onClick={onClose}
                aria-current={active ? "page" : undefined}
                className={`group flex min-h-[52px] items-center gap-3.5 rounded-[14px] px-4 text-[15px] font-medium transition-colors ${
                  active ? "bg-white text-black" : "text-[#bbb] hover:bg-white/[0.06] hover:text-white"
                }`}
              >
                <span className={`font-mono text-[11px] ${active ? "text-black/50" : "text-[#555]"}`}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor" aria-hidden className="transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6">
                  <path d={t.icon} />
                </svg>
                {t.label}
              </Link>
            );
          })}
        </nav>

        <div className="space-y-2 pt-3">
          <button
            type="button"
            onClick={onQuickLog}
            className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-full bg-white text-sm font-medium text-black transition-transform active:scale-[0.98]"
          >
            + Log today&apos;s focus
          </button>
          {state.profiles.length > 0 && <ProfileSwitcher onNavigate={onClose} />}
        </div>
      </div>
    </div>
  );
}

function QuickLogSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const store = useTracker();
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    if (open && sheetRef.current && !reducedMotion()) {
      gsap.fromTo(
        sheetRef.current,
        { y: 64, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.45, ease: "power3.out" },
      );
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open ]);

  if (!open) return null;
  const profile = store.profile;
  if (!profile) return null;
  const focus = getTodaysFocus(profile, getSubjects(profile.grade));

  return (
    <div className="fixed inset-0 z-[70] lg:hidden" role="dialog" aria-modal="true" aria-label="Quick log">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div
        ref={sheetRef}
        className="absolute inset-x-3 bottom-[calc(0.75rem+env(safe-area-inset-bottom))] rounded-[22px] bg-[#141414] p-4 ring-1 ring-white/10"
      >
        <div className="mb-3 flex items-center justify-between">
          <p className="text-[15px] font-semibold tracking-tight">Log in one tap</p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close quick log"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1c1c1c] ring-1 ring-white/10"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
        {focus.length === 0 ? (
          <p className="py-4 text-center text-[14px] text-[#999]">All caught up. Nothing pending.</p>
        ) : (
          <ul className="space-y-2">
            {focus.map((f) => (
              <li
                key={`${f.subjectId}.${f.chapterId}.${f.stageKey}`}
                className="flex min-h-[56px] items-center justify-between gap-3 rounded-[14px] bg-[#1c1c1c] px-3.5 py-2 ring-1 ring-white/[0.05]"
              >
                <div className="min-w-0">
                  <p className="truncate text-[14px] font-medium">
                    Ch {f.chapterNo}: {f.chapterName}
                  </p>
                  <p className="truncate text-[12.5px] text-[#999]">
                    {f.subjectName} · {getStageLabel(f.subjectId, f.stageKey)}
                  </p>
                </div>
                <StageDot
                  state={f.currentState}
                  label={`Mark ${f.stageLabel}`}
                  onTap={() => tapStage(store, f.subjectId, f.chapterId, f.stageKey)}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-3" aria-label="Loading">
      <div className="h-28 rounded-[20px] bg-[#141414]" />
      <div className="h-40 rounded-[20px] bg-[#141414]" />
      <div className="h-24 rounded-[20px] bg-[#141414]" />
    </div>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <TrackerProvider>
      <Shell>{children}</Shell>
    </TrackerProvider>
  );
}
