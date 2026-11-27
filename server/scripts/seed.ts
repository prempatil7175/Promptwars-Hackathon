/**
 * Database Seed Script Template for Supabase / Postgres
 *
 * Run with: npm run seed
 *
 * Quick SQL Setup (paste into Supabase SQL Editor if creating starter tables):
 *
 *   create table if not exists public.demo_projects (
 *     id text primary key,
 *     name text not null,
 *     status text not null,
 *     latency_ms integer not null default 320,
 *     confidence integer not null default 92,
 *     created_at timestamptz not null default now()
 *   );
 *
 *   create table if not exists public.ai_generations (
 *     id text primary key,
 *     prompt text not null,
 *     summary text not null,
 *     model text not null default 'gemini-4-hydrogen',
 *     source text not null default 'demo-fallback',
 *     created_at timestamptz not null default now()
 *   );
 */

import 'dotenv/config';
import { supabase, isSupabaseConfigured } from '../src/lib/supabase.js';

const DEMO_PROJECTS = [
  {
    id: 'proj-pulse-ai',
    name: 'PulseAI Triage Copilot',
    status: 'live',
    latency_ms: 410,
    confidence: 96,
  },
  {
    id: 'proj-finops-guard',
    name: 'FinOps Anomaly Radar',
    status: 'live',
    latency_ms: 365,
    confidence: 93,
  },
  {
    id: 'proj-supply-twin',
    name: 'SupplyChain Digital Twin',
    status: 'staging',
    latency_ms: 520,
    confidence: 89,
  },
];

const DEMO_GENERATIONS = [
  {
    id: 'gen-seed-001',
    prompt: 'Design an AI triage workflow that cuts ER intake wait times by 40%',
    summary:
      'Deploy a structured symptom extraction pipeline with Gemini 4 Hydrogen paired with human-in-the-loop priority routing.',
    model: 'gemini-4-hydrogen',
    source: 'live',
  },
  {
    id: 'gen-seed-002',
    prompt: 'Generate a 24-hour GTM launch checklist for an enterprise AI copilot',
    summary:
      'Focus on 3 design-partner workflows, zero-friction demo login, and measurable ROI telemetry.',
    model: 'gemini-4-hydrogen',
    source: 'demo-fallback',
  },
];

async function seed() {
  console.log('[seed] Starting Hackathon database seed...');

  if (!isSupabaseConfigured || !supabase) {
    console.log(
      '[seed] Supabase credentials not configured in server/.env. Skipping remote write.'
    );
    console.log(
      '[seed] Fill SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in server/.env, create the tables above, and re-run `npm run seed`.'
    );
    console.log(`[seed] Preview: ${DEMO_PROJECTS.length} projects & ${DEMO_GENERATIONS.length} AI runs ready.`);
    return;
  }

  const { error: projectsError } = await supabase
    .from('demo_projects')
    .upsert(DEMO_PROJECTS, { onConflict: 'id' });

  if (projectsError) {
    console.error('[seed] Failed seeding demo_projects:', projectsError.message);
    process.exitCode = 1;
    return;
  }

  const { error: genError } = await supabase
    .from('ai_generations')
    .upsert(DEMO_GENERATIONS, { onConflict: 'id' });

  if (genError) {
    console.error('[seed] Failed seeding ai_generations:', genError.message);
    process.exitCode = 1;
    return;
  }

  console.log(
    `[seed] Successfully seeded ${DEMO_PROJECTS.length} demo_projects and ${DEMO_GENERATIONS.length} ai_generations.`
  );
}

seed().catch((err) => {
  console.error('[seed] Unexpected error:', err);
  process.exitCode = 1;
});
