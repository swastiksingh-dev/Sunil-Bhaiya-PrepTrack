import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { assetUrl } from "../lib/site";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const grotesk = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Sunil Bhaiya PrepTrack — CBSE Study Tracker",
    template: "%s · PrepTrack",
  },
  description:
    "PrepTrack — the rebuilt, offline-first evolution of the original Sunil Bhaiya tracker: exam-syllabus pacing, stage tracking, insights, and question banks for CBSE Class 9 & 10.",
  keywords: [
    "CBSE study tracker",
    "Class 10 preparation",
    "Class 9 NCERT",
    "exam syllabus planner",
    "NCERT exemplar",
    "competency questions",
    "previous year questions",
    "study pace calculator",
    "offline PWA",
  ],
  authors: [{ name: "Sunil Bhaiya" }],
  creator: "Sunil Bhaiya",
  category: "education",
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    siteName: "PrepTrack",
    title: "Sunil Bhaiya PrepTrack — CBSE Study Tracker",
    description:
      "Know exactly what to study next. Offline-first CBSE Class 9 & 10 prep with exam-syllabus pacing.",
  },
  twitter: {
    card: "summary",
    title: "Sunil Bhaiya PrepTrack — CBSE Study Tracker",
    description:
      "Offline-first CBSE Class 9 & 10 prep with exam-syllabus pacing and insights.",
  },
  manifest: "/manifest.webmanifest",
  icons: { icon: assetUrl("/icon.svg"), apple: assetUrl("/icon.svg") },
};

export const viewport = {
  themeColor: "#090909",
  viewportFit: "cover",
  width: "device-width",
  initialScale: 1,
};

import SwRegister from "../components/sw-register";

export default function RootLayout(props: LayoutProps<"/">) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${inter.variable} ${grotesk.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-[#090909] text-white">
        {props.children}
        <SwRegister />
      </body>
    </html>
  );
}
