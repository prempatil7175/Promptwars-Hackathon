import { Router } from 'express';
import { generateStructuredInsight } from '../services/gemini.js';

export const aiRouter = Router();

aiRouter.post('/generate', async (req, res) => {
  const { prompt, context, demoMode } = req.body ?? {};

  if (typeof prompt !== 'string' || !prompt.trim()) {
    res.status(400).json({
      error: 'A non-empty string "prompt" field is required.',
    });
    return;
  }

  const result = await generateStructuredInsight({
    prompt: prompt.trim(),
    context: typeof context === 'string' ? context.trim() : undefined,
    demoMode: Boolean(demoMode),
  });

  res.json(result);
});
