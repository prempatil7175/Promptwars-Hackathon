# Antigravity Hackathon Engineering Rulebook

You are building an AI web application under a 24-hour hackathon deadline. Follow these rules strictly on every task:

## 1. Demo-First Velocity
- Prioritize **working end-to-end judge demo flows** over over-engineering, premature abstractions, or obscure edge cases.
- Ship vertical slices (UI -> Express API -> Gemini/Mock fallback) before polishing secondary internals.

## 2. Testing Policy
- **Never write unit or integration tests unless the user explicitly asks for them.**
- Spend verification time on TypeScript compilation (`npm run typecheck`) and live end-to-end browser verification instead.

## 3. Aesthetic & UI Standards
- Build all UI with a **dark-mode-first, high-contrast, modern SaaS aesthetic** (`#09090b` canvas, subtle `1px` `white/10` borders, glass surfaces, crisp typography, `lucide-react` icons, and subtle `framer-motion` transitions).
- Never ship generic unstyled browser controls, harsh light-mode defaults, or jarring red crash screens.
- Always show **skeleton loaders** during async requests.

## 4. Zero Empty States
- **Never leave dashboards, tables, charts, or feeds empty.**
- Every new feature must ship with realistic, domain-appropriate mock/seed data in `/client/src/data/mockData.ts` (and `/server/scripts/seed.ts` when persisted) so judges immediately see a rich product.

## 5. Unbreakable Demo Resilience
- **Wrap every external API, database query, and Gemini LLM call** with `withDemoFallback(liveFn, mockData)` on the client and a deterministic mock fallback on the server.
- Respect `DemoModeContext` (`isDemoMode` / `Ctrl+Shift+D`). Any timeout (>8s), missing API key, or rate limit must gracefully degrade to realistic mock data with a subtle toast—never crash the UI.
- Preserve the one-click **"Continue as Demo User"** path in authentication flows so judges never get blocked on signup screens.

## 6. Mandatory Browser Verification
- Always verify every visual and interactive change in the **built-in browser** after running `npm run dev`.
- Inspect browser console logs and network responses, and fix **all** console or runtime errors before reporting a task complete.
