import { GoogleGenAI } from '@google/genai';

export interface ActionItem {
  title: string;
  priority: 'high' | 'medium' | 'low';
  effort: string;
}

export interface AiStructuredPayload {
  summary: string;
  insights: string[];
  actionItems: ActionItem[];
  confidenceScore: number;
  estimatedImpact: string;
}

export interface AiGenerateResponse extends AiStructuredPayload {
  model: string;
  source: 'live' | 'demo-fallback';
  fallbackReason?: string;
  latencyMs: number;
}

const DEFAULT_MODEL = 'gemini-4-hydrogen';
const LIVE_TIMEOUT_MS = 7500;

const RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    summary: {
      type: 'string',
      description: 'A crisp 2-sentence executive synthesis of the prompt.',
    },
    insights: {
      type: 'array',
      items: { type: 'string' },
      description: '3 to 4 concrete, data-backed insights.',
    },
    actionItems: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          priority: { type: 'string', enum: ['high', 'medium', 'low'] },
          effort: { type: 'string' },
        },
        required: ['title', 'priority', 'effort'],
      },
      description: '3 prioritized next steps.',
    },
    confidenceScore: {
      type: 'number',
      description: 'Confidence score between 0 and 100.',
    },
    estimatedImpact: {
      type: 'string',
      description: 'Short quantified business or engineering impact statement.',
    },
  },
  required: ['summary', 'insights', 'actionItems', 'confidenceScore', 'estimatedImpact'],
};

export function isGeminiConfigured(): boolean {
  const key = process.env.GEMINI_API_KEY?.trim() || '';
  return Boolean(key && !key.includes('your_') && key !== 'demo');
}

function buildMockResponse(
  prompt: string,
  fallbackReason: string,
  latencyMs: number
): AiGenerateResponse {
  const topic = prompt.trim().slice(0, 72) || 'AI workflow optimization';
  return {
    summary: `Synthesized an execution blueprint for "${topic}" prioritizing sub-second latency, resilient fallback states, and high-visibility judge KPIs. The architecture pairs Gemini structured JSON generation with optimistic UI rendering.`,
    insights: [
      `Primary bottleneck for "${topic}" is cold-start latency—pre-fetching context cuts perceived wait time by 64%.`,
      'Structured JSON schema enforcement eliminates frontend parsing fragility during live demos.',
      'Dual-path execution (Live AI + cached fallback) guarantees 100% uptime under hackathon Wi-Fi or quota limits.',
    ],
    actionItems: [
      {
        title: 'Ship vertical slice with pre-seeded domain telemetry',
        priority: 'high',
        effort: '45 mins',
      },
      {
        title: 'Bind Gemini structured output to KPI & chart components',
        priority: 'high',
        effort: '30 mins',
      },
      {
        title: 'Rehearse 2-minute pitch flow using Ctrl+Shift+D safety toggle',
        priority: 'medium',
        effort: '15 mins',
      },
    ],
    confidenceScore: 94,
    estimatedImpact: '+3.4x faster prototype-to-demo velocity',
    model: DEFAULT_MODEL,
    source: 'demo-fallback',
    fallbackReason,
    latencyMs,
  };
}

export async function generateStructuredInsight(options: {
  prompt: string;
  context?: string;
  demoMode?: boolean;
}): Promise<AiGenerateResponse> {
  const start = Date.now();
  const { prompt, context, demoMode } = options;

  if (demoMode) {
    return buildMockResponse(prompt, 'Demo Mode active', Date.now() - start);
  }

  if (!isGeminiConfigured()) {
    return buildMockResponse(
      prompt,
      'GEMINI_API_KEY not configured — serving realistic fallback',
      Date.now() - start
    );
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const fullInput = context
    ? `Context: ${context}\n\nUser Prompt: ${prompt}`
    : prompt;

  try {
    const interactionPromise = ai.interactions.create({
      model: DEFAULT_MODEL,
      system_instruction:
        'You are a Principal AI Product Strategist helping builders ship winning hackathon solutions. Always respond with concise, high-signal, concrete JSON matching the requested schema.',
      input: fullInput,
      store: false,
      response_format: {
        type: 'text',
        mime_type: 'application/json',
        schema: RESPONSE_SCHEMA,
      },
    });

    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Gemini request exceeded 7.5s timeout')), LIVE_TIMEOUT_MS);
    });

    const interaction = await Promise.race([interactionPromise, timeoutPromise]);
    const rawText = interaction.output_text;

    if (!rawText) {
      throw new Error('Empty output_text from Gemini Interactions API');
    }

    const parsed = JSON.parse(rawText) as AiStructuredPayload;
    return {
      summary: parsed.summary || 'Generated insight summary.',
      insights: Array.isArray(parsed.insights) ? parsed.insights : [],
      actionItems: Array.isArray(parsed.actionItems) ? parsed.actionItems : [],
      confidenceScore:
        typeof parsed.confidenceScore === 'number' ? parsed.confidenceScore : 90,
      estimatedImpact: parsed.estimatedImpact || 'High hackathon impact',
      model: DEFAULT_MODEL,
      source: 'live',
      latencyMs: Date.now() - start,
    };
  } catch (error) {
    const reason =
      error instanceof Error ? error.message : 'Upstream Gemini error';
    return buildMockResponse(prompt, reason, Date.now() - start);
  }
}
