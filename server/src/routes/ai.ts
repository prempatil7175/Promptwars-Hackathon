import { Router } from 'express';
import {
  detectResidualPiiServerGuard,
  generateStructuredInsight,
  generateSyntheticSampleDocument,
  runSanitizedComplianceAudit,
  type SyntheticTemplateType,
} from '../services/gemini.js';

export const aiRouter = Router();

const VALID_TEMPLATES = new Set<SyntheticTemplateType>([
  'support-ticket',
  'clinical-note',
  'hr-resume',
  'mixed-csv',
]);

aiRouter.post('/generate', async (req, res) => {
  const { prompt, context, demoMode } = req.body ?? {};

  if (typeof prompt !== 'string' || !prompt.trim()) {
    res.status(400).json({
      error: 'A non-empty string "prompt" field is required.',
    });
    return;
  }

  if (prompt.length > 4000 || (typeof context === 'string' && context.length > 4000)) {
    res.status(413).json({
      error: 'Prompt or context exceeds the 4,000-character limit.',
    });
    return;
  }

  const combined = `${prompt}\n${typeof context === 'string' ? context : ''}`;
  const residualReason = detectResidualPiiServerGuard(combined);
  if (residualReason) {
    res.status(422).json({
      error: `Privacy boundary blocked request: ${residualReason}. Remove raw PII before calling AI.`,
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

aiRouter.post('/synthetic-sample', async (req, res) => {
  const { templateType, demoMode } = req.body ?? {};

  if (typeof templateType !== 'string' || !VALID_TEMPLATES.has(templateType as SyntheticTemplateType)) {
    res.status(400).json({
      error: 'Invalid templateType. Expected support-ticket, clinical-note, hr-resume, or mixed-csv.',
    });
    return;
  }

  const result = await generateSyntheticSampleDocument({
    templateType: templateType as SyntheticTemplateType,
    demoMode: Boolean(demoMode),
  });

  res.json(result);
});

aiRouter.post('/compliance-audit', async (req, res) => {
  const { sanitizedText, mode, stats, demoMode } = req.body ?? {};

  if (typeof sanitizedText !== 'string' || !sanitizedText.trim()) {
    res.status(400).json({
      error: 'A non-empty "sanitizedText" string is required.',
    });
    return;
  }

  if (sanitizedText.length > 40000) {
    res.status(413).json({
      error: 'Sanitized compliance audit excerpt exceeds 40,000 characters.',
    });
    return;
  }

  const residualReason = detectResidualPiiServerGuard(sanitizedText);
  if (residualReason) {
    res.status(422).json({
      error: `Privacy boundary blocked audit: ${residualReason}. Re-sanitize locally before requesting AI audit.`,
    });
    return;
  }

  const safeMode =
    mode === 'full' || mode === 'partial' || mode === 'pseudonymize' ? mode : 'full';
  const safeStats = {
    totalDetected: typeof stats?.totalDetected === 'number' ? stats.totalDetected : 0,
    rejectedFalsePositives:
      typeof stats?.rejectedFalsePositives === 'number' ? stats.rejectedFalsePositives : 0,
    characterCount:
      typeof stats?.characterCount === 'number'
        ? stats.characterCount
        : sanitizedText.length,
  };

  const result = await runSanitizedComplianceAudit({
    sanitizedText,
    mode: safeMode,
    stats: safeStats,
    demoMode: Boolean(demoMode),
  });

  res.json(result);
});
