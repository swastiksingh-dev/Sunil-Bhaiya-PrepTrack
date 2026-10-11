/** Deployment base path — "" locally, "/Sunil-Bhaiya-PrepTrack" on GitHub
 * Pages. Single seam for every hand-built absolute URL (PDFs, service
 * worker, manifest) so subdirectory hosting never breaks a link. Inlined
 * at build time from NEXT_PUBLIC_BASE_PATH. */
export const SITE_BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function assetUrl(p: string): string {
  return `${SITE_BASE}${p.startsWith("/") ? p : `/${p}`}`;
}
