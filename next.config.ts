import type { NextConfig } from "next";

/** GitHub Pages serves the repo from a subpath with static files only, so the
 * Pages build (DEPLOY_TARGET=pages) switches to a full static export under
 * NEXT_PUBLIC_BASE_PATH. Local dev/prod builds are untouched. */
const pagesBuild = process.env.DEPLOY_TARGET === "pages";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.1.4", "192.168.1.11"],
  ...(pagesBuild
    ? { output: "export", ...(basePath ? { basePath } : {}), trailingSlash: true }
    : {
        async headers() {
          return [
            {
              source: "/pdfs/:path*",
              headers: [
                { key: "Content-Type", value: "application/pdf" },
                { key: "Content-Disposition", value: "inline" },
              ],
            },
            {
              source: "/sw.js",
              headers: [{ key: "Cache-Control", value: "no-cache, no-store, must-revalidate" }],
            },
          ];
        },
      }),
};

export default nextConfig;
