/** Rewards — tiny Web Audio chimes + canvas confetti for completions.
 * No audio/image assets; everything synthesized. Sound toggle persisted
 * under `sb_sound` ("off" mutes). Confetti honors reduced motion. */
"use client";

import type { Store } from "./storage";
import type { StageKey } from "./stages";

const MUTE_KEY = "sb_sound";

export function isMuted(): boolean {
  try {
    return localStorage.getItem(MUTE_KEY) === "off";
  } catch {
    return false;
  }
}

export function setMuted(muted: boolean) {
  try {
    localStorage.setItem(MUTE_KEY, muted ? "off" : "on");
  } catch {
    /* private mode: stay audible, stay simple */
  }
}

let ctx: AudioContext | null = null;
function audio(): AudioContext | null {
  try {
    if (!ctx) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      ctx = new AC();
    }
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function chime(freqs: number[], step = 0.11, dur = 0.34, vol = 0.14) {
  const ac = audio();
  if (!ac) return false;
  const t0 = ac.currentTime;
  freqs.forEach((f, i) => {
    const osc = ac.createOscillator();
    const g = ac.createGain();
    osc.type = "sine";
    osc.frequency.value = f;
    g.gain.setValueAtTime(0, t0 + i * step);
    g.gain.linearRampToValueAtTime(vol, t0 + i * step + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + i * step + dur);
    osc.connect(g).connect(ac.destination);
    osc.start(t0 + i * step);
    osc.stop(t0 + i * step + dur + 0.05);
  });
  return true;
}

function notes(freqs: number[], step = 0.11, dur = 0.34, vol = 0.14) {
  if (isMuted()) return;
  chime(freqs, step, dur, vol);
}

/** Explicit sound check for Settings: resumes a suspended context (mobile
 * autoplay policy) and plays the stage chime regardless of the mute toggle.
 * Returns true when notes were actually scheduled while running. */
export async function previewSound(): Promise<boolean> {
  try {
    let ac = audio();
    if (!ac) return false;
    if (ac.state === "suspended") {
      await ac.resume().catch(() => {});
      ac = audio();
      if (!ac || ac.state !== "running") return false;
    }
    return chime([523.25, 783.99]);
  } catch {
    return false;
  }
}

const CONFETTI_COLORS = ["#ffffff", "#6a4cf5", "#d44df0", "#ff7a3d", "#22c55e", "#0099ff"];

export function confetti(n = 90) {
  try {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const canvas = document.createElement("canvas");
    canvas.style.cssText =
      "position:fixed;inset:0;width:100vw;height:100dvh;pointer-events:none;z-index:90;";
    document.body.appendChild(canvas);
    const dpr = Math.min(window.devicePixelRatio, 2);
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    const g = canvas.getContext("2d");
    if (!g) {
      canvas.remove();
      return;
    }
    g.scale(dpr, dpr);
    const parts = Array.from({ length: n }, () => ({
      x: window.innerWidth / 2 + (Math.random() - 0.5) * 120,
      y: window.innerHeight * 0.35,
      vx: (Math.random() - 0.5) * 11,
      vy: -Math.random() * 9 - 3,
      s: Math.random() * 7 + 4,
      r: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.3,
      c: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      life: 1,
    }));
    let frames = 0;
    const tick = () => {
      frames++;
      g.clearRect(0, 0, window.innerWidth, window.innerHeight);
      let alive = false;
      for (const p of parts) {
        p.vy += 0.28;
        p.x += p.vx;
        p.y += p.vy;
        p.r += p.vr;
        p.life -= 0.008;
        if (p.y < window.innerHeight + 20 && p.life > 0) alive = true;
        else continue;
        g.save();
        g.translate(p.x, p.y);
        g.rotate(p.r);
        g.globalAlpha = Math.max(0, Math.min(1, p.life * 1.5));
        g.fillStyle = p.c;
        g.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2);
        g.restore();
      }
      if (alive && frames < 240) requestAnimationFrame(tick);
      else canvas.remove();
    };
    requestAnimationFrame(tick);
  } catch {
    /* celebration is best-effort */
  }
}

export type RewardKind = "stage" | "goal" | "streak";

export function celebrate(kind: RewardKind) {
  if (kind === "stage") {
    notes([523.25, 783.99]);
  } else if (kind === "goal") {
    notes([523.25, 659.25, 783.99, 1046.5], 0.12, 0.4, 0.15);
    confetti(110);
  } else {
    notes([392, 523.25, 659.25, 783.99, 1046.5, 1318.5], 0.1, 0.36, 0.13);
    confetti(150);
  }
}

/** Cycle a stage; chime only on transitions INTO done. */
export function tapStage(store: Store, subjectId: string, chapterId: string, stageKey: StageKey) {
  const cur = store.profile?.progress[`${subjectId}.${chapterId}`]?.[stageKey];
  store.cycleStage(subjectId, chapterId, stageKey);
  if (cur === "progress") celebrate("stage");
}
