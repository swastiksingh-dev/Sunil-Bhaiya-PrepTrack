import type { Metadata } from "next";
import Landing from "../components/landing";

export const metadata: Metadata = {
  title: "Sunil Bhaiya PrepTrack — CBSE Study Tracker",
  description:
    "PrepTrack — the rebuilt, offline-first evolution of the original Sunil Bhaiya tracker. Backward exam planning, stage tracking, insights, and question banks.",
};

export default function Home() {
  return <Landing />;
}
