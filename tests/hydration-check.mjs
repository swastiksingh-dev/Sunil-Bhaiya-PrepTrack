/** Hydration check vs dev server (:3000). Fails on any console error/pageerror. */
import { chromium } from "playwright-core";

const BASE = "http://localhost:3000";
const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";

const browser = await chromium.launch({ executablePath: EDGE, headless: true });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const page = await ctx.newPage();
const errors = [];
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text().slice(0, 220)); });
page.on("pageerror", (e) => errors.push("pageerror: " + String(e).slice(0, 220)));

for (const route of ["/", "/app/dashboard", "/app/onboarding"]) {
  await page.goto(BASE + route, { waitUntil: "networkidle", timeout: 45000 });
  await page.waitForTimeout(2500);
  console.log(`visited ${route}`);
}

await browser.close();
const hydration = errors.filter((e) => /hydration|didn't match|did not match/i.test(e));
console.log(`\nconsole errors: ${errors.length}, hydration-related: ${hydration.length}`);
for (const e of errors.slice(0, 5)) console.log(" - " + e);
process.exitCode = errors.length > 0 ? 1 : 0;
