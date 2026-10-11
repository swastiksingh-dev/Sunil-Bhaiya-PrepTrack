import type { MetadataRoute } from "next";

/**
 * Sitemap activates the day a public domain exists: set
 * NEXT_PUBLIC_SITE_URL (e.g. https://tracker.example.com) and redeploy.
 * Until then it intentionally returns [] — no fake localhost URLs.
 */
export const dynamic = "force-static";
export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL;
  if (!base) return [];
  const routes = [
    "",
    "/app/dashboard",
    "/app/chapters",
    "/app/insights",
    "/app/analysis",
    "/app/revision",
    "/app/goals",
    "/app/resources",
    "/app/settings",
    "/app/onboarding",
  ];
  return routes.map((r) => ({ url: `${base}${r}`, lastModified: new Date() }));
}
