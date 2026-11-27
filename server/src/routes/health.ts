import { Router } from 'express';
import { isGeminiConfigured } from '../services/gemini.js';
import { isSupabaseConfigured } from '../lib/supabase.js';

export const healthRouter = Router();

healthRouter.get('/', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      geminiConfigured: isGeminiConfigured(),
      supabaseConfigured: isSupabaseConfigured,
    },
  });
});
