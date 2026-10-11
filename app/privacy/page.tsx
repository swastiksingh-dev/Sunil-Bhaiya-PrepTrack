import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How PrepTrack handles your data: on-device first, no accounts, no tracking.",
};

const BLOCKS: [string, string][] = [
  [
    "On-device first",
    "Profiles, chapter progress, streaks, datesheets, to-dos, and weekly goals live in your browser's localStorage under the key cbse_tracker_v1. Nothing is uploaded anywhere — there is no account, no server database, and no analytics.",
  ],
  [
    "Question papers",
    "CBQ PDFs ship with the app and open locally. Previous-year papers open on the official CBSE portal in a new tab, which has its own privacy policy.",
  ],
  [
    "Backups",
    "Export files you download contain your full progress. They live wherever you save or share them — treat them like any personal file.",
  ],
  [
    "Children",
    "This app is built for school students and collects nothing itself. A parent or teacher sets it up on the student's own device.",
  ],
  [
    "Contact",
    "Questions about this policy: talk to whoever gave you this app (your coaching/class administrator).",
  ],
];

export default function PrivacyPage() {
  return (
    <div className="mx-auto w-full max-w-2xl space-y-4 px-4 py-10">
      <Link href="/" className="text-[13px] font-medium text-[#0099ff] hover:underline">
        ← Back home
      </Link>
      <h1 className="display-tight text-[34px] sm:text-[44px]">Privacy Policy</h1>
      <p className="text-[14px] text-[#999]">Short version: your data stays on your device.</p>
      {BLOCKS.map(([h, p]) => (
        <section key={h} className="rounded-[20px] bg-[#141414] p-5 ring-1 ring-white/[0.06] sm:p-6">
          <h2 className="text-[16px] font-semibold tracking-tight">{h}</h2>
          <p className="mt-1.5 text-[14px] leading-relaxed text-[#bbb]">{p}</p>
        </section>
      ))}
    </div>
  );
}
