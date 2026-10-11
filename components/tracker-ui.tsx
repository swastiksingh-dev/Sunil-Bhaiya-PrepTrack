/** Tracker UI atoms — one small interface per atom, zero business logic.
 * Dots, rings, tags, modal, and empty states shared by every tracker route. */
"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { gsap } from "gsap";
import { reducedMotion } from "../lib/motion";
import type { StatusColor } from "../lib/planner";
import type { StageState } from "../lib/stages";

/** Segmented circle chart — 36-tick progress ring that fills with completion.
 * Ticks stagger in on mount, center numeral counts up. Transform/opacity only. */
const TICKS = 36;
export function CircleChart({
  pct,
  size = 76,
  sub,
}: {
  pct: number;
  size?: number;
  sub?: string;
}) {
  const ticksRef = useRef<SVGGElement>(null);
  const numRef = useRef<HTMLSpanElement>(null);
  const clamped = Math.min(100, Math.max(0, Math.round(pct)));
  const filled = Math.round((clamped / 100) * TICKS);
  const R = 42;
  const LEN = 7;

  useEffect(() => {
    const num = numRef.current;
    if (reducedMotion()) {
      if (num) num.textContent = String(clamped);
      return;
    }
    const o = { v: 0 };
    const tl = gsap.timeline();
    if (ticksRef.current) {
      tl.fromTo(
        ticksRef.current.children,
        { opacity: 0 },
        { opacity: 1, duration: 0.25, stagger: 0.012, ease: "power1.out" },
        0,
      );
    }
    if (num) {
      tl.to(
        o,
        {
          v: clamped,
          duration: 1.2,
          ease: "power3.out",
          onUpdate: () => {
            num.textContent = String(Math.round(o.v));
          },
        },
        0,
      );
    }
    return () => {
      tl.kill();
    };
  }, [clamped]);

  const tick = (i: number) => {
    const a = (i / TICKS) * Math.PI * 2 - Math.PI / 2;
    const on = i < filled;
    return (
      <line
        key={i}
        x1={50 + (R - LEN / 2) * Math.cos(a)}
        y1={50 + (R - LEN / 2) * Math.sin(a)}
        x2={50 + (R + LEN / 2) * Math.cos(a)}
        y2={50 + (R + LEN / 2) * Math.sin(a)}
        stroke={on ? "#ffffff" : "rgba(255,255,255,0.13)"}
        strokeWidth={on ? 4.5 : 3.5}
        strokeLinecap="round"
      />
    );
  };

  return (
    <span
      className="relative inline-flex shrink-0 items-center justify-center"
      style={{ width: size, height: size }}
      role="img"
      aria-label={`${clamped} percent complete`}
    >
      <svg viewBox="0 0 100 100" width={size} height={size}>
        <g ref={ticksRef}>{Array.from({ length: TICKS }, (_, i) => tick(i))}</g>
      </svg>
      <span className="tnum absolute flex flex-col items-center leading-none">
        <span className="font-bold" style={{ fontSize: size * 0.24 }}>
          <span ref={numRef}>0</span>
          <span className="text-[0.6em] font-semibold text-[#999]">%</span>
        </span>
        {sub && <span className="mt-1 text-[10px] font-medium text-[#999]">{sub}</span>}
      </span>
    </span>
  );
}

/** Mouse-tracked spotlight wrapper — lift the card, sheen follows the cursor. */
export function SpotCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div
      ref={ref}
      onMouseMove={(e) => {
        const el = ref.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        el.style.setProperty("--mx", `${e.clientX - r.left}px`);
        el.style.setProperty("--my", `${e.clientY - r.top}px`);
      }}
      className={`spot ${className}`}
    >
      {children}
    </div>
  );
}

/** Date input — clicking ANYWHERE in the field opens the picker;
 * typing a date manually keeps working (native input, dark scheme). */
export function DateField({
  label,
  name,
  value,
  defaultValue,
  onChange,
  required,
}: {
  label: string;
  name?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (v: string) => void;
  required?: boolean;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const openPicker = () => {
    const el = ref.current;
    if (!el) return;
    el.focus({ preventScroll: true });
    try {
      el.showPicker();
    } catch {
      /* older browsers: focus alone still lands the cursor for typing */
    }
  };
  return (
    <div>
      <span className="mb-1.5 block text-[13px] font-medium text-[#ccc]">{label}</span>
      <div
        onClick={openPicker}
        className="group flex min-h-[48px] cursor-pointer items-center gap-2 rounded-[10px] bg-[#1c1c1c] px-4 ring-1 ring-white/10 transition-all focus-within:ring-[#0099ff] hover:bg-[#222] hover:ring-white/20"
      >
        <input
          ref={ref}
          name={name}
          type="date"
          required={required}
          value={value}
          defaultValue={defaultValue}
          onChange={onChange ? (e) => onChange(e.target.value) : undefined}
          className="h-[48px] w-full cursor-pointer bg-transparent text-[15px] text-white outline-none"
          style={{ colorScheme: "dark" }}
        />
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          className="shrink-0 text-[#777] transition-colors group-hover:text-white"
          aria-hidden
        >
          <rect x="3" y="4" width="18" height="18" rx="3" />
          <path d="M16 2v4M8 2v4M3 10h18" />
        </svg>
      </div>
    </div>
  );
}

const STATUS_STYLES: Record<StatusColor, { text: string; bg: string; ring: string }> = {
  grey: { text: "text-[#999]", bg: "bg-white/[0.07]", ring: "ring-white/10" },
  red: { text: "text-[#f87171]", bg: "bg-[#f87171]/10", ring: "ring-[#f87171]/25" },
  amber: { text: "text-[#fbbf24]", bg: "bg-[#f59e0b]/10", ring: "ring-[#f59e0b]/25" },
  green: { text: "text-[#4ade80]", bg: "bg-[#22c55e]/10", ring: "ring-[#22c55e]/25" },
  blue: { text: "text-[#38bdf8]", bg: "bg-[#0099ff]/10", ring: "ring-[#0099ff]/25" },
};

export function StatusTag({ color, label }: { color: StatusColor; label: string }) {
  const s = STATUS_STYLES[color];
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-[12px] font-semibold ring-1 ${s.text} ${s.bg} ${s.ring}`}>
      {label}
    </span>
  );
}

/** Non-interactive dot visual for use inside other buttons (avoids nested <button>). */
export function Dot({ state, size = 26 }: { state: StageState | string; size?: number }) {
  return (
    <span
      style={{ width: size, height: size }}
      aria-hidden
      className={`inline-flex shrink-0 items-center justify-center rounded-full ${
        state === "done"
          ? "bg-[#22c55e]"
          : state === "progress"
            ? "bg-[#f59e0b]"
            : "bg-transparent ring-2 ring-white/25"
      }`}
    >
      {state === "done" && (
        <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 24 24" fill="none" stroke="#090909" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 6L9 17l-5-5" />
        </svg>
      )}
      {state === "progress" && <span className="h-1/3 w-1/3 rounded-full bg-[#090909]/60" />}
    </span>
  );
}

export function StageDot({  state,
  label,
  disabled,
  onTap,
  size = 28,
}: {
  state: StageState | string;
  label: string;
  disabled?: boolean;
  onTap?: () => void;
  size?: number;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation();
        onTap?.();
      }}
      style={{ width: size, height: size }}
      className={`inline-flex shrink-0 items-center justify-center rounded-full transition-transform active:scale-90 ${
        state === "done"
          ? "bg-[#22c55e]"
          : state === "progress"
            ? "bg-[#f59e0b]"
            : "bg-transparent ring-2 ring-white/25"
      } ${disabled ? "cursor-not-allowed opacity-30" : "cursor-pointer hover:scale-110"}`}
    >
      {state === "done" && (
        <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 24 24" fill="none" stroke="#090909" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 6L9 17l-5-5" />
        </svg>
      )}
      {state === "progress" && <span className="h-1/3 w-1/3 rounded-full bg-[#090909]/60" />}
    </button>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-[20px] bg-[#141414] p-5 ring-1 ring-white/[0.06] sm:p-6 ${className}`}>
      {children}
    </section>
  );
}

export function Pill({
  active,
  children,
  onClick,
}: {
  active?: boolean;
  children: ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-h-[40px] items-center rounded-full px-4 text-[13px] font-medium whitespace-nowrap transition-colors ${
        active ? "bg-white text-black" : "bg-[#1c1c1c] text-[#ccc] ring-1 ring-white/10 hover:bg-[#262626]"
      }`}
    >
      {children}
    </button>
  );
}

export function Modal({
  title,
  children,
  onClose,
  wide,
  fullscreen,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
  wide?: boolean;
  fullscreen?: boolean;
}) {
  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-label={title}>
      <div
        className={`flex w-full flex-col overflow-hidden bg-[#141414] ring-1 ring-white/10 ${
          fullscreen
            ? "h-[100dvh] max-h-[100dvh] rounded-none sm:h-auto sm:max-h-[92dvh] sm:rounded-[20px]"
            : "max-h-[92dvh] rounded-t-[20px] sm:rounded-[20px]"
        } ${wide ? "sm:max-w-3xl" : "sm:max-w-lg"}`}
      >
        <div className="flex items-center justify-between border-b border-white/[0.07] p-4 sm:px-5">
          <h2 className="text-[17px] font-semibold tracking-tight">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#1c1c1c] ring-1 ring-white/10"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">{children}</div>
      </div>
    </div>
  );
}

export function EmptyNotice({ title, copy, action }: { title: string; copy: string; action?: ReactNode }) {
  return (
    <Card className="py-10 text-center">
      <p className="text-[16px] font-semibold tracking-tight">{title}</p>
      <p className="mx-auto mt-2 max-w-sm text-[14px] text-[#999]">{copy}</p>
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </Card>
  );
}

export function PrimaryButton({
  children,
  onClick,
  type = "button",
  small,
}: {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  small?: boolean;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`inline-flex items-center justify-center rounded-full bg-white font-medium text-black transition-transform hover:scale-[1.02] active:scale-[0.98] ${small ? "h-10 px-5 text-[13px]" : "min-h-[48px] px-7 text-sm"}`}
    >
      {children}
    </button>
  );
}

export function GhostButton({
  children,
  onClick,
  small,
  danger,
}: {
  children: ReactNode;
  onClick?: () => void;
  small?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center justify-center rounded-full bg-[#1c1c1c] font-medium ring-1 transition-colors hover:bg-[#262626] ${
        danger ? "text-[#f87171] ring-[#f87171]/25" : "text-white ring-white/10"
      } ${small ? "h-10 px-4 text-[13px]" : "min-h-[48px] px-6 text-sm"}`}
    >
      {children}
    </button>
  );
}

export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-medium text-[#ccc]">{label}</span>
      {children}
    </label>
  );
}

export const inputCls =
  "flex min-h-[48px] w-full items-center rounded-[10px] bg-[#1c1c1c] px-4 text-[15px] text-white ring-1 ring-white/10 placeholder:text-[#666] focus:ring-[#0099ff]";
