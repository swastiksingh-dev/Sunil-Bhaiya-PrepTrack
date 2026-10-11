/** Resources — Class 10 CBQ PDFs (local viewer + download) + CBSE PYQ portal.
 * Class 9 deliberately hides this screen: no official material exists yet. */
"use client";

import { useState } from "react";
import { useTracker } from "../../../lib/storage";
import { CLASS_10_RESOURCES, CBSE_PYQ_PORTAL_URL } from "../../../lib/chapters";
import { assetUrl } from "../../../lib/site";
import { EmptyNotice, Modal, SpotCard } from "../../../components/tracker-ui";

const NAMES: Record<string, string> = {
  science: "Science",
  maths: "Mathematics",
  sst: "Social Science",
};

export default function ResourcesPage() {
  const { profile, ready } = useTracker();
  const [viewing, setViewing] = useState<{ title: string; path: string } | null>(null);

  if (!ready) return null;
  if (!profile) return <EmptyNotice title="No student yet" copy="Finish onboarding first." />;
  if (profile.grade === 9)
    return (
      <EmptyNotice
        title="No resources for Class 9"
        copy="There is no official CBQ/PYQ material for the new Class 9 NCERT edition yet, so this screen stays hidden for Class 9 profiles."
      />
    );

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-[24px] font-semibold tracking-tight">Question papers</h1>
        <p className="mt-0.5 text-[14px] text-[#999]">Competency practice PDFs, by subject.</p>
      </div>

      {Object.entries(NAMES).map(([id, name]) => {
        const items = CLASS_10_RESOURCES[id] ?? [];
        return (
          <SpotCard key={id} className="glass-hi rounded-[20px] bg-[#141414] p-5 ring-1 ring-white/[0.06] sm:p-6">
            <h2 className="border-b border-white/10 pb-2 font-mono text-[12px] font-semibold tracking-[0.08em] text-[#ccc] uppercase">
              {name}
            </h2>
            {items.length === 0 ? (
              <p className="mt-3 text-[14px] text-[#999]">No PDFs for this subject yet.</p>
            ) : (
              <ul className="mt-2 divide-y divide-white/[0.06]">
                {items.map((it, i) => (
                  <li key={it.path} className="flex items-center gap-1 py-1">
                    <button
                      type="button"
                      onClick={() => setViewing(it)}
                      aria-label={`View ${it.title}`}
                      className="flex min-h-[60px] min-w-0 flex-1 items-center gap-3 rounded-[12px] px-2 py-2 text-left transition-colors hover:bg-white/[0.04]"
                    >
                      <span className="tnum flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/[0.07] font-mono text-[12px] font-bold">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[14px] font-medium">{it.title}</span>
                        <span className="block text-[12.5px] text-[#777]">Tap to read · PDF</span>
                      </span>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0" aria-hidden>
                        <path d="M9 6l6 6-6 6" />
                      </svg>
                    </button>
                    <a
                      href={assetUrl(it.path)}
                      download
                      aria-label={`Download ${it.title}`}
                      title="Download"
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#1c1c1c] ring-1 ring-white/10 transition-colors hover:bg-[#262626]"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 3v12m0 0l-4-4m4 4l4-4M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
                      </svg>
                    </a>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-4 rounded-[16px] bg-gradient-to-br from-[#6a4cf5]/40 via-white/10 to-[#ff7a3d]/30 p-px">
              <div className="rounded-[15px] bg-[#101010] p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[14px] font-semibold">Previous Year Question Papers</p>
                  <span className="tnum shrink-0 rounded-full bg-white/[0.07] px-2.5 py-1 font-mono text-[10.5px] tracking-wide text-[#999] uppercase">
                    cbse.gov.in
                  </span>
                </div>
                <p className="mt-1 text-[13px] text-[#999]">
                  Official CBSE portal — needs internet, opens outside the app.
                </p>
                <a
                  href={CBSE_PYQ_PORTAL_URL}
                  target="_blank"
                  rel="noopener"
                  className="group relative mt-3 inline-flex h-11 items-center gap-2 overflow-hidden rounded-full bg-white px-5 text-[13px] font-medium text-black transition-transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span
                    aria-hidden
                    className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-[#6a4cf5]/25 to-transparent transition-transform duration-700 group-hover:translate-x-full"
                  />
                  <span className="relative">Open CBSE PYQ portal</span>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                    className="relative transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  >
                    <path d="M7 17L17 7M8 7h9v9" />
                  </svg>
                </a>
              </div>
            </div>
          </SpotCard>
        );
      })}

      {viewing && (
        <Modal title={viewing.title} wide fullscreen onClose={() => setViewing(null)}>
          <div className="flex h-[calc(100dvh-140px)] flex-col overflow-hidden rounded-[10px] bg-[#0a0a0a] sm:h-[62dvh]">
            <iframe src={assetUrl(viewing.path)} title={viewing.title} className="h-full w-full flex-1 border-0" />
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <a
              href={assetUrl(viewing.path)}
              download
              className="inline-flex h-11 items-center rounded-full bg-white px-5 text-[13px] font-medium text-black"
            >
              Download PDF
            </a>
            <a
              href={assetUrl(viewing.path)}
              target="_blank"
              rel="noopener"
              className="inline-flex h-11 items-center rounded-full bg-[#1c1c1c] px-5 text-[13px] font-medium ring-1 ring-white/10"
            >
              Open in new tab ↗
            </a>
          </div>
          <p className="mt-2 text-[12.5px] text-[#666]">
            Pinch to zoom works in the viewer. On small screens, “Open in new tab” gives the full reader.
          </p>
        </Modal>
      )}
    </div>
  );
}
