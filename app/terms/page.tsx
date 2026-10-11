import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "Terms for using PrepTrack: study aid, personal use of papers.",
};

const BLOCKS: [string, string][] = [
  [
    "A study aid, not a teacher",
    "Pace numbers, forecasts, and focus lists are planning aids computed from the dates and syllabus you enter. They don't guarantee marks. Your teachers and NCERT books are the authority.",
  ],
  [
    "Question papers",
    "CBQ volumes and CBSE links are for your personal exam preparation. Respect CBSE's own terms on their portal.",
  ],
  [
    "Your data, your device",
    "Progress lives in your browser. Clearing site data, uninstalling the browser profile, or losing the device loses unsaved progress — export backups from Settings for anything important.",
  ],
  [
    "Fair use",
    "Use the app for learning. Don't scrape, resell, or misrepresent it, and don't use it for anything unlawful.",
  ],
];

export default function TermsPage() {
  return (
    <div className="mx-auto w-full max-w-2xl space-y-4 px-4 py-10">
      <Link href="/" className="text-[13px] font-medium text-[#0099ff] hover:underline">
        ← Back home
      </Link>
      <h1 className="display-tight text-[34px] sm:text-[44px]">Terms &amp; Conditions</h1>
      <p className="text-[14px] text-[#999]">Plain words, short list.</p>
      {BLOCKS.map(([h, p]) => (
        <section key={h} className="rounded-[20px] bg-[#141414] p-5 ring-1 ring-white/[0.06] sm:p-6">
          <h2 className="text-[16px] font-semibold tracking-tight">{h}</h2>
          <p className="mt-1.5 text-[14px] leading-relaxed text-[#bbb]">{p}</p>
        </section>
      ))}
    </div>
  );
}
