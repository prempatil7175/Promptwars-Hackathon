# Hackathon Starter Template

An ultra-fast, **demo-proof** full-stack AI web app starter built for 24-hour hackathons. Clone it, run `npm run dev`, and ship a polished dark-mode AI product without getting stuck on auth walls, empty dashboards, or flaky live API calls.

## Key Capabilities

- **Monorepo Dev Experience:** Single `npm run dev` boots the React + Vite frontend (`:5173`) and Express + TypeScript backend (`:4000`) concurrently.
- **Unbreakable Demo Mode (`Ctrl+Shift+D`):** Global `DemoModeContext` + `withDemoFallback(liveFn, mockData)` automatically falls back to realistic mock data if an API/LLM call fails, rate-limits, or exceeds 8 seconds—showing a subtle toast instead of a crash screen.
- **Instant Demo Login:** Sleek Auth modal with Supabase Auth support plus a one-click **"Continue as Demo User"** button so judges never stall on signup screens.
- **Pre-Wired Gemini API (`@google/genai`):** Express `/api/ai/generate` endpoint using `gemini-4-hydrogen` Interactions API with structured JSON `response_format` and automatic mock fallback when `GEMINI_API_KEY` is absent.
- **Polished Dark-Mode SaaS Shell:** Collapsible sidebar (`Dashboard`, `AI Playground`, `Analytics`, `Settings`), Recharts visualizations, Framer Motion transitions, skeleton loaders, and toast notifications.
- **Antigravity-Native Configuration:** Includes `AGENTS.md` plus `.agents/skills/rapid-feature` and `.agents/skills/pitch-pack`.

## Quick Start

```bash
# 1. Install root, client, and server dependencies
npm run install:all

# 2. (Optional) Copy env templates to configure Gemini & Supabase
cp client/.env.example client/.env
cp server/.env.example server/.env

# 3. Boot frontend + backend together
npm run dev
```

Open `http://localhost:5173` — works immediately out of the box even with **no `.env` keys** configured.

## Optional: Seed Supabase Demo Data

```bash
npm run seed
```

See [server/scripts/seed.ts](server/scripts/seed.ts) for the starter SQL table definitions and sample records.
