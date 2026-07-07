# 🌱 HabitFlow

A full-stack habit tracker with streaks, XP, achievements, and a virtual pet that celebrates your progress with you.

**🔗 Live demo:** [avantika029.github.io/habitflow](https://avantika029.github.io/habitflow/)

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8?logo=tailwindcss)
![Zustand](https://img.shields.io/badge/State-Zustand-orange)
![License](https://img.shields.io/badge/license-MIT-green)

<!-- 📸 Add a screenshot or short GIF of the dashboard here once you have one:
![HabitFlow dashboard](./docs/screenshot.png)
-->

## ✨ Features

**Habit tracking**
- Full CRUD for habits — emoji icon, colour, category, difficulty, and custom frequency
- One-tap complete/incomplete toggle, with confetti on completion
- Drag-and-drop reordering
- Current streak + longest streak calculation

**Gamification**
- XP system — earn XP on completion, lose it on uncheck
- Level system with XP thresholds
- 9 achievements, each with a one-time toast (never repeats after refresh)
- A draggable virtual pet with moods, blinking, speech bubbles, and accessories that unlock as you level up

**Insight & visualization**
- 12-week weekly heatmap
- Mini calendar and full calendar view
- Analytics page with completion %, streaks, and trends (Recharts)
- Per-habit detail page with stats, heatmap, and recent history

**Design**
- Two custom themes — 🌸 **Bloom** (soft pastels) and 🍂 **Forge** (warm earth tones) — plus light/dark mode
- Kawaii floating background, theme-aware
- Fully responsive 3-column dashboard that fits `100vh` with no scrollbars
- Weather widget (Open-Meteo) and an auto-refreshing "cute pictures" widget (Picsum), both geolocation/randomization-aware and hydration-safe

**Data**
- 100% client-side — all data lives in **IndexedDB**, nothing leaves your browser
- Export all data as JSON
- Clear-all-data option in Settings

## 🛠 Tech stack

| Layer | Choice |
|---|---|
| Framework | [Next.js 16](https://nextjs.org/) (App Router, Turbopack) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 (CSS-variable-based theming, no config file) |
| State | [Zustand](https://github.com/pmndrs/zustand) |
| Storage | IndexedDB via [`idb`](https://github.com/jakearchibald/idb) |
| Animation | [Framer Motion](https://www.framer.com/motion/) |
| Drag & drop | [@dnd-kit](https://dndkit.com/) |
| Charts | [Recharts](https://recharts.org/) |
| Celebration | [canvas-confetti](https://github.com/catdad/canvas-confetti) |
| Hosting | GitHub Pages (static export) via GitHub Actions |

## 🚀 Getting started

```bash
git clone https://github.com/avantika029/habitflow.git
cd habitflow
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — all data is stored locally in your browser via IndexedDB, so there's no database or backend to set up.

### Build for production

```bash
npm run build
```

This generates a fully static export in `/out`, matching what's deployed to GitHub Pages.

## 📁 Project structure

```
src/
├── app/                  # Routes (App Router)
│   ├── page.tsx          # Dashboard
│   ├── habits/           # My Habits + habit detail (query-param based)
│   ├── calendar/
│   ├── analytics/
│   └── settings/
├── components/           # UI components, grouped by feature
├── lib/
│   ├── store/            # Zustand stores (habit, ui, theme, gamification)
│   ├── db/               # IndexedDB wrapper (idb)
│   └── utils/            # Streak/XP/date helpers
└── types/                # Shared TypeScript types
```

## 🌐 Deployment

HabitFlow deploys automatically to GitHub Pages on every push to `main` via GitHub Actions (`.github/workflows/deploy.yml`), using `next build`'s static export output.

## 📄 License

MIT — feel free to fork, learn from, or build on top of this.

---

Built by [@avantika029](https://github.com/avantika029) — with Claude as a debugging partner for the trickier parts of shipping on Next.js 16 + React 19.
