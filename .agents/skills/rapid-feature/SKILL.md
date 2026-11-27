---
name: rapid-feature
description: >-
  Use this skill whenever adding a new full-stack AI feature in this hackathon template.
  Enforces the 5-step vertical slice: mock-first UI -> Express route -> Gemini JSON schema
  with fallback -> withDemoFallback wiring -> live browser verification.
---

# Rapid Feature Workflow

Follow this exact 5-step sequence to ship a working, demo-proof AI feature in minutes:

## Step 1: Build the UI Component with Realistic Mock Data First
1. Define TypeScript interfaces for the feature payload in `client/src/types/index.ts`.
2. Add realistic domain seed/mock data in `client/src/data/mockData.ts` so the component never renders an empty state.
3. Build the React component in `client/src/components/` or `client/src/pages/` following the dark-mode-first SaaS palette (`#09090b` / `#111116`, `border-white/10`, `Skeleton` loading states, and subtle `framer-motion` transitions).

## Step 2: Add the Express Route
1. Create or extend a route in `server/src/routes/` (mounted in `server/src/index.ts` under `/api/...`).
2. Validate required request fields cleanly and return structured JSON.
3. Accept an optional `demoMode?: boolean` flag in request bodies so the client kill switch propagates cleanly.

## Step 3: Wire Gemini Interactions API with Structured JSON Schema & Fallback
1. Use `server/src/services/gemini.ts` (`@google/genai` with `model: "gemini-4-hydrogen"` and `client.interactions.create`).
2. Pass `response_format: { type: "text", mime_type: "application/json", schema: { ... } }` so Gemini returns deterministic structured JSON.
3. Always implement a server-side `mockFallback` generator for the route when `GEMINI_API_KEY` is missing, `demoMode === true`, or the live call times out/fails.

## Step 4: Connect Frontend with `withDemoFallback`
1. Add a typed helper in `client/src/lib/api.ts`.
2. Wrap the live fetch call with `withDemoFallback(liveFn, mockData, { isDemoMode, onFallback, label })` inside your component or hook.
3. Show `Skeleton` loaders while pending and use `useToast()` to confirm actions or notify subtly on fallback—never display raw stack traces or red error screens.

## Step 5: Verify in the Built-In Browser
1. Run `npm run typecheck` to confirm zero TypeScript errors across `client` and `server`.
2. Ensure `npm run dev` is running, open the app in the built-in browser, and test:
   - The happy path in both **Demo Mode** and **Live AI Mode** (`Ctrl+Shift+D`).
   - Loading skeleton transitions and toast notifications.
   - Browser console logs for **zero** runtime or network crash errors.
