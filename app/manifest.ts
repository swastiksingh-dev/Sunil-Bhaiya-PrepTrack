import type { MetadataRoute } from "next";
import { SITE_BASE, assetUrl } from "../lib/site";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  const start = `${SITE_BASE}/app/dashboard`;
  return {
    name: "Sunil Bhaiya PrepTrack",
    short_name: "PrepTrack",
    description: "PrepTrack — rebuilt offline-first CBSE Class 9 & 10 preparation planner by Sunil Bhaiya",
    start_url: start,
    scope: SITE_BASE ? `${SITE_BASE}/` : "/",
    display: "standalone",
    background_color: "#090909",
    theme_color: "#090909",
    icons: [
      { src: assetUrl("/icon.svg"), sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: assetUrl("/icon.svg"), sizes: "any", type: "image/svg+xml", purpose: "maskable" },
    ],
  };
}
