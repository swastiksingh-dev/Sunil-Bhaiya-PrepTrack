<div align="center">

<img src="./app/icon.svg" width="120" height="120" alt="PrepTrack logo" />

# 📚 PrepTrack

**Sunil Bhaiya PrepTrack — the rebuilt, offline-first evolution of the original Sunil Bhaiya tracker.**

*Know exactly what to study next.*

[![Live Demo](https://img.shields.io/badge/Live-Demo-22c55e?style=for-the-badge)](https://swastiksingh-dev.github.io/Sunil-Bhaiya-PrepTrack/)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38BDF8?style=flat-square&logo=tailwind-css&logoColor=black)](https://tailwindcss.com/)
[![PWA](https://img.shields.io/badge/PWA-offline--first-6a4cf5?style=flat-square)](https://web.dev/progressive-web-apps/)

[✨ **Try the live demo**](https://swastiksingh-dev.github.io/Sunil-Bhaiya-PrepTrack/) · [🐛 Report an issue](https://github.com/swastiksingh-dev/Sunil-Bhaiya-PrepTrack/issues)

<img src="./docs/demo.gif" width="760" alt="PrepTrack tour: landing page, pace demo, dashboard and chapters" />

*Landing → pace demo → dashboard → chapters. Fully offline-capable.*

</div>

---

## What is this?

PrepTrack plans **backwards from your exam datesheet** and scopes every number
to your **real exam syllabus**. For CBSE **Class 9 & 10 — Science, Maths, and
Social Science** — each chapter breaks into finishable stages, and the tracker
tells you the one honest number that matters: **stages per day**.

- 100% **offline-first** — install it, lose signal, keep studying
- **No accounts, no servers** — progress lives on the student's own device
- **Free forever** — one-file backup moves everything to a new phone

<table>
<tr>
<td align="center">📴<br/><b>Offline-first</b><br/>Works without internet</td>
<td align="center">🔒<br/><b>Private</b><br/>Data never leaves the device</td>
<td align="center">💸<br/><b>Free forever</b><br/>No accounts, no paywalls</td>
</tr>
</table>

## Features

| Area | What you get |
| --- | --- |
| 🏠 Dashboard | Greeting band, live stats, per-subject pace cards, Today's to-do, Class 10 CBSE news |
| 📖 Chapters | Full NCERT lists — 5 stages/chapter (Class 10), 3 (Class 9); tap dots Not started → In progress → Done; out-of-syllabus guard |
| 📊 Insights & Analysis | 7-day activity, completion rings, pace-vs-target, weakest-stage callout, finish forecast, heatmap |
| 🔁 Revision queue | Stale stages resurface automatically |
| 🎯 Goals & ✅ To-Do | Weekly goal stepper with fanfare, per-profile task lists |
| 📄 Resources | 8 Competency (CBQ) PDF volumes on-device + official CBSE PYQ portal |
| ⚙️ Settings | Syllabus editor, datesheet, backup/restore, profiles, sounds, diagnostics |

## Run it locally

```bash
npm install

# Development — http://localhost:3000
# (same-Wi-Fi phone: http://<laptop-ip>:3000)
npm run dev

# Production — http://localhost:3111
npm run build
npm run start -- --port 3111
```

## Test it

```bash
node tests/e2e.mjs   # 100+ assertions: every route × mobile / tablet / desktop
```

## Deploy (GitHub Pages)

Pushes to `main` auto-deploy via [`.github/workflows/pages.yml`](.github/workflows/pages.yml).
The Pages build is a static export under `/Sunil-Bhaiya-PrepTrack` — local
dev/prod builds are unaffected.

## Project layout

- `app/` — routes (`/` landing, `/app/*` tracker), sitemap, manifest, icon
- `components/` — landing, tracker UI atoms, hero scene/video, PWA registration
- `lib/` — `storage` (localStorage `cbse_tracker_v1`), chapters, stages, planner, insights, celebrate, motion, site
- `public/pdfs/` — CBQ volumes (never precached, keeps installs light), `sw.js`
- `tests/` — Playwright suites

## Contributors

Thanks to everyone who makes PrepTrack better:

<a href="https://github.com/swastiksingh-dev/Sunil-Bhaiya-PrepTrack/graphs/contributors">
<img src="https://contrib.rocks/image?repo=swastiksingh-dev/Sunil-Bhaiya-PrepTrack" alt="PrepTrack contributors" loading="lazy" />
</a>

<table>
<tr>
<td align="center" width="200">
<a href="https://github.com/swastiksingh-dev"><img src="https://github.com/swastiksingh-dev.png" width="100" height="100" alt="Swastik Singh" loading="lazy" style="border-radius:50%" /><br/><b>Swastik Singh</b></a><br/>owner & maintainer
</td>
<td align="center" width="200">
<a href="https://github.com/sunilbhaiya200"><img src="https://github.com/sunilbhaiya200.png" width="100" height="100" alt="sunilbhaiya200" loading="lazy" style="border-radius:50%" /><br/><b>sunilbhaiya200</b></a><br/>contributor
</td>
</tr>
</table>

---

<div align="center">

© PrepTrack by Sunil Bhaiya · Study data never leaves your device.

</div>
