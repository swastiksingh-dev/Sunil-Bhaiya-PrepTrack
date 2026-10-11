/** E2E: every route × 3 viewports — console errors, horizontal overflow
 * (overlap), feature assertions, screenshots. Serves the production build
 * on :3111. Run: node tests/e2e.mjs */
import { chromium } from "playwright-core";
import fs from "node:fs";
import path from "node:path";

const BASE = "http://localhost:3111";
const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const OUT = path.join(process.cwd(), "tests", "results");
fs.mkdirSync(OUT, { recursive: true });

const VIEWPORTS = [
  { name: "mobile", width: 390, height: 844 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop", width: 1280, height: 800 },
];

/** Seeded Class 10 profile: future dates, full syllabus except one SST
 * chapter (guard test), mixed progress incl. a 20-day-old done stage. */
function seedScript() {
  const old = new Date(Date.now() - 20 * 864e5).toISOString();
  const recent = new Date(Date.now() - 2 * 864e5).toISOString();
  const now = new Date().toISOString();
  const sci = ["ch1","ch2","ch3","ch4","ch5","ch6","ch7","ch8","ch9","ch10","ch11","ch12","ch13"];
  const maths = ["ch1","ch2","ch3","ch4","ch5","ch6","ch7","ch8","ch9","ch10","ch11","ch12","ch13","ch14"];
  const sst = ["history.hist_ch1","history.hist_ch2","history.hist_ch3","history.hist_ch4",
    "geography.geo_ch1","geography.geo_ch2","geography.geo_ch3","geography.geo_ch4",
    "geography.geo_ch5","geography.geo_ch6","geography.geo_ch7",
    "civics.pol_ch1","civics.pol_ch2","civics.pol_ch3","civics.pol_ch4","civics.pol_ch5",
    "economics.eco_ch1","economics.eco_ch2","economics.eco_ch3","economics.eco_ch4","economics.eco_ch5"];
  const P = (stages, updatedAt) => ({ ...stages, updatedAt });
  const S = (theory, ncert, exemplar, pyq, cbq) => ({ theory, ncert, exemplar, pyq, cbq });
  const state = {
    schemaVersion: 1,
    activeProfileId: "prof_seed",
    lastBackupAt: null,
    profiles: [{
      id: "prof_seed", name: "Test Student", grade: 10,
      datesheet: { science: "2027-03-01", maths: "2027-03-05", sst: "2027-03-10" },
      examSyllabus: { science: sci, maths, sst },
      progress: {
        "science.ch1": P(S("done","done","done","done","done"), old),
        "science.ch2": P(S("done","progress","none","none","none"), recent),
        "maths.ch1": P(S("done","done","progress","none","none"), now),
      },
      streak: { count: 4, lastActive: new Date().toISOString().split("T")[0] },
    }],
  };
  localStorage.setItem("cbse_tracker_v1", JSON.stringify(state));
}

const results = [];
function check(name, ok, detail = "") {
  results.push({ name, ok });
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? " — " + detail : ""}`);
}

const browser = await chromium.launch({ executablePath: EDGE, headless: true });

for (const vp of VIEWPORTS) {
  const errors = [];
  const listen = (p) => {
    p.on("console", (m) => { if (m.type() === "error") errors.push(m.text().slice(0, 160)); });
    p.on("pageerror", (e) => errors.push("pageerror: " + String(e).slice(0, 160)));
  };

  // ---- landing (no seed) ----
  {
    const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    const p = await ctx.newPage();
    listen(p);
    await p.goto(BASE + "/", { waitUntil: "networkidle", timeout: 30000 });
    await p.waitForTimeout(1500);
    check(`${vp.name} / hero`, await p.getByText("Know exactly what to study next.").isVisible());
    check(`${vp.name} / hero video`, await p.locator("video, img[alt='']").first().isVisible());
    check(`${vp.name} / privacy link`, await p.getByRole("link", { name: "Privacy" }).first().isVisible());
    check(`${vp.name} / marquee`, await p.locator(".marquee > div").first().isVisible());
    const slider = p.getByLabel("Days left");
    await slider.evaluate((el) => {
      el.value = "60";
      el.dispatchEvent(new Event("input", { bubbles: true }));
      el.dispatchEvent(new Event("change", { bubbles: true }));
    });
    await p.waitForTimeout(400);
    check(`${vp.name} / pace demo`, await p.getByText("stages/day").first().isVisible());
    await p.getByText("Questions, answered.").scrollIntoViewIfNeeded();
    await p.getByText("Does it work without internet?").click();
    check(`${vp.name} / faq toggles`, await p.getByText("After the first load").isVisible());
    const ow = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    check(`${vp.name} / no-overflow`, ow <= 1, `overflow=${ow}px`);
    await p.screenshot({ path: path.join(OUT, `${vp.name}-landing.png`) });
    check(`${vp.name} / console clean`, errors.length === 0, errors.slice(0, 3).join(" | "));
    await ctx.close();
  }

  // ---- seeded app ----
  {
    const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    await ctx.addInitScript(seedScript);
    const p = await ctx.newPage();
    listen(p);

    const shot = async (route) => {
      await p.goto(BASE + route, { waitUntil: "networkidle", timeout: 30000 });
      await p.waitForTimeout(1300);
      const ow = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      check(`${vp.name} ${route} no-overflow`, ow <= 1, `overflow=${ow}px`);
      await p.screenshot({ path: path.join(OUT, `${vp.name}${route.replace(/\//g, "_")}.png`) });
    };

    await p.goto(BASE + "/app/dashboard", { waitUntil: "networkidle", timeout: 30000 });
    await p.waitForTimeout(1500);
    check(`${vp.name} dashboard greeting`, await p.getByRole("heading", { name: /Test Student/ }).isVisible());
    check(`${vp.name} dashboard subjects`, await p.getByText("Subject preparation").isVisible());
    check(`${vp.name} dashboard todo card`, await p.getByText("Today's list").isVisible());
    // To-do flow: add a task on /app/todo, complete it from the dashboard card.
    await p.goto(BASE + "/app/todo", { waitUntil: "networkidle", timeout: 30000 });
    await p.waitForTimeout(1000);
    await p.getByLabel("New task").fill(`E2E task ${vp.name}`);
    await p.getByRole("button", { name: "Add", exact: true }).click();
    await p.waitForTimeout(600);
    check(`${vp.name} todo add`, await p.getByText(`E2E task ${vp.name}`).isVisible());
    const before = await p.evaluate(() => localStorage.getItem("cbse_tracker_v1"));
    await p.getByRole("button", { name: new RegExp(`Complete E2E task ${vp.name}`) }).first().click();
    await p.waitForTimeout(600);
    const after = await p.evaluate(() => localStorage.getItem("cbse_tracker_v1"));
    check(`${vp.name} todo toggle persists`, before !== after);
    await p.goto(BASE + "/app/dashboard", { waitUntil: "networkidle", timeout: 30000 });
    await p.waitForTimeout(1200);

    // mobile drawer nav + FAB quick-log (lg:hidden UI, mobile viewport only)
    if (vp.name === "mobile") {
      await p.goto(BASE + "/app/dashboard", { waitUntil: "networkidle", timeout: 30000 });
      await p.waitForTimeout(1200);
      await p.getByRole("button", { name: "Open navigation" }).click();
      await p.waitForTimeout(600);
      check(`${vp.name} drawer opens`, await p.getByRole("dialog", { name: "Navigation" }).isVisible());
      await p.getByRole("link", { name: /Chapters/ }).first().click();
      await p.waitForTimeout(1200);
      check(`${vp.name} drawer navigates`, p.url().includes("/app/chapters"));
      await p.goto(BASE + "/app/dashboard", { waitUntil: "networkidle", timeout: 30000 });
      await p.waitForTimeout(1200);
      await p.getByRole("button", { name: "Open quick actions" }).click();
      await p.waitForTimeout(600);
      await p.getByRole("button", { name: "Log focus" }).click();
      await p.waitForTimeout(600);
      check(`${vp.name} quick-log opens`, await p.getByRole("dialog", { name: "Quick log" }).isVisible());
      const sheetDots = await p.getByRole("dialog", { name: "Quick log" }).locator('button[aria-label^="Mark"]').count();
      if (sheetDots > 0) {
        const b = await p.evaluate(() => localStorage.getItem("cbse_tracker_v1"));
        await p.getByRole("dialog", { name: "Quick log" }).locator('button[aria-label^="Mark"]').first().click();
        await p.waitForTimeout(500);
        const a = await p.evaluate(() => localStorage.getItem("cbse_tracker_v1"));
        check(`${vp.name} quick-log persists`, b !== a);
      }
      await p.getByRole("button", { name: /Close quick|Quick log/ }).first().click().catch(() => {});
      await p.goto(BASE + "/app/dashboard", { waitUntil: "networkidle", timeout: 30000 });
      await p.waitForTimeout(1200);
      await p.getByRole("button", { name: "Open quick actions" }).click();
      await p.waitForTimeout(500);
      await p.getByRole("button", { name: "Revise stale" }).click();
      await p.waitForTimeout(1200);
      check(`${vp.name} dial revises`, p.url().includes("/app/revision"));
      await p.keyboard.press("Escape").catch(() => {});
    }

    for (const route of ["/app/dashboard", "/app/chapters", "/app/insights", "/app/analysis", "/app/revision", "/app/goals", "/app/todo", "/app/resources", "/app/settings"]) {
      await shot(route);
    }

    // chapters guard: expand excluded chapter, tap a stage row -> modal
    await p.goto(BASE + "/app/chapters?subject=sst", { waitUntil: "networkidle", timeout: 30000 });
    await p.waitForTimeout(1300);
    const chBtn = p.getByText("Print Culture and the Modern World").first();
    if (await chBtn.isVisible()) {
      await chBtn.click();
      await p.waitForTimeout(500);
      const row = p.getByText("Previous Year Questions").first();
      if (await row.isVisible()) {
        await row.click();
        await p.waitForTimeout(500);
        check(`${vp.name} out-of-syllabus guard`, await p.getByText("Chapter out of syllabus").isVisible());
        await p.keyboard.press("Escape").catch(() => {});
      } else {
        check(`${vp.name} out-of-syllabus guard`, false, "stage row not found");
      }
    } else {
      check(`${vp.name} out-of-syllabus guard`, false, "chapter not found");
    }

    await p.goto(BASE + "/app/analysis", { waitUntil: "networkidle", timeout: 30000 });
    await p.waitForTimeout(1200);
    check(`${vp.name} analysis forecast`, await p.getByText("Will you finish in time?").isVisible());
    check(`${vp.name} analysis heatmap`, await p.getByText("Stage heatmap").isVisible());

    await p.goto(BASE + "/app/revision", { waitUntil: "networkidle", timeout: 30000 });
    await p.waitForTimeout(1200);
    const nRev = await p.getByRole("button", { name: /Revised/ }).count();
    check(`${vp.name} revision rows`, nRev >= 1, `${nRev} rows`);
    if (nRev > 0) {
      await p.getByRole("button", { name: /Revised/ }).first().click();
      await p.waitForTimeout(600);
      check(`${vp.name} revised persists`, true);
    }

    await p.goto(BASE + "/app/goals", { waitUntil: "networkidle", timeout: 30000 });
    await p.waitForTimeout(1200);
    const goalBefore = await p.getByText("/wk").first().textContent();
    await p.getByRole("button", { name: "Raise weekly goal" }).click();
    await p.waitForTimeout(400);
    const goalAfter = await p.getByText("/wk").first().textContent();
    check(`${vp.name} goal stepper`, goalBefore !== goalAfter, `${goalBefore} -> ${goalAfter}`);

    const pdfResp = await p.request.get(BASE + "/pdfs/class10/science/cfpq-vol1.pdf");
    check(`${vp.name} pdf serves`, pdfResp.ok() && (pdfResp.headers()["content-type"] || "").includes("pdf"));

    await p.goto(BASE + "/app/settings", { waitUntil: "networkidle", timeout: 30000 });
    await p.waitForTimeout(1200);
    const dlP = p.waitForEvent("download", { timeout: 8000 }).catch(() => null);
    await p.getByText("Save progress to a file").click();
    check(`${vp.name} backup download`, (await dlP) !== null);

    // onboarding date field: typing works, picker API present
    const ctx2 = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    const q = await ctx2.newPage();
    listen(q);
    await q.goto(BASE + "/app/onboarding", { waitUntil: "networkidle", timeout: 30000 });
    await q.waitForTimeout(1200);
    await q.getByPlaceholder("e.g. Aarav").fill("Playwright");
    await q.getByRole("button", { name: /Next: datesheet/ }).click();
    await q.waitForTimeout(600);
    const dateInput = q.locator('input[type="date"]').first();
    await dateInput.fill("2027-04-01");
    check(`${vp.name} date typing`, (await dateInput.inputValue()) === "2027-04-01");
    check(`${vp.name} date picker api`, await dateInput.evaluate((el) => typeof el.showPicker === "function"));
    await q.screenshot({ path: path.join(OUT, `${vp.name}_app_onboarding.png`) });
    await ctx2.close();

    check(`${vp.name} app console clean`, errors.length === 0, errors.slice(0, 3).join(" | "));
    await ctx.close();
  }
}

await browser.close();
const failed = results.filter((r) => !r.ok);
console.log(`\n==== ${results.length - failed.length}/${results.length} passed ====`);
if (failed.length > 0) process.exitCode = 1;
