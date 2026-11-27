---
name: pitch-pack
description: >-
  Use this skill before hackathon submission or demo judging to scan the current
  codebase and generate a judge-ready README.md, a Mermaid architecture diagram,
  and a timed 2-minute live demo script mapped to real working routes.
---

# Hackathon Pitch Pack Generator

Use this workflow to turn the working codebase into a crisp, judge-ready submission package.

## Step 1: Audit the Live Codebase
Inspect the actual implemented files before writing any documentation:
1. Read `package.json`, `client/src/App.tsx`, `client/src/pages/*`, and `client/src/context/*` to inventory every working UI view, interactive control, and keyboard shortcut.
2. Read `server/src/index.ts`, `server/src/routes/*`, `server/src/services/gemini.ts`, and `server/scripts/seed.ts` to inventory every live API endpoint, AI model, and persistence integration.

## Step 2: Generate a Mermaid Architecture Diagram
Create a `flowchart LR` (or `flowchart TD`) Mermaid diagram that accurately reflects **only** implemented modules:
- Client shell (`React + Vite + Tailwind`, `DemoModeContext`, `AuthContext`, `withDemoFallback`)
- Express API gateway (`/api/health`, `/api/ai/generate`, and any feature routes)
- External services (`@google/genai` -> `gemini-4-hydrogen`, `Supabase Auth/DB`) and fallback paths.
- Quote any node labels containing parentheses or special characters (e.g., `api["Express API (/api/ai/generate)"]`).

## Step 3: Write a Judge-Ready `README.md`
Update `README.md` at the repo root with:
1. **Elevator Pitch** (1–2 sentences: problem, AI solution, measurable impact).
2. **Why It's Unbreakable** (Demo Mode `Ctrl+Shift+D`, 8s timeout auto-fallback, Instant Demo User login).
3. **Architecture Diagram** (the Mermaid diagram from Step 2).
4. **Tech Stack & Local Quickstart** (exact commands and `.env` setup).
5. **Implemented Endpoints & Views** (table mapping UI tabs to Express routes).

## Step 4: Output a Timed 2-Minute Live Demo Script
Write a second-by-second **2-Minute Judge Demo Script** (either in `DEMO_SCRIPT.md` or inside `README.md` as requested) mapped strictly to verified UI buttons, routes, and fallback triggers:
- **0:00 – 0:25 | Hook & Instant Entry**: Click **"Continue as Demo User"** to bypass auth friction and land on the populated Dashboard.
- **0:25 – 1:10 | Core AI Magic**: Navigate to **AI Playground** (or feature view), run a live prompt, and highlight the structured JSON output.
- **1:10 – 1:40 | Insights & Reliability**: Show **Analytics** visualizations and press `Ctrl+Shift+D` to demonstrate zero-downtime Demo Mode failover.
- **1:40 – 2:00 | Wrap & Impact**: Summarize architecture, Supabase readiness, and next steps.
