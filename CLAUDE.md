# CLAUDE.md

## Project Overview

Settlers 10th Anniversary Battle Tracker — a web app for tracking Settlers of Catan match results, statistics, and live games between two players. Features real-time match tracking, leaderboards, match history, and data export.

## Tech Stack

- **Framework:** React 19 with Vite 7
- **Language:** JavaScript (ES modules, JSX)
- **Styling:** Tailwind CSS 4 with custom medieval/gold theme via CSS variables
- **Database:** Firebase Firestore (real-time sync via `onSnapshot`)
- **Icons:** Lucide React
- **Dates:** date-fns with Norwegian (nb) locale
- **No TypeScript, no linting, no testing framework configured**

## Commands

```bash
npm run dev      # Start Vite dev server (localhost:5173)
npm run build    # Production build to dist/
npm run preview  # Preview production build locally
```

## Project Structure

```
src/
├── components/          # React components (all .jsx)
│   ├── Dashboard.jsx    # Home view with stats & recent matches
│   ├── LiveMatch.jsx    # Real-time match tracking with timer/events
│   ├── Leaderboard.jsx  # Player standings
│   ├── MatchHistory.jsx # Historical matches with filters
│   ├── NewMatchForm.jsx # Manual match registration
│   ├── MatchCard.jsx    # Match display (compact & full views)
│   ├── BattleReportModal.jsx # Post-match analysis modal
│   ├── MapSelector.jsx  # Map selection UI
│   ├── Header.jsx       # Top nav + bottom nav bar
│   └── Settings.jsx     # Player & map management
├── hooks/
│   ├── useFirestore.js  # Primary data layer — all Firestore CRUD + real-time listeners
│   ├── useGameData.js   # Legacy localStorage hook (unused)
│   └── useLocalStorage.js
├── data/
│   ├── buildings.js     # Settlers building types
│   └── maps.js          # Default map list
├── firebase.js          # Firebase init & Firestore config
├── App.jsx              # Root component, view-based navigation via currentView state
├── main.jsx             # Entry point
└── index.css            # Tailwind imports + custom theme variables + component classes
```

## Key Architecture Decisions

- **No React Router** — navigation is managed via `currentView` state in App.jsx
- **useFirestore hook** is the single source of truth for all data (players, matches, maps, liveMatch)
- **Real-time listeners** (`onSnapshot`) keep UI in sync with Firestore automatically
- **Firestore collections:** `players`, `matches`, `maps`, `liveMatch` (single doc `current`)
- **Scoring:** Win=+1, Draw=+0.5, AI Elimination=+0.5, AI Death=-1, plus historical points

## Styling Conventions

- Tailwind utility classes + custom classes defined in `index.css` (`.card`, `.card-elevated`, `.btn-primary`)
- Theme colors via CSS variables: `--color-accent` (gold #c9a227), `--color-bg-primary` (#0d0d0d), `--color-bg-secondary` (#161616)
- Extended Tailwind theme in `tailwind.config.js` with Settlers-themed colors (gold, brown, parchment)
- Mobile-first with safe area padding (`pb-safe`)

## Naming Conventions

- Components: PascalCase filenames (e.g., `LiveMatch.jsx`)
- Hooks: camelCase with `use` prefix (e.g., `useFirestore.js`)
- CSS classes: kebab-case (e.g., `.card-elevated`)
