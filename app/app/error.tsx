"use client";

export default function AppError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="rounded-[20px] bg-[#141414] p-8 text-center ring-1 ring-white/[0.06]">
      <p className="text-[18px] font-semibold tracking-tight">Something hiccupped</p>
      <p className="mx-auto mt-2 max-w-sm text-[14px] text-[#999]">
        Your saved progress is safe in this browser. Try again — if it persists, export a backup
        from Settings first.
      </p>
      <p className="mx-auto mt-3 max-w-sm truncate font-mono text-[12px] text-[#666]">
        {error.message}
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-5 inline-flex h-11 items-center rounded-full bg-white px-6 text-sm font-medium text-black transition-transform hover:scale-[1.03]"
      >
        Try again
      </button>
    </div>
  );
}
