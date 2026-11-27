import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { healthRouter } from './routes/health.js';
import { aiRouter } from './routes/ai.js';

const app = express();
const port = Number(process.env.PORT) || 4000;
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
const allowedOrigins = Array.from(
  new Set([clientUrl, 'http://localhost:5173', 'http://127.0.0.1:5173'])
);

app.disable('x-powered-by');

// Security headers for API responses
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none'");
  next();
});

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error('Origin not allowed by CORS policy'));
    },
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

app.use(express.json({ limit: '256kb' }));

// Lightweight in-memory sliding-window rate limiter for AI endpoints
const RATE_WINDOW_MS = 60_000;
const RATE_MAX_REQUESTS = 25;
const rateBuckets = new Map<string, number[]>();

function aiRateLimiter(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
): void {
  const ip = req.ip || 'local';
  const now = Date.now();
  const recent = (rateBuckets.get(ip) ?? []).filter((ts) => now - ts < RATE_WINDOW_MS);

  if (recent.length >= RATE_MAX_REQUESTS) {
    res.status(429).json({
      error: 'Rate limit exceeded for optional AI endpoints. Core local sanitization remains unaffected.',
    });
    return;
  }

  recent.push(now);
  rateBuckets.set(ip, recent);
  next();
}

app.use('/api/health', healthRouter);
app.use('/api/ai', aiRateLimiter, aiRouter);

app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    const isPayloadTooLarge =
      'type' in err && (err as { type?: string }).type === 'entity.too.large';
    const isCorsError = err.message.includes('CORS');
    const status = isPayloadTooLarge ? 413 : isCorsError ? 403 : 500;

    // Never log request payloads or expose stack traces to browser
    console.error(`[server] Request failed (${status}): ${err.message}`);
    res.status(status).json({
      error: isPayloadTooLarge
        ? 'Request payload exceeds 256 KB limit.'
        : isCorsError
          ? 'Origin rejected by CORS policy.'
          : 'Unable to complete request safely.',
    });
  }
);

app.listen(port, () => {
  console.log(`[server] PII GUARD API ready at http://localhost:${port}`);
});
